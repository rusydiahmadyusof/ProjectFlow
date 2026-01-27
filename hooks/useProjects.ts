'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project } from '@/components/types';
import { supabase } from '@/lib/supabase';
import { withErrorHandling } from '@/lib/errorHandler';

const fetchProjects = async (): Promise<Project[]> => {
  return withErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false });
      return { data, error };
    },
    'fetching projects'
  ) as Promise<Project[]>;
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
          const { data, error } = await supabase
            .from('projects')
            .insert([
              {
                id: project.id ?? `project-${Date.now()}`,
                name: project.name || '',
                client: project.client || '',
                dueDate: project.dueDate || '',
                progress: project.progress ?? 0,
                status: (project.status as Project['status']) || 'on-track',
                taskCount: project.taskCount ?? 0,
                teamMembers: project.teamMembers ?? [],
                isOverdue: project.isOverdue ?? false,
                isArchived: project.isArchived ?? false,
              },
            ])
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
      queryClient.setQueryData<Project[]>(['projects'], (old = []) => {
        if (!old || old.length === 0) return [data];
        const index = old.findIndex((p) => p.id.startsWith('temp-'));
        if (index === -1) return [...old, data];
        const updated = [...old];
        updated[index] = data;
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
