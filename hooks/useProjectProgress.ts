'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Task, Project } from '@/components/types';
import { calculateProjectProgress } from '@/lib/projectStats';
import { useUpdateProject } from './useProjects';

/**
 * Hook to automatically update project progress when tasks change
 * Call this hook in components that display project details
 */
export const useProjectProgressSync = (projectId: string | undefined, tasks: Task[]) => {
  const queryClient = useQueryClient();
  const updateProject = useUpdateProject();

  useEffect(() => {
    if (!projectId || tasks.length === 0) return;

    const progress = calculateProjectProgress(tasks);
    
    // Get current project data
    const projects = queryClient.getQueryData<Project[]>(['projects']);
    const project = projects?.find((p) => p.id === projectId);
    
    if (!project) return;
    
    // Only update if progress has changed
    if (project.progress !== progress) {
      updateProject.mutate({
        id: projectId,
        progress,
        taskCount: tasks.length,
      });
    }
  }, [projectId, tasks, queryClient, updateProject]);
};
