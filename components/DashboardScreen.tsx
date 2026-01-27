'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from './layout/AppLayout';
import { ProjectCompletion } from './dashboard/ProjectCompletion';
import { ActivityTrends } from './dashboard/ActivityTrends';
import { ProjectProgress } from './dashboard/ProjectProgress';
import { ActivityLog } from './dashboard/ActivityLog';
import { SplashScreen } from './auth/SplashScreen';
import { useDashboardStats } from '@/hooks/useDashboard';

export const Dashboard = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for 1.5 seconds, then always hide
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <AppLayout
        headerTitle="Dashboard"
        showSearch
        searchPlaceholder="Search projects, tasks, people..."
      >
        <div className="max-w-[1200px] mx-auto flex flex-col gap-5 h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0e121b] dark:text-white">
                Project Dashboard
              </h1>
              <p className="text-sm text-[#506395] dark:text-gray-400 mt-1">
                High-level overview of active projects and team status.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-0">
            <ProjectCompletion />
            <ActivityTrends />
            <ProjectProgress />
            <ActivityLog />
          </div>
        </div>
      </AppLayout>
    </>
  );
};
