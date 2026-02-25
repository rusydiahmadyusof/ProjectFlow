import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';
import { ActivityFeedItem } from '@/components/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }

    // Fetch activities from database
    const { data: activities, error } = await supabaseAdmin
      .from('activities')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity feed', details: error.message },
        { status: 500 }
      );
    }

    // Transform activities to ActivityFeedItems
    // Note: The activities table stores user as a string, but ActivityFeedItem expects an object
    // We'll need to parse it or fetch team member data if needed
    const activityFeedItems: ActivityFeedItem[] = (activities || []).map((activity) => {
      // Try to parse user if it's JSON, otherwise treat as string
      let userObj: ActivityFeedItem['user'] | undefined;
      try {
        const parsedUser = typeof activity.user === 'string' ? JSON.parse(activity.user) : activity.user;
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.name) {
          userObj = parsedUser;
        }
      } catch {
        // If parsing fails, user is just a string - we'll leave userObj undefined
      }

      // Determine type based on action or use 'system' as default
      let type: ActivityFeedItem['type'] = 'system';
      const actionLower = activity.action.toLowerCase();
      if (actionLower.includes('project') || actionLower.includes('created a new project')) {
        type = 'project';
      } else if (actionLower.includes('task') || actionLower.includes('completed')) {
        type = 'task';
      } else if (actionLower.includes('team') || actionLower.includes('completed')) {
        type = 'team';
      }

      return {
        id: activity.id,
        user: userObj,
        type,
        action: activity.action,
        target: activity.target || undefined,
        details: undefined, // Activities table doesn't have details field
        time: activity.time,
        color: activity.bgColor || 'bg-primary',
        attachments: undefined, // Activities table doesn't have attachments field
      };
    });

    return NextResponse.json(activityFeedItems);
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
