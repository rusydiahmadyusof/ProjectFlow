'use client';

import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useMemo, useEffect, useState } from 'react';

export const QuickStats = () => {
  const router = useRouter();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasksData, isLoading: tasksLoading } = useTasks();
  const tasks = tasksData?.pages.flatMap((page) => page.tasks) ?? [];
  const [isAnimated, setIsAnimated] = useState(false);
  const [animatedTotalProjects, setAnimatedTotalProjects] = useState(0);
  const [animatedDueToday, setAnimatedDueToday] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;
    
    // Calculate tasks due today
    const today = new Date();
    const todayMonth = today.toLocaleDateString('en-US', { month: 'short' });
    const todayDay = today.getDate();
    const todayYear = today.getFullYear();
    
    const dueToday = tasks.filter((t) => {
      if (t.status === 'done' || t.isCompleted || !t.dueDate) return false;
      
      // Parse various date formats
      const dueDateStr = t.dueDate.trim();
      
      // Format: "Mon DD, YYYY" or "Mon DD"
      if (dueDateStr.includes(',')) {
        const parts = dueDateStr.split(',');
        const datePart = parts[0].trim();
        const yearPart = parts[1]?.trim();
        
        if (datePart.startsWith(todayMonth)) {
          const dayMatch = datePart.match(/\d+/);
          if (dayMatch) {
            const day = parseInt(dayMatch[0]);
            if (day === todayDay) {
              // If year is specified, check it matches
              if (yearPart) {
                return parseInt(yearPart) === todayYear;
              }
              return true; // No year specified, assume current year
            }
          }
        }
      } else {
        // Format: "Mon DD"
        if (dueDateStr.startsWith(todayMonth)) {
          const dayMatch = dueDateStr.match(/\d+/);
          if (dayMatch && parseInt(dayMatch[0]) === todayDay) {
            return true;
          }
        }
      }
      
      return false;
    }).length;
    
    // Calculate project growth (compare current projects to previous period)
    // For now, calculate based on active projects vs delayed
    const activeProjects = projects.filter((p) => p.status === 'on-track').length;
    const growthPercentage = totalProjects > 0 
      ? Math.round((activeProjects / totalProjects) * 100) - 50 // Normalize around 50%
      : 0;
    
    // Calculate overall progress percentage
    const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
    const overallProgress = totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0;
    
    // Get unique team members working on active tasks
    const activeTaskAssignees = new Set(
      tasks
        .filter((t) => t.status !== 'done' && !t.isCompleted && t.assignee?.avatar)
        .map((t) => t.assignee?.avatar)
        .filter(Boolean)
    );
    const activeTeamMembers = Array.from(activeTaskAssignees);
    
    return { 
      totalProjects, 
      dueToday, 
      overdueTasks, 
      growthPercentage,
      overallProgress,
      activeTeamMembers,
    };
  }, [projects, tasks]);

  useEffect(() => {
    if (!projectsLoading && !tasksLoading) {
      // Start animations after a short delay
      setTimeout(() => {
        setIsAnimated(true);
      }, 200);

      // Animate numbers counting up
      const animateNumber = (
        setter: (value: number) => void,
        target: number,
        delay: number,
        duration: number = 1000
      ) => {
        setTimeout(() => {
          const startTime = Date.now();
          const startValue = 0;
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(startValue + (target - startValue) * progress);
            setter(current);
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setter(target);
            }
          };
          animate();
        }, delay);
      };

      animateNumber(setAnimatedTotalProjects, stats.totalProjects, 300);
      animateNumber(setAnimatedDueToday, stats.dueToday, 400);
      
      // Animate progress bar (calculate offset based on overall progress)
      // Progress bar: 238 total circumference, offset = 238 - (progress% * 238 / 100)
      const progressOffset = 238 - (stats.overallProgress * 238 / 100);
      setTimeout(() => {
        setAnimatedProgress(progressOffset);
      }, 500);
    }
  }, [projectsLoading, tasksLoading, stats.totalProjects, stats.dueToday]);

  const handleReviewClick = () => {
    router.push('/tasks?status=overdue');
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Projects Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 transition-all flex flex-col justify-between h-40 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Projects
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {animatedTotalProjects}
              </h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[24px]">folder_open</span>
            </div>
          </div>
          <div className="flex items-end justify-between mt-4 z-10">
            {stats.growthPercentage > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-100 dark:border-green-900/30">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+{stats.growthPercentage}% growth</span>
              </div>
            )}
            {stats.growthPercentage <= 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 dark:bg-slate-900/20 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-900/30">
                <span className="material-symbols-outlined text-[14px]">trending_flat</span>
                <span>{Math.abs(stats.growthPercentage)}%</span>
              </div>
            )}
            <svg
              className="w-28 h-12 text-primary drop-shadow-sm"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 100 50"
              aria-hidden="true"
            >
              <path
                d="M0 45 Q 20 45 30 30 T 60 25 T 100 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={120}
                strokeDashoffset={isAnimated ? 0 : 120}
                style={{
                  transition: 'stroke-dashoffset 1.2s ease-out',
                  transitionDelay: '0.4s',
                }}
              ></path>
            </svg>
          </div>
        </div>

        {/* Due Today Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all flex items-center justify-between h-40">
          <div className="flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                Due Today
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{animatedDueToday}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Tasks remaining
            </p>
            <div className="mt-auto pt-2 flex -space-x-2">
              {stats.activeTeamMembers.slice(0, 2).map((avatar, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900 bg-cover"
                  style={{
                    backgroundImage: avatar ? `url('${avatar}')` : undefined,
                  }}
                  role="img"
                  aria-label="Team member avatar"
                ></div>
              ))}
              {stats.activeTeamMembers.length > 2 && (
                <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-500">
                  +{stats.activeTeamMembers.length - 2}
                </div>
              )}
            </div>
          </div>
          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" aria-hidden="true">
              <circle
                className="text-slate-100 dark:text-slate-800"
                cx="48"
                cy="48"
                fill="transparent"
                r="38"
                stroke="currentColor"
                strokeWidth="8"
              ></circle>
              <circle
                className="text-yellow-500 transition-all duration-1000 ease-out"
                cx="48"
                cy="48"
                fill="transparent"
                r="38"
                stroke="currentColor"
                strokeDasharray="238"
                strokeDashoffset={animatedProgress}
                strokeLinecap="round"
                strokeWidth="8"
                style={{
                  transitionDelay: '0.5s',
                }}
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-lg font-bold text-slate-900 dark:text-white transition-all duration-1000 ease-out" style={{ transitionDelay: '0.5s', opacity: isAnimated ? 1 : 0 }}>
                {stats.overallProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* Overdue Tasks Card */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-200 dark:border-red-900/30 shadow-lg shadow-red-900/5 hover:shadow-red-900/10 hover:border-red-300 transition-all flex flex-col justify-between h-40 relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
            <span className="material-symbols-outlined text-[100px] text-red-600">warning</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25"></div>
              <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full text-red-600 relative z-10 border border-red-200 dark:border-red-800">
                <span className="material-symbols-outlined text-[20px] fill-1">priority_high</span>
              </div>
            </div>
            <span className="text-red-800 dark:text-red-200 font-bold uppercase tracking-wider text-xs">
              Action Required
            </span>
          </div>
          <div className="z-10">
            <h3 className="text-3xl font-bold text-red-700 dark:text-red-400">
              {stats.overdueTasks}
            </h3>
            <p className="text-sm text-red-600/80 dark:text-red-300 font-medium">Overdue Tasks</p>
          </div>
          <button
            className="mt-2 w-full py-2 rounded bg-white/50 dark:bg-black/20 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wide hover:bg-white/80 dark:hover:bg-black/40 transition-colors flex items-center justify-center gap-1 z-10 border border-red-200 dark:border-red-800/50"
            onClick={handleReviewClick}
            aria-label="Review overdue tasks"
          >
            Review Now{' '}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
};
