'use client';

import { useEffect, useRef } from 'react';
import { Task } from '../types';
import { getTaskStatusConfig, getTaskPriorityConfig } from '../utils/statusConfig';

interface TaskTableProps {
  tasks: Task[];
  statusFilter: string;
  priorityFilter: string;
  sortBy: string;
  onStatusFilterChange?: (filter: string) => void;
  onPriorityFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
  onTaskClick?: (task: Task) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onAddTask?: () => void;
}

export const TaskTable = ({
  tasks,
  statusFilter,
  priorityFilter,
  sortBy,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSortChange,
  onTaskClick,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  onAddTask,
}: TaskTableProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

    // Find the scrollable container (main element with overflow-y-auto)
    const scrollContainer = loadMoreRef.current.closest('main') || null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore?.();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '200px', // Start loading 200px before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, onLoadMore]);
  return (
    <div className="flex flex-col gap-4">
      {onAddTask && (
        <div className="flex justify-end p-1">
          <button
            className="flex items-center justify-center gap-2 px-5 h-11 rounded-lg bg-primary hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
            onClick={onAddTask}
            aria-label="Add new task"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Task
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-1">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative group">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary z-10">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
            </span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange?.(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-main dark:text-white focus:ring-primary focus:border-primary appearance-none cursor-pointer shadow-sm min-w-[140px]"
              aria-label="Filter by status"
            >
              <option>All Statuses</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
              <option>Overdue</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </span>
          </div>
          <div className="relative group">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary z-10">
              <span className="material-symbols-outlined text-[18px]">flag</span>
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange?.(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-main dark:text-white focus:ring-primary focus:border-primary appearance-none cursor-pointer shadow-sm min-w-[140px]"
              aria-label="Filter by priority"
            >
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <span className="text-xs text-text-secondary font-medium whitespace-nowrap">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="pl-3 pr-8 py-1.5 bg-transparent border-none text-sm font-semibold text-text-main dark:text-white hover:text-primary focus:ring-0 cursor-pointer"
              aria-label="Sort tasks"
            >
              <option>Due Date</option>
              <option>Priority</option>
              <option>Date Created</option>
            </select>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-text-main dark:text-white pointer-events-none">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </span>
          </div>
        </div>
      </div>
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-border-light dark:border-border-dark">
                <th className="py-4 pl-6 pr-4 text-xs font-semibold text-text-secondary uppercase tracking-wider w-[35%]">
                  Task Title
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider w-[15%]">
                  Project
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Assignee
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Due Date
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Priority
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right pr-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const priorityConfig = getTaskPriorityConfig(task.priority);
                  const statusConfig = getTaskStatusConfig(task.status);
                  return (
                    <tr
                      key={task.id}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onTaskClick?.(task);
                        }
                      }}
                      onClick={() => onTaskClick?.(task)}
                    >
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 pointer-events-none ${
                            task.isCompleted
                              ? 'text-green-600'
                              : 'text-text-secondary group-hover:text-primary transition-colors'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {task.isCompleted ? 'check_circle' : 'check_circle_outline'}
                          </span>
                        </div>
                        <div>
                          <p
                            className={`font-semibold text-text-main dark:text-white group-hover:text-primary transition-colors ${
                              task.isCompleted
                                ? 'line-through decoration-gray-400 dark:decoration-gray-600 text-gray-500'
                                : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">{task.taskNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {task.project}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {task.assignee?.avatar ? (
                        <div className="flex -space-x-2 overflow-hidden">
                          <div
                            className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-cover bg-center"
                            style={{ backgroundImage: `url('${task.assignee.avatar}')` }}
                            role="img"
                            aria-label={`${task.assignee.name} avatar`}
                          ></div>
                        </div>
                      ) : (
                        <div className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {task.assignee?.name || 'Unassigned'}
                        </div>
                      )}
                    </td>
                    <td
                      className={`py-4 px-4 text-text-main dark:text-gray-300 font-medium ${
                        task.status === 'overdue' ? 'text-red-600 dark:text-red-400 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{task.dueDate}</span>
                        {task.reminderDate && (
                          <span
                            className="material-symbols-outlined text-primary text-[16px]"
                            title={`Reminder: ${new Date(task.reminderDate).toLocaleString()}`}
                          >
                            notifications
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${priorityConfig.bgColor}`}
                      >
                        {priorityConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right pr-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.bgColor}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div
            ref={loadMoreRef}
            className="px-6 py-4 border-t border-border-light dark:border-border-dark flex justify-center"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                <span>Loading more tasks...</span>
              </div>
            ) : (
              <div className="h-4" /> // Invisible sentinel element for intersection observer
            )}
          </div>
        )}
      </div>
    </div>
  );
};
