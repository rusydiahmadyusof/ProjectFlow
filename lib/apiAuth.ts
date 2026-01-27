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
  } else {
    // Try to get access token from cookies
    // Supabase stores session in cookies with pattern: sb-<project-ref>-auth-token
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Find Supabase auth token cookie
    const authCookie = allCookies.find((cookie) =>
      cookie.name.includes('auth-token') || cookie.name.includes('access-token')
    );
    
    if (authCookie) {
      try {
        // Supabase stores tokens in JSON format in cookies
        const cookieData = JSON.parse(authCookie.value);
        accessToken = cookieData.access_token || cookieData.accessToken || null;
      } catch {
        // If not JSON, might be the token directly
        accessToken = authCookie.value;
      }
    } else {
      // Try to find the session cookie directly
      // Supabase uses cookie names like: sb-<project-ref>-auth-token
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
      if (projectRef) {
        const sessionCookie = cookieStore.get(`sb-${projectRef}-auth-token`);
        if (sessionCookie) {
          try {
            const sessionData = JSON.parse(sessionCookie.value);
            accessToken = sessionData.access_token || null;
          } catch {
            // Cookie might be in different format
          }
        }
      }
    }
  }

  // If no access token found, return unauthorized
  if (!accessToken) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Create Supabase client and verify the token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // Verify the user is valid
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
    const supabase = createClient(supabaseUrl, supabaseAnonKey) as ReturnType<typeof createClient>;
    return { user: null, supabase };
  }

  return authResult;
}
