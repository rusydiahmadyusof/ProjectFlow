'use client';

import { useQuery } from '@tanstack/react-query';
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
    (data ?? []).map((row: any) => ({
      id: row.id,
      user: row.user,
      action: row.action,
      target: row.target,
      time: row.time,
      icon: row.icon,
      iconColor: row.iconColor,
      bgColor: row.bgColor,
    }))
  ) as Promise<Activity[]>;
};

export const useActivities = () => {
  return useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: fetchActivities,
  });
};
