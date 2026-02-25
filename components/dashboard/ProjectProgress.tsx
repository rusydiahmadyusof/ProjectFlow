'use client';

import { useEffect, useState } from 'react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { Card } from '@/components/ui';

export const ProjectProgress = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  const projects = stats?.projectProgress || [];
  const [animatedProgress, setAnimatedProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isLoading && projects.length > 0) {
      const displayProjects = projects.slice(0, 4);
      const initialProgress: Record<string, number> = {};
      displayProjects.forEach((project) => {
        initialProgress[project.name] = 0;
      });
      setAnimatedProgress(initialProgress);

      // Animate each progress bar with staggered delays
      displayProjects.forEach((project, index) => {
        setTimeout(() => {
          setAnimatedProgress((prev) => ({
            ...prev,
            [project.name]: project.progress,
          }));
        }, index * 150);
      });
    }
  }, [isLoading, projects]);

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Project Progress</h3>
            <p className="text-xs text-[#506395] mt-0.5">Active projects status</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#506395] text-sm">Loading...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Project Progress</h3>
            <p className="text-xs text-[#506395] mt-0.5">Active projects status</p>
          </div>
          <button
            className="text-[#506395] hover:text-primary transition-colors"
            aria-label="More options"
            onClick={() => {}}
          >
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <span className="material-symbols-outlined text-[48px] text-red-500 mb-2">
            error
          </span>
          <p className="text-red-500 dark:text-red-400 text-sm text-center">
            Failed to load projects
          </p>
          <p className="text-[#506395] dark:text-gray-500 text-xs text-center mt-1">
            Please refresh the page
          </p>
        </div>
      </Card>
    );
  }

  // Show only latest 4 projects
  const displayProjects = projects.slice(0, 4);

  // Show empty state if no projects
  if (displayProjects.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Project Progress</h3>
            <p className="text-xs text-[#506395] mt-0.5">Active projects status</p>
          </div>
          <button
            className="text-[#506395] hover:text-primary transition-colors"
            aria-label="More options"
            onClick={() => {}}
          >
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <span className="material-symbols-outlined text-[48px] text-[#506395] dark:text-gray-500 mb-2">
            folder_off
          </span>
          <p className="text-[#506395] dark:text-gray-400 text-sm text-center">
            No projects found
          </p>
          <p className="text-[#506395] dark:text-gray-500 text-xs text-center mt-1">
            Create a project to see progress here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Project Progress</h3>
          <p className="text-xs text-[#506395] mt-0.5">Active projects status</p>
        </div>
        <button
          className="text-[#506395] hover:text-primary transition-colors"
          aria-label="More options"
          onClick={() => {}}
        >
          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
        </button>
      </div>
      <div className="flex flex-col gap-3.5 flex-1 justify-center min-h-0">
        {displayProjects.map((project) => (
          <div key={project.name} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-[#0e121b] dark:text-gray-200 truncate pr-2">{project.name}</span>
              <span className="text-primary font-bold flex-shrink-0">{project.progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${animatedProgress[project.name] || 0}%` }}
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${project.name} progress: ${project.progress}%`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
