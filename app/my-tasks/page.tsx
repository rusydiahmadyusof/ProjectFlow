'use client';

import dynamic from 'next/dynamic';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Lazy load MyTaskScreen component for code splitting
const MyTaskScreen = dynamic(
  () => import('../../components').then((mod) => ({ default: mod.MyTaskScreen })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            refresh
          </span>
          <p className="text-slate-500 dark:text-slate-400">Loading my tasks...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function MyTasksPage() {
  return (
    <AuthGuard>
      <MyTaskScreen />
    </AuthGuard>
  );
}
