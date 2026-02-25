'use client';

import { useInfiniteQuery, useQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { Task } from '@/components/types';
import { supabase } from '@/lib/supabase';
import { getUserFriendlyErrorMessage, withErrorHandling } from '@/lib/errorHandler';

interface FetchTasksParams {
  projectId?: string;
  status?: string;
}

interface TasksResponse {
  tasks: Task[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

const PAGE_SIZE = 20;

const fetchTasks = async (
  params?: FetchTasksParams,
  pageParam = 0
): Promise<TasksResponse> => {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from('tasks').select('*', { count: 'exact' });

  if (params?.projectId) {
    query = query.eq('projectId', params.projectId);
  }

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  const { data, error, count } = await query
    .order('createdAt', { ascending: false })
    .range(from, to);

  if (error) {
    const errorInfo = getUserFriendlyErrorMessage(error, 'fetching tasks');
    throw new Error(errorInfo.message);
  }

  const tasks: Task[] = (data ?? []) as Task[];
  const total = count ?? tasks.length;
  const hasMore = from + tasks.length < total;

  return {
    tasks,
    pagination: {
      limit: PAGE_SIZE,
      offset: from,
      total,
      hasMore,
    },
  };
};

export const useTasks = (params?: FetchTasksParams) => {
  return useInfiniteQuery<TasksResponse>({
    queryKey: ['tasks', params],
    queryFn: ({ pageParam }) => fetchTasks(params, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.pagination.hasMore ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - tasks don't change that often
    refetchOnMount: false, // Use cached data if available
  });
};

export type TaskCountsByAssignee = Record<string, { assigned: number; overdue: number }>;

const fetchTaskCountsByAssignee = async (): Promise<TaskCountsByAssignee> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('assignee, status')
    .limit(5000);

  if (error) {
    const errorInfo = getUserFriendlyErrorMessage(error, 'fetching task counts');
    throw new Error(errorInfo.message);
  }

  const counts: TaskCountsByAssignee = {};
  for (const row of data ?? []) {
    const assignee = row?.assignee as { id?: string } | null;
    const assigneeId = assignee?.id;
    if (!assigneeId) continue;
    if (!counts[assigneeId]) counts[assigneeId] = { assigned: 0, overdue: 0 };
    counts[assigneeId].assigned += 1;
    if (row?.status === 'overdue') counts[assigneeId].overdue += 1;
  }
  return counts;
};

export const useTaskCountsByAssignee = () => {
  return useQuery<TaskCountsByAssignee>({
    queryKey: ['tasks', 'counts-by-assignee'],
    queryFn: fetchTaskCountsByAssignee,
    staleTime: 1 * 60 * 1000, // 1 minute - keep counts reasonably fresh
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      return withErrorHandling(
        async () => {
          const { data, error } = await supabase
            .from('tasks')
            .insert([
              {
                id: task.id ?? `task-${Date.now()}`,
                title: task.title ?? '',
                project: task.project ?? '',
                projectId: task.projectId,
                dueDate: task.dueDate ?? '',
                priority: (task.priority as Task['priority']) ?? 'medium',
                status: (task.status as Task['status']) ?? 'to-do',
                isCompleted: task.isCompleted ?? task.status === 'done',
                createdAt: new Date().toISOString(),
                assignee: task.assignee ?? null,
                taskNumber: task.taskNumber,
                description: task.description,
                subtasks: task.subtasks ?? [],
                comments: task.comments ?? [],
                createdBy: task.createdBy ?? null,
              },
            ])
            .select()
            .single();
          return { data, error };
        },
        'creating task'
      ) as Promise<Task>;
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previous = queryClient.getQueriesData<InfiniteData<TasksResponse>>({ queryKey: ['tasks'] });

      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        title: newTask.title ?? '',
        project: newTask.project ?? '',
        projectId: newTask.projectId,
        dueDate: newTask.dueDate ?? '',
        priority: (newTask.priority as Task['priority']) ?? 'medium',
        status: (newTask.status as Task['status']) ?? 'to-do',
        isCompleted: newTask.isCompleted ?? newTask.status === 'done',
        createdAt: new Date().toISOString(),
        assignee: newTask.assignee,
        taskNumber: newTask.taskNumber,
        description: newTask.description,
        subtasks: newTask.subtasks,
        comments: newTask.comments,
        createdBy: newTask.createdBy,
      };

      // Update every cached tasks list that this new task belongs to
      // React Query v5 updater doesn't receive query meta, so we update per cached key.
      previous.forEach(([queryKey, oldData]) => {
        const key = queryKey as unknown as any[];
        const params = key?.[1] as FetchTasksParams | undefined;

        const matchesProject =
          !params?.projectId || params.projectId === optimisticTask.projectId;
        const matchesStatus =
          !params?.status || params.status === optimisticTask.status;

        if (!matchesProject || !matchesStatus) return;

        if (!oldData) return;

        // Update the first page with the new optimistic task
        const updatedPages = oldData.pages.map((page, index) => {
          if (index === 0) {
            // Add to the first page
            return {
              ...page,
              tasks: [optimisticTask, ...page.tasks],
              pagination: {
                ...page.pagination,
                total: page.pagination.total + 1,
              },
            };
          }
          return page;
        });

        queryClient.setQueryData<InfiniteData<TasksResponse>>(queryKey, {
          ...oldData,
          pages: updatedPages,
        });
      });

      return { previous };
    },
    onError: (_err, _newTask, context) => {
      // Roll back all touched caches
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (data) => {
      // Replace temp task with server task in all task lists
      queryClient.setQueriesData<InfiniteData<TasksResponse>>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;

        // Find and replace the temp task in the first page
        const updatedPages = old.pages.map((page) => {
          const taskIndex = page.tasks.findIndex((t) => t.id.startsWith('temp-'));
          if (taskIndex === -1) return page;

          const updatedTasks = [...page.tasks];
          updatedTasks[taskIndex] = data;

          return {
            ...page,
            tasks: updatedTasks,
          };
        });

        return {
          ...old,
          pages: updatedPages,
        };
      });

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      return withErrorHandling(
        async () => {
          const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          return { data, error };
        },
        `updating task ${id}`
      ) as Promise<Task>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await withErrorHandling(
        async () => {
          const { data, error } = await supabase.from('tasks').delete().eq('id', id).select();
          return { data, error };
        },
        `deleting task ${id}`
      );
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
};
