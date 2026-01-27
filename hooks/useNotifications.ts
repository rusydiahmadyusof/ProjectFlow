'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/components/types';
import { supabase } from '@/lib/supabase';
import { withErrorHandling } from '@/lib/errorHandler';

const fetchNotifications = async (): Promise<Notification[]> => {
  return withErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('createdAt', { ascending: false });
      return { data, error };
    },
    'fetching notifications'
  ).then((data) =>
    (data ?? []).map((row: any) => ({
      id: row.id,
      type: row.type,
      user: row.user || undefined,
      title: row.title,
      message: row.message,
      target: row.target,
      time: row.time,
      isRead: row.isRead || false,
      icon: row.icon,
      iconColor: row.iconColor,
      bgColor: row.bgColor,
    }))
  ) as Promise<Notification[]>;
};

export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      return withErrorHandling(
        async () => {
          const { data, error } = await supabase
            .from('notifications')
            .update({ isRead })
            .eq('id', id)
            .select()
            .single();
          return { data, error };
        },
        `updating notification ${id}`
      ).then((data: any) => ({
        id: data.id,
        type: data.type,
        user: data.user || undefined,
        title: data.title,
        message: data.message,
        target: data.target,
        time: data.time,
        isRead: data.isRead || false,
        icon: data.icon,
        iconColor: data.iconColor,
        bgColor: data.bgColor,
      })) as Promise<Notification>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
