'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from './types';
import { AppLayout, PageContent } from './layout';
import { getTaskStatusConfig, getTaskPriorityConfig } from './utils/statusConfig';
import { useTasks } from '@/hooks/useTasks';
import { AddTaskModal, TaskDetailsModal } from './modals';

export const MyTaskScreen = () => {
  const { data, isLoading } = useTasks();
  const tasks = data?.pages.flatMap((page) => page.tasks) ?? [];
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const router = useRouter();

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const taskStats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'to-do').length;
    const dueThisWeek = tasks.filter((t) => {
      // Simple check - in real app, parse dates properly
      return t.status !== 'done' && !t.isCompleted;
    }).length;
    const completed = tasks.filter((t) => t.status === 'done' || t.isCompleted).length;
    return { pending, dueThisWeek, completed };
  }, [tasks]);

  const handleNewTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleViewAll = () => {
    router.push('/tasks');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };

  // Keep selected task in sync with latest data so modal updates in "real time"
  useEffect(() => {
    if (!selectedTask) return;

    const updated = tasks.find((t) => t.id === selectedTask.id);
    if (updated && updated !== selectedTask) {
      setSelectedTask(updated);
    }
  }, [tasks, selectedTask]);

  return (
    <>
      <AppLayout
        headerTitle="My Tasks"
        showSearch
        searchPlaceholder="Search tasks, projects..."
        onSearchChange={setSearchQuery}
      >
      <PageContent>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-w-0">
        <div className="xl:col-span-2 flex flex-col gap-4 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0e121b] dark:text-white">Good Morning, Alex!</h2>
                    <p className="text-gray-500 text-sm mt-1">Here's what you need to focus on today.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all shadow-primary/30" onClick={handleNewTask} aria-label="Create new task">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>New Task</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-6xl text-primary">pending_actions</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md text-orange-600 dark:text-orange-400">
                        <span className="material-symbols-outlined text-lg">hourglass_top</span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Tasks</p>
                    </div>
                    <p className="text-3xl font-bold text-[#0e121b] dark:text-white">{taskStats.pending}</p>
                  </div>
                  <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-6xl text-primary">event_available</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md text-primary">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due This Week</p>
                    </div>
                    <p className="text-3xl font-bold text-[#0e121b] dark:text-white">{taskStats.dueThisWeek}</p>
                  </div>
                  <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-6xl text-primary">done_all</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md text-green-600 dark:text-green-400">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                    <p className="text-3xl font-bold text-[#0e121b] dark:text-white">{taskStats.completed}</p>
                  </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-[#0e121b] dark:text-white">Current Workload</h3>
                    <button className="text-sm text-primary font-medium hover:underline" onClick={handleViewAll}>View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                          <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3 min-w-[200px]">Task Title</th>
                          <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Project</th>
                          <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Due Date</th>
                          <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {isLoading ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                              Loading tasks...
                            </td>
                          </tr>
                        ) : filteredTasks.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                              {searchQuery ? 'No tasks found matching your search.' : 'No tasks found.'}
                            </td>
                          </tr>
                        ) : (
                          filteredTasks.map((task) => {
                          const priorityConfig = getTaskPriorityConfig(task.priority);
                          const statusConfig = getTaskStatusConfig(task.status);
                          return (
                            <tr
                              key={task.id}
                              className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                              onClick={() => handleTaskClick(task)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleTaskClick(task);
                                }
                              }}
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  {priorityConfig.dotColor && (
                                    <div className={`size-2 rounded-full shrink-0 ${priorityConfig.dotColor} opacity-50`}></div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-[#0e121b] dark:text-white group-hover:text-primary transition-colors">{task.title}</p>
                                    <p className="text-xs text-gray-400 sm:hidden mt-0.5">{task.project} • {task.dueDate}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 hidden sm:table-cell">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{task.project}</span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig.bgColor}`}>
                                  <span className={`size-1.5 rounded-full ${priorityConfig.dotColor}`}></span>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                              </td>
                              <td className={`px-5 py-4 hidden md:table-cell ${task.status === 'review' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                <div className="flex items-center gap-1 text-sm">
                                  <span className="material-symbols-outlined text-xs">calendar_month</span>
                                  {task.dueDate}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                                  {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white" aria-label={`More options for ${task.title}`}>
                                  <span className="material-symbols-outlined">more_vert</span>
                                </button>
                              </td>
                            </tr>
                          );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                    <button className="text-sm text-gray-500 hover:text-primary font-medium transition-colors" onClick={handleViewAll}>Load more tasks</button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#0e121b] dark:text-white">October 2023</h3>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500" aria-label="Previous month"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500" aria-label="Next month"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-sm gap-y-3">
                    {[29, 30, ...Array.from({ length: 31 }, (_, i) => i + 1), 1, 2].map((day, idx) => (
                      <div key={idx} className={`${idx < 2 || idx >= 33 ? 'text-gray-300' : ''} ${day === 20 ? 'relative' : ''} ${day === 24 ? 'relative' : ''} ${day === 22 ? 'relative' : ''} ${day === 26 ? 'relative' : ''}`}>
                        {day === 20 && <><span className="font-bold text-primary">{day}</span><span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span></>}
                        {day === 24 && <><div className="mx-auto w-7 h-7 flex items-center justify-center bg-primary text-white rounded-full text-xs">{day}</div></>}
                        {day === 22 && <><span>{day}</span><span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></span></>}
                        {day === 26 && <><span>{day}</span><span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full"></span></>}
                        {![20, 22, 24, 26].includes(day) && <span>{day}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex-1">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#0e121b] dark:text-white">Recent Activity</h3>
                    <button className="text-xs text-gray-500 hover:text-primary">Clear</button>
                  </div>
                  <div className="relative pl-2">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex flex-col gap-6">
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-green-500 z-10 box-content"></div>
                        <div>
                          <p className="text-sm text-[#0e121b] dark:text-white">You moved <span className="font-semibold">'Logo Design'</span> to Done</p>
                          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-blue-500 z-10 box-content"></div>
                        <div>
                          <p className="text-sm text-[#0e121b] dark:text-white">You commented on <span className="font-semibold">'API Specs'</span></p>
                          <div className="mt-2 p-2 bg-background-light dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-300 italic border border-gray-100 dark:border-gray-700">"Should we include the legacy endpoints here?"</div>
                          <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                        </div>
                      </div>
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-primary z-10 box-content"></div>
                        <div>
                          <p className="text-sm text-[#0e121b] dark:text-white">Created new task <span className="font-semibold">'Q4 Roadmap'</span></p>
                          <p className="text-xs text-gray-400 mt-1">Yesterday at 4:30 PM</p>
                        </div>
                      </div>
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-purple-500 z-10 box-content"></div>
                        <div>
                          <p className="text-sm text-[#0e121b] dark:text-white">Attached file to <span className="font-semibold">'Onboarding Flow'</span></p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="size-8 rounded bg-red-100 flex items-center justify-center text-red-500">
                              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">specs_v2.pdf</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Yesterday at 11:00 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
        </div>
        </div>
      </PageContent>
    </AppLayout>
    <AddTaskModal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} />
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
