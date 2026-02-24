'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project } from '@/components/types';
import { supabase } from '@/lib/supabase';
import { withErrorHandling } from '@/lib/errorHandler';

function normalizeProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    client: String(row.client ?? ''),
    progress: Number(row.progress ?? 0),
    status: (row.status as Project['status']) ?? 'on-track',
    dueDate: String(row.dueDate ?? row.due_date ?? ''),
    taskCount: Number(row.taskCount ?? row.task_count ?? 0),
    teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers as string[] : (Array.isArray(row.team_members) ? row.team_members as string[] : []),
    isOverdue: Boolean(row.isOverdue ?? row.is_overdue ?? false),
    isArchived: row.isArchived != null ? Boolean(row.isArchived) : row.is_archived != null ? Boolean(row.is_archived) : undefined,
    projectLeaderId: (row.projectLeaderId ?? row.project_leader_id ?? null) as string | null | undefined,
    createdAt: row.createdAt != null ? String(row.createdAt) : row.created_at != null ? String(row.created_at) : undefined,
  };
}

const fetchProjects = async (): Promise<Project[]> => {
  const result = await withErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false });
      return { data, error };
    },
    'fetching projects'
  ) as Promise<Project[]>;
  const rows = Array.isArray(result) ? result : [];
  return rows.map((row) => normalizeProject(row as Record<string, unknown>));
};

export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes - projects don't change that often
    refetchOnMount: false, // Use cached data if available
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Partial<Project>) => {
      return withErrorHandling(
        async () => {
          const row: Record<string, unknown> = {
            id: project.id ?? `project-${Date.now()}`,
            name: project.name || '',
            client: project.client || '',
            dueDate: project.dueDate || '',
            progress: project.progress ?? 0,
            status: (project.status as Project['status']) || 'on-track',
            taskCount: project.taskCount ?? 0,
            teamMembers: project.teamMembers ?? [],
            isOverdue: project.isOverdue ?? false,
          };
          const { data, error } = await supabase
            .from('projects')
            .insert([row])
            .select()
            .single();
          return { data, error };
        },
        'creating project'
      ) as Promise<Project>;
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);

      const optimisticProject: Project = {
        id: `temp-${Date.now()}`,
        name: newProject.name || '',
        client: newProject.client || '',
        dueDate: newProject.dueDate || '',
        progress: newProject.progress ?? 0,
        status: (newProject.status as Project['status']) || 'on-track',
        taskCount: newProject.taskCount ?? 0,
        teamMembers: newProject.teamMembers ?? [],
        isOverdue: newProject.isOverdue ?? false,
        isArchived: newProject.isArchived ?? false,
      };

      queryClient.setQueryData<Project[]>(['projects'], (old = []) => [
        ...old,
        optimisticProject,
      ]);

      return { previousProjects };
    },
    onError: (_err, _newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
    },
    onSuccess: (data) => {
      const normalized = normalizeProject((data ?? {}) as Record<string, unknown>);
      queryClient.setQueryData<Project[]>(['projects'], (old = []) => {
        if (!old || old.length === 0) return [normalized];
        const index = old.findIndex((p) => p.id.startsWith('temp-'));
        if (index === -1) return [...old, normalized];
        const updated = [...old];
        updated[index] = normalized;
        return updated;
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      return withErrorHandling(
        async () => {
          const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          return { data, error };
        },
        `updating project ${id}`
      ) as Promise<Project>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await withErrorHandling(
        async () => {
          const { data, error } = await supabase.from('projects').delete().eq('id', id).select();
          return { data, error };
        },
        `deleting project ${id}`
      );
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
