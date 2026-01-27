/**
 * API Authentication Utility
 * Verifies user authentication for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

interface AuthResult {
  user: User;
  supabase: ReturnType<typeof createClient>;
}

interface AuthError {
  error: NextResponse;
}

/**
 * Get authenticated user from request
 * Checks for Supabase session token in cookies or Authorization header
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      ),
    };
  }

  // Try to get token from Authorization header first
  const authHeader = request.headers.get('authorization');
  let accessToken: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
  }

  // Create Supabase client that can read cookies
  const cookieStore = cookies();
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        // Not needed for read-only operations
      },
      remove(name: string, options: any) {
        // Not needed for read-only operations
      },
    },
  });

  // If we have an access token from header, verify it directly
  if (accessToken) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid authentication token' },
          { status: 401 }
        ),
      };
    }

    return {
      user,
      supabase: createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }),
    };
  }

  // Otherwise, get session from cookies
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session || !session.user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Verify the user is still valid
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(session.access_token);

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid authentication token' },
        { status: 401 }
      ),
    };
  }

  return {
    user,
    supabase: createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    }),
  };
}

/**
 * Require authentication middleware
 * Use this in API routes to ensure user is authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthResult | NextResponse> {
  const authResult = await getAuthenticatedUser(request);

  if ('error' in authResult) {
    return authResult.error;
  }

  return authResult;
}

/**
 * Optional authentication helper
 * Returns user if authenticated, null if not (doesn't return error)
 */
export async function getOptionalAuth(
  request: NextRequest
): Promise<{ user: User | null; supabase: ReturnType<typeof createClient> }> {
  const authResult = await getAuthenticatedUser(request);

  if ('error' in authResult) {
    // Return null user but still provide supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    return { user: null, supabase };
  }

  return authResult;
}
