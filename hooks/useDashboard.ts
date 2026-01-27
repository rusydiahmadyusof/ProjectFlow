'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  completionPercentage: number;
  activeProjects: number;
  delayedProjects: number;
  trendPercentage: number;
  projectProgress: Array<{ name: string; progress: number }>;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
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
