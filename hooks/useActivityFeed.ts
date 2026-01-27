'use client';

import { useQuery } from '@tanstack/react-query';
import { ActivityFeedItem } from '@/components/types';
import { supabase } from '@/lib/supabase';

const fetchActivityFeed = async (): Promise<ActivityFeedItem[]> => {
  // Get the current session to include access token
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add Authorization header if we have a session
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  const response = await fetch('/api/activity-feed', {
    method: 'GET',
    headers,
    credentials: 'include', // Include cookies for authentication
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please log in');
    }
    throw new Error(`Failed to fetch activity feed: ${response.status}`);
  }
  
  return response.json();
};

export const useActivityFeed = () => {
  return useQuery<ActivityFeedItem[]>({
    queryKey: ['activity-feed'],
    queryFn: fetchActivityFeed,
  });
};
