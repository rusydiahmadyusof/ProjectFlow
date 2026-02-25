'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity } from '@/components/types';
import { supabase } from '@/lib/supabase';
import { withErrorHandling } from '@/lib/errorHandler';

const fetchActivities = async (): Promise<Activity[]> => {
  return withErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('time', { ascending: false })
        .limit(50);
      return { data, error };
    },
    'fetching activities'
  ).then((data) =>
    (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      user: String(row.user ?? ''),
      action: String(row.action ?? ''),
      target: String(row.target ?? ''),
      time: String(row.time ?? ''),
      icon: String(row.icon ?? ''),
      iconColor: String(row.iconColor ?? ''),
      bgColor: String(row.bgColor ?? ''),
    }))
  ) as Promise<Activity[]>;
};

export const useActivities = () => {
  return useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    staleTime: 0, // always refetch when invalidated or when component mounts so status-change activities show
    refetchOnWindowFocus: true,
  });
};

export interface CreateActivityParams {
  user: string;
  action: string;
  target: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateActivityParams) => {
      const time = new Date().toISOString();
      const id = `activity-${Date.now()}`;
      return withErrorHandling(
        async () => {
          const { data, error } = await supabase.from('activities').insert([
            {
              id,
              user: params.user,
              action: params.action,
              target: params.target,
              time,
              icon: params.icon,
              iconColor: params.iconColor,
              bgColor: params.bgColor,
            },
          ]).select().single();
          return { data, error };
        },
        'logging activity'
      ).then(() => ({ id, ...params, time }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};
