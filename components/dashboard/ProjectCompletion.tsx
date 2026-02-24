'use client';

import { useEffect, useState } from 'react';
import { useDashboardStats } from '@/hooks/useDashboard';

export const ProjectCompletion = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const completionPercentage = stats?.completionPercentage || 78;
  const activeProjects = stats?.activeProjects || 12;
  const delayedProjects = stats?.delayedProjects || 3;
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      // Animate from 0 to target percentage
      setTimeout(() => {
        setAnimatedPercentage(completionPercentage);
      }, 100);
    }
  }, [isLoading, completionPercentage]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a202c] p-4 rounded-lg shadow-sm border border-[#e8ebf3] dark:border-[#2d3748] flex flex-col h-full min-h-0">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">
              Overall Project Completion
            </h3>
            <p className="text-xs text-[#506395]">Aggregated progress</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#506395] text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  const circumference = 2 * Math.PI * 15.9155;
  const strokeDasharray = `${(animatedPercentage / 100) * circumference}, ${circumference}`;

  return (
    <div className="bg-white dark:bg-[#1a202c] p-5 rounded-lg shadow-sm border border-[#e8ebf3] dark:border-[#2d3748] flex flex-col h-full min-h-0">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">
            Overall Project Completion
          </h3>
          <p className="text-xs text-[#506395] mt-0.5">Aggregated progress</p>
        </div>
        <button
          className="text-[#506395] hover:text-primary transition-colors"
          aria-label="More options"
          onClick={() => {}}
        >
          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
        </button>
      </div>
      <div className="flex-1 flex flex-row items-center gap-4 md:gap-6 min-h-0">
        <div className="flex-shrink-0 relative size-20 md:size-24">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-gray-100 dark:text-gray-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 0 0 31.831 a 15.9155 15.9155 0 0 0 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
            />
            <path
              className="text-primary transition-all duration-1000 ease-out"
              d="M18 2.0845 a 15.9155 15.9155 0 0 0 0 31.831 a 15.9155 15.9155 0 0 0 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              strokeWidth="2.8"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg md:text-xl font-black text-[#0e121b] dark:text-white leading-none transition-all duration-1000 ease-out">
              {Math.round(animatedPercentage)}%
            </span>
            <span className="text-[10px] text-[#506395] font-medium mt-0.5">Completed</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-xl font-bold text-[#0e121b] dark:text-white leading-none">{activeProjects}</span>
            <span className="text-[10px] text-[#506395] uppercase font-semibold tracking-wide">Active</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-xl font-bold text-danger leading-none">{delayedProjects}</span>
            <span className="text-[10px] text-[#506395] uppercase font-semibold tracking-wide">Delayed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
