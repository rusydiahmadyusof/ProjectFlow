'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  completionPercentage: number;
  activeProjects: number;
  delayedProjects: number;
  trendPercentage: number;
  projectProgress: Array<{ name: string; progress: number }>;
  weeklyTrend?: {
    labels: string[];
    all: number[];
    byProject: Record<string, number[]>;
  };
  projects?: Array<{ id: string; name: string }>;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Get the current session to include access token
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add Authorization header if we have a session
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  const response = await fetch('/api/dashboard/stats', {
    method: 'GET',
    headers,
    credentials: 'include', // Include cookies for authentication
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please log in');
    }
    throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
  }
  return response.json();
};

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    retry: 1, // Only retry once on failure
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};
