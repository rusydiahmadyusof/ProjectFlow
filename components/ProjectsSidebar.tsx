'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ProjectsSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col transition-all duration-300 hidden md:flex">
      <Link href="/" className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px] fill-1">
              account_tree
            </span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            ProjectFlow
          </h1>
        </div>
      </Link>
      <nav className="flex-1 overflow-y-auto pt-6 px-3 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Main Menu
          </p>
        </div>
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
            pathname === '/'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Dashboard"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-medium text-sm">Dashboard</span>
        </Link>
        <Link
          href="/projects"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
            pathname === '/projects'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Projects"
        >
          <span className={`material-symbols-outlined ${pathname === '/projects' ? 'fill-1' : ''}`}>
            view_kanban
          </span>
          <span className="font-medium text-sm">Projects</span>
        </Link>
        <Link
          href="/tasks"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
            pathname === '/tasks'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Tasks"
        >
          <span className="material-symbols-outlined">task_alt</span>
          <span className="font-medium text-sm">Tasks</span>
        </Link>
        <Link
          href="/team"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
            pathname === '/team'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Team"
        >
          <span className="material-symbols-outlined">group</span>
          <span className="font-medium text-sm">Team</span>
        </Link>
      </nav>
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1 mb-2">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Personal
          </p>
        </div>
        <Link
          href="/my-tasks"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
            pathname === '/my-tasks'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="My Tasks"
        >
          <span className="material-symbols-outlined">assignment_ind</span>
          <span className="font-medium text-sm">My Tasks</span>
        </Link>
        <Link
          href="/notifications"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
            pathname === '/notifications'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="font-medium text-sm">Notifications</span>
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-medium text-sm">Settings</span>
        </Link>
      </div>
    </aside>
  );
};
