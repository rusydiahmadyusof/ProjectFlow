'use client';

import { useMemo } from 'react';
import { Task } from '../types';
import { TaskTimeChart } from './TaskTimeChart';

interface TaskAnalyticsProps {
  tasks: Task[];
}

export const TaskAnalytics = ({ tasks }: TaskAnalyticsProps) => {
  const analytics = useMemo(() => {
    // Completion rate
    const completedTasks = tasks.filter((t) => t.status === 'done' || t.isCompleted).length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // Overdue tasks
    const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;

    // In progress tasks
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;

    return {
      completionRate,
      overdueTasks,
      inProgressTasks,
      totalTasks: tasks.length,
      completedTasks,
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Left: Graph */}
      <div className="lg:col-span-1">
        <TaskTimeChart tasks={tasks} />
      </div>

      {/* Right: 4 Analytics Cards */}
      <div className="lg:col-span-1 grid grid-cols-2 gap-3">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="size-11 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">task_alt</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide mb-2">Total Tasks</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{analytics.totalTasks}</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="size-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[22px]">check_circle</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide mb-2">Completion Rate</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{analytics.completionRate}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{analytics.completedTasks} completed</p>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="size-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">sync</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide mb-2">In Progress</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{analytics.inProgressTasks}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active tasks</p>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="size-11 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[22px]">schedule</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide mb-2">Overdue</p>
          <p className="text-3xl font-black text-red-600 dark:text-red-400 leading-none mb-1">{analytics.overdueTasks}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Requires attention</p>
        </div>
      </div>
    </div>
  );
};
