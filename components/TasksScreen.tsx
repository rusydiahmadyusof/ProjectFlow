'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Task } from './types';
import { AppLayout } from './layout/AppLayout';
import { ProjectHeader, TaskTable, TaskAnalytics } from './tasks';
import { useTasks } from '@/hooks/useTasks';
import { AddTaskModal, TaskDetailsModal } from './modals';
import { useProjects } from '@/hooks/useProjects';
import { useUser } from '@/hooks/useUser';
import { canCreateTask } from './utils/permissions';

const TasksScreenContent = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const taskId = searchParams.get('taskId');
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasks(projectId ? { projectId } : undefined);
  const { data: projects = [] } = useProjects();
  const { data: user } = useUser();
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [sortBy, setSortBy] = useState('Due Date');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;
  const canAddTask = canCreateTask(user?.role);

  // Flatten all pages into a single tasks array
  const tasks = data?.pages.flatMap((page) => page.tasks) ?? [];

  // Open task details modal if taskId is in URL
  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        setIsTaskDetailsModalOpen(true);
      }
    }
  }, [taskId, tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.assignee?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'All Statuses') {
      const statusMap: Record<string, string> = {
        'To Do': 'to-do',
        'In Progress': 'in-progress',
        'Done': 'done',
        'Overdue': 'overdue',
      };
      filtered = filtered.filter((task) => task.status === statusMap[statusFilter]);
    }

    // Apply priority filter
    if (priorityFilter !== 'All Priorities') {
      filtered = filtered.filter((task) => task.priority === priorityFilter.toLowerCase());
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Due Date':
          return a.dueDate.localeCompare(b.dueDate);
        case 'Priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'Date Created':
          // In real app, use actual created date
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
    console.log('Modal should open, isOpen:', true, 'task:', task);
  };

  const handleLoadMore = () => {
    // In real app, load more tasks with pagination
    console.log('Load more tasks');
  };

  return (
    <>
      <AppLayout
        headerTitle={selectedProject ? selectedProject.name : 'Tasks'}
        showSearch
        searchPlaceholder="Search tasks, projects, people..."
        onSearchChange={setSearchQuery}
      >
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8">
          {selectedProject && (
            <ProjectHeader
              teamMembers={selectedProject.teamMembers.slice(0, 4)}
              projectName={selectedProject.name}
              progress={selectedProject.progress}
              tasks={tasks}
              project={selectedProject}
            />
          )}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                {selectedProject ? `${selectedProject.name} Tasks` : 'All Tasks'}
              </h1>
              <p className="text-text-secondary dark:text-gray-400 text-sm">
                Reviewing {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? 's' : ''}{' '}
                {selectedProject ? 'in this project' : 'across all projects'}.
              </p>
            </div>
          </div>
          {!isLoading && tasks.length > 0 && !selectedProject && (
            <TaskAnalytics tasks={tasks} />
          )}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-text-secondary dark:text-gray-400">Loading tasks...</p>
            </div>
          ) : (
            <TaskTable
              tasks={filteredAndSortedTasks}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              sortBy={sortBy}
              onStatusFilterChange={setStatusFilter}
              onPriorityFilterChange={setPriorityFilter}
              onSortChange={setSortBy}
              onTaskClick={handleTaskClick}
              onLoadMore={handleLoadMore}
              hasMore={hasNextPage ?? false}
              isLoadingMore={isFetchingNextPage}
              onAddTask={canAddTask ? () => setIsAddTaskModalOpen(true) : undefined}
            />
          )}
        </div>
      </AppLayout>
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        defaultProjectId={projectId || undefined}
      />
      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={() => {
          setIsTaskDetailsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </>
  );
};

export const TasksScreen = () => {
  return (
    <Suspense fallback={
      <AppLayout headerTitle="Tasks">
        <div className="text-center py-12">
          <p className="text-text-secondary dark:text-gray-400">Loading...</p>
        </div>
      </AppLayout>
    }>
      <TasksScreenContent />
    </Suspense>
  );
};
