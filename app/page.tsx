'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/LandingPage';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Lazy load Dashboard component for code splitting
const Dashboard = dynamic(() => import('../components').then((mod) => ({ default: mod.Dashboard })), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          refresh
        </span>
        <p className="text-slate-500 dark:text-slate-400">Loading dashboard...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Show landing page for unauthenticated users
    if (!loading) {
      setShowLanding(!isAuthenticated);
    }
  }, [isAuthenticated, loading]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            refresh
          </span>
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (showLanding && !isAuthenticated) {
    return <LandingPage />;
  }

  // Show dashboard for authenticated users
  try {
    return (
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    );
  } catch (error) {
    console.error('Error rendering Dashboard:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-red-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
