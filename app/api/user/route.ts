import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { User } from '@/components/types';
import { requireAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }

    const { user: authUser } = authResult;

    // Fetch user data from team_members table using authUserId
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('name, role, avatar')
      .eq('authUserId', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user', details: error.message },
        { status: 500 }
      );
    }

    // If not found in team_members, try users table as fallback
    if (!data) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('name, role, avatar')
        .eq('id', 'current')
        .maybeSingle();

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Transform database record to match User interface
      const user: User = {
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar || '',
      };

      return NextResponse.json(user);
    }

    // Transform database record to match User interface
    const user: User = {
      name: data.name,
      role: data.role,
      avatar: data.avatar || '',
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
