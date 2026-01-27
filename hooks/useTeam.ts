'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamMember } from '@/components/types';
import { supabase } from '@/lib/supabase';
import { withErrorHandling } from '@/lib/errorHandler';

const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  return withErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('createdAt', { ascending: false });
      return { data, error };
    },
    'fetching team members'
  ).then((data) =>
    (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar || '',
      role: (row.role as TeamMember['role']) || 'member',
      tasksAssigned: row.tasksAssigned || 0,
      tasksOverdue: row.tasksOverdue || 0,
    }))
  ) as Promise<TeamMember[]>;
};

export const useTeam = () => {
  return useQuery<TeamMember[]>({
    queryKey: ['team'],
    queryFn: fetchTeamMembers,
  });
};

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: Partial<TeamMember>) => {
      return withErrorHandling(
        async () => {
          const { data, error } = await supabase
            .from('team_members')
            .insert([
              {
                id: member.id ?? `tm-${Date.now()}`,
                name: member.name || '',
                email: member.email || '',
                avatar: member.avatar || '',
                role: (member.role as TeamMember['role']) || 'member',
                tasksAssigned: 0,
                tasksOverdue: 0,
              },
            ])
            .select()
            .single();
          return { data, error };
        },
        'creating team member'
      ).then((data: any) => ({
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar || '',
        role: (data.role as TeamMember['role']) || 'member',
        tasksAssigned: data.tasksAssigned || 0,
        tasksOverdue: data.tasksOverdue || 0,
      })) as Promise<TeamMember>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TeamMember> & { id: string }) => {
      return withErrorHandling(
        async () => {
          const { data, error } = await supabase
            .from('team_members')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          return { data, error };
        },
        `updating team member ${id}`
      ).then((data: any) => ({
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar || '',
        role: (data.role as TeamMember['role']) || 'member',
        tasksAssigned: data.tasksAssigned || 0,
        tasksOverdue: data.tasksOverdue || 0,
      })) as Promise<TeamMember>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await withErrorHandling(
        async () => {
          const { data, error } = await supabase.from('team_members').delete().eq('id', id).select();
          return { data, error };
        },
        `deleting team member ${id}`
      );
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
};
