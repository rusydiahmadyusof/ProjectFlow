'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Notification, ActivityFeedItem } from './types';
import { AppLayout } from './layout/AppLayout';
import { useNotifications, useMarkNotificationRead } from '@/hooks/useNotifications';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { Project, Task } from '@/components/types';

export const NotificationScreen = () => {
  const router = useRouter();
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();
  const { data: tasksData } = useTasks();
  const { data: projectsData } = useProjects();
  const { data: activityFeed = [], isLoading: isLoadingActivityFeed } = useActivityFeed();
  const tasks: Task[] = tasksData?.pages.flatMap((page) => page.tasks) ?? [];
  const projects: Project[] = projectsData ?? [];
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleMarkAllRead = () => {
    notifications.forEach((notification) => {
      if (!notification.isRead) {
        markAsRead({ id: notification.id, isRead: true });
      }
    });
  };

  const handleNotificationClick = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead({ id: notification.id, isRead: true });
    }

    // Navigate based on notification type and target
    if (!notification.target) {
      return;
    }

    const target = notification.target.toLowerCase().trim();
    const isTaskType = ['comment', 'mention', 'assignment', 'overdue'].includes(notification.type);

    // Priority 1: Check if it contains a task number pattern (e.g., "#WR-102" or "Task #WR-102")
    const taskNumberMatch = target.match(/#?([a-z]+-\d+)/i);
    if (taskNumberMatch) {
      const taskNumber = `#${taskNumberMatch[1].toUpperCase()}`;
      const task = tasks.find((t) => t.taskNumber?.toLowerCase() === taskNumber.toLowerCase());
      if (task && task.projectId) {
        router.push(`/tasks?projectId=${task.projectId}&taskId=${task.id}`);
        return;
      }
    }

    // Helper function to calculate match score (higher is better)
    const calculateMatchScore = (source: string, target: string): number => {
      const sourceLower = source.toLowerCase();
      const targetLower = target.toLowerCase();
      
      // Exact match gets highest score
      if (sourceLower === targetLower) return 100;
      
      // One contains the other exactly
      if (sourceLower.includes(targetLower)) return 80;
      if (targetLower.includes(sourceLower)) return 70;
      
      // Count matching words (words longer than 3 chars)
      const sourceWords = sourceLower.split(/\s+/).filter(w => w.length > 3);
      const targetWords = targetLower.split(/\s+/).filter(w => w.length > 3);
      const matchingWords = sourceWords.filter(w => targetWords.includes(w)).length;
      const totalWords = Math.max(sourceWords.length, targetWords.length);
      
      if (matchingWords === 0) {
        // Check for partial word matches (e.g., "homepage" vs "website" both relate to web)
        // Check if both contain common keywords
        const commonKeywords = ['homepage', 'website', 'web', 'page', 'site', 'design', 'redesign', 'project'];
        const sourceHasKeyword = commonKeywords.some(kw => sourceLower.includes(kw));
        const targetHasKeyword = commonKeywords.some(kw => targetLower.includes(kw));
        
        // If both have related keywords, give a small score
        if (sourceHasKeyword && targetHasKeyword) {
          // Check if they share the same main concept (e.g., both have "redesign" or "design")
          const sourceMainWords = sourceWords.filter(w => ['design', 'redesign', 'project'].includes(w));
          const targetMainWords = targetWords.filter(w => ['design', 'redesign', 'project'].includes(w));
          if (sourceMainWords.length > 0 && targetMainWords.length > 0) {
            return 40; // Partial match for related concepts
          }
        }
        return 0;
      }
      
      // Score based on percentage of matching words
      const wordMatchScore = (matchingWords / totalWords) * 60;
      
      // Bonus if all words match
      if (matchingWords === totalWords && sourceWords.length === targetWords.length) {
        return Math.min(90, wordMatchScore + 20);
      }
      
      return wordMatchScore;
    };

    // Priority 2: For comment type, prioritize project matching first
    // Comments are usually about projects, not specific tasks
    if (notification.type === 'comment') {
      let bestProject: Project | null = null;
      let bestScore = 0;
      
      projects.forEach((project) => {
        const score = calculateMatchScore(project.name, target);
        if (score > bestScore && score >= 30) {
          bestScore = score;
          bestProject = project;
        }
      });
      
      if (bestProject) {
        router.push(`/tasks?projectId=${(bestProject as any).id}`);
        return;
      }
    }

    // Priority 3: For task-related notifications (mention, assignment, overdue), try to find by task title
    if (isTaskType) {
      let bestTask: Task | null = null;
      let bestScore = 0;
      
      tasks.forEach((task) => {
        const score = calculateMatchScore(task.title, target);
        if (score > bestScore && score >= 70) {
          bestScore = score;
          bestTask = task;
        }
      });
      
      if (bestTask && (bestTask as any).projectId) {
        router.push(
          `/tasks?projectId=${(bestTask as any).projectId}&taskId=${(bestTask as any).id}`
        );
        return;
      }
    }

    // Priority 4: Check if it's a project name (for non-task types or if task match failed)
    let bestProject: Project | null = null;
    let bestProjectScore = 0;
    
    projects.forEach((project) => {
      const score = calculateMatchScore(project.name, target);
      if (score > bestProjectScore && score >= 30) {
        bestProjectScore = score;
        bestProject = project;
      }
    });

    // Priority 5: Try task matching (for non-task types or if project match failed)
    let bestTask: Task | null = null;
    let bestTaskScore = 0;
    
    tasks.forEach((task) => {
      const score = calculateMatchScore(task.title, target);
      if (score > bestTaskScore && score >= 70) {
        bestTaskScore = score;
        bestTask = task;
      }
    });

    // Choose the best match: prefer task if score is significantly higher, otherwise prefer project
    if (bestTask && bestTaskScore > bestProjectScore + 10 && (bestTask as any).projectId) {
      router.push(
        `/tasks?projectId=${(bestTask as any).projectId}&taskId=${(bestTask as any).id}`
      );
      return;
    }
    
    if (bestProject) {
      router.push(`/tasks?projectId=${(bestProject as any).id}`);
      return;
    }
    
    if (bestTask && (bestTask as any).projectId) {
      router.push(
        `/tasks?projectId=${(bestTask as any).projectId}&taskId=${(bestTask as any).id}`
      );
      return;
    }

    // Priority 5: Last resort - try loose task matching for non-task types
    if (!isTaskType) {
      let bestTask = null;
      let bestScore = 0;
      
      tasks.forEach((task) => {
        const score = calculateMatchScore(task.title, target);
        if (score > bestScore && score >= 50) {
          bestScore = score;
          bestTask = task;
        }
      });
      
      if (bestTask && (bestTask as any).projectId) {
        router.push(
          `/tasks?projectId=${(bestTask as any).projectId}&taskId=${(bestTask as any).id}`
        );
        return;
      }
    }
  };

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.target?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === 'unread') {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (activeTab === 'mentions') {
      filtered = filtered.filter((n) => n.type === 'mention');
    }

    return filtered;
  }, [notifications, searchQuery, activeTab]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <AppLayout
        headerTitle="Notifications Center"
        showSearch
        searchPlaceholder="Search notifications..."
        onSearchChange={setSearchQuery}
      >
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications Center</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Stay updated with your team's activity and project alerts.</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-sm font-medium text-[#0e121b] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            onClick={handleMarkAllRead}
            aria-label="Mark all as read"
          >
            <span className="material-symbols-outlined text-[20px]">done_all</span>
            Mark all as read
          </button>
        </div>
        <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
          <nav className="flex gap-8">
                <button className={`pb-3 border-b-2 ${activeTab === 'all' ? 'border-primary text-primary font-semibold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'} text-sm px-1`} onClick={() => setActiveTab('all')}>
                  All Activity
                </button>
                <button className={`pb-3 border-b-2 ${activeTab === 'unread' ? 'border-primary text-primary font-semibold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'} text-sm px-1 flex items-center gap-2`} onClick={() => setActiveTab('unread')}>
                  Unread
                  {unreadCount > 0 && <span className="bg-primary text-white text-[10px] px-1.5 rounded-full h-4 flex items-center justify-center">{unreadCount}</span>}
                </button>
            <button className={`pb-3 border-b-2 ${activeTab === 'mentions' ? 'border-primary text-primary font-semibold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'} text-sm px-1`} onClick={() => setActiveTab('mentions')}>
              Mentions
            </button>
          </nav>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-10">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Notifications</h3>
              <button className="text-primary text-sm font-medium hover:underline">Filter</button>
            </div>
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading notifications...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No notifications found.</div>
              ) : (
                filteredNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={(e) => handleNotificationClick(e, notification)}
                      className={`group relative w-full flex gap-4 p-4 rounded-xl shadow-sm border transition-all cursor-pointer text-left ${notification.type === 'overdue' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:border-primary/30 hover:shadow-md'} ${notification.isRead ? 'opacity-75 hover:opacity-100' : ''}`}
                      aria-label={`Notification: ${notification.title} ${notification.target || ''}`}
                    >
                      {!notification.isRead && <div className={`absolute right-4 top-4 size-2.5 ${notification.type === 'overdue' ? 'bg-red-500 animate-pulse' : 'bg-primary'} rounded-full pointer-events-none`}></div>}
                      <div className="flex-shrink-0 relative">
                        {notification.user?.avatar && notification.user.avatar.trim() !== '' ? (
                          <>
                            <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${notification.user.avatar}')` }} role="img" aria-label={`${notification.user.name} avatar`}></div>
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
                              <span className={`material-symbols-outlined text-[16px] ${notification.iconColor} ${notification.bgColor} rounded-full p-0.5`}>{notification.icon}</span>
                            </div>
                          </>
                        ) : (
                          <div className={`size-10 rounded-full ${notification.bgColor} flex items-center justify-center ${notification.iconColor} relative`}>
                            {notification.icon ? (
                              <span className="material-symbols-outlined fill-1">{notification.icon}</span>
                            ) : notification.user?.name ? (
                              <span className="font-bold text-sm text-white">
                                {notification.user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </span>
                            ) : (
                              <span className="material-symbols-outlined fill-1">{notification.icon || 'notifications'}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm text-slate-900 dark:text-white leading-snug">
                          {notification.user ? (
                            <>
                              <span className="font-semibold">{notification.user.name}</span> {notification.title} {notification.target && <span className="font-medium text-primary">{notification.target}</span>}
                            </>
                          ) : (
                            <>
                              {notification.title} {notification.target && <span className="font-medium text-primary">{notification.target}</span>}
                            </>
                          )}
                        </p>
                        {notification.message && <p className={`text-xs mt-1 ${notification.type === 'overdue' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>{notification.message}</p>}
                        <p className={`text-[11px] mt-2 font-medium ${notification.type === 'overdue' ? 'text-red-500/80 flex items-center gap-1' : 'text-slate-400'}`}>
                          {notification.type === 'overdue' && <span className="material-symbols-outlined text-[14px]">schedule</span>}
                          {notification.time}
                        </p>
                      </div>
                    </button>
                  ))
              )}
            </div>
            <button className="w-full py-2 text-sm text-slate-500 hover:text-primary font-medium border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">View earlier notifications</button>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Activity Feed</h3>
              <div className="flex gap-2">
                <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary" aria-label="Filter"><span className="material-symbols-outlined text-[20px]">tune</span></button>
                <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary" aria-label="Refresh"><span className="material-symbols-outlined text-[20px]">refresh</span></button>
              </div>
            </div>
            <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-8">
              {isLoadingActivityFeed ? (
                <div className="py-8 text-center text-slate-500">Loading activity feed...</div>
              ) : activityFeed.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No activity to display</div>
              ) : (
                activityFeed.map((item) => (
                    <div key={item.id} className="relative pl-8">
                      <div className={`absolute -left-[21px] top-1 size-3 rounded-full border-2 border-white dark:border-slate-900 ${item.color} ring-1 ring-primary/20`}></div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            {item.user ? (
                              item.user.avatar ? (
                                <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${item.user.avatar}')` }} role="img" aria-label={`${item.user.name} avatar`}></div>
                              ) : (
                                <div className="flex -space-x-2">
                                  {[1, 2].map((i) => (
                                    <div key={i} className="size-8 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-800" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDl8IYjemKJCN42CT9hNKFPDqmao8Npw4C2eMKXCff7Q64XgBs47yyksGBDjG07lStuZGVmwWmrK_VhkkOiMyuFUtcBq-NeR1zWkiqE6DDWfaMB1DQA51VaF_Ql1kYR_lv2lFhrW-zwZyEKCDrfE-9rNQfEmjkFQ6sR_pzoQsYYyVLevcFgc5beJbaudde_aWSJRcxb2eWV5-ZqYLpBISjYyQvF4OYhIfk3M0rq65pzQm91wCyUb5aJdTw8_sUMZyaM9-4ncLP2-TI')` }} role="img" aria-label={`Team member ${i}`}></div>
                                  ))}
                                </div>
                              )
                            ) : (
                              <div className={`size-6 ${item.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold`}>SYS</div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.user?.name || 'System update'}</p>
                              {item.user?.role && <p className="text-xs text-slate-500">{item.user.role}</p>}
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          {item.action} {item.target && <span className="font-semibold text-slate-900 dark:text-white">{item.target}</span>}.
                        </p>
                        {item.details && <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{item.details}</p>}
                        {item.attachments && (
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {item.attachments.map((att, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/20 min-w-[160px]">
                                <div className={`${att.type === 'pdf' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'} p-1.5 rounded flex items-center justify-center`}>
                                  <span className="material-symbols-outlined text-[18px]">{att.type === 'pdf' ? 'picture_as_pdf' : 'image'}</span>
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-medium truncate text-slate-900 dark:text-white">{att.name}</p>
                                  <p className="text-[10px] text-slate-500">{att.size}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                Load More Activity
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </AppLayout>
    </>
  );
};
