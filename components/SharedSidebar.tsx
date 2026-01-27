'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SharedSidebarProps {
  variant?: 'default' | 'projects' | 'tasks' | 'team' | 'my-tasks' | 'notifications' | 'settings';
}

export const SharedSidebar = ({ variant = 'default' }: SharedSidebarProps) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const getMainNavItems = () => {
    switch (variant) {
      case 'projects':
        return [
          { icon: 'dashboard', label: 'Dashboard', href: '/' },
          { icon: 'view_kanban', label: 'Projects', href: '/projects', active: true },
          { icon: 'task_alt', label: 'Tasks', href: '/tasks' },
          { icon: 'group', label: 'Team', href: '/team' },
        ];
      case 'tasks':
        return [
          { icon: 'grid_view', label: 'Dashboard', href: '/' },
          { icon: 'folder', label: 'Projects', href: '/projects' },
          { icon: 'task_alt', label: 'Tasks', href: '/tasks', active: true },
          { icon: 'group', label: 'Team', href: '/team' },
        ];
      case 'team':
        return [
          { icon: 'grid_view', label: 'Dashboard', href: '/' },
          { icon: 'folder_open', label: 'Projects', href: '/projects' },
          { icon: 'check_box', label: 'Tasks', href: '/tasks' },
          { icon: 'group', label: 'Team', href: '/team', active: true },
        ];
      case 'my-tasks':
        return [
          { icon: 'dashboard', label: 'Dashboard', href: '/' },
          { icon: 'check_circle', label: 'My Tasks', href: '/my-tasks', active: true },
          { icon: 'folder', label: 'Projects', href: '/projects' },
          { icon: 'group', label: 'Team', href: '/team' },
        ];
      case 'notifications':
        return [
          { icon: 'dashboard', label: 'Dashboard', href: '/' },
          { icon: 'folder', label: 'Projects', href: '/projects' },
          { icon: 'check_circle', label: 'Tasks', href: '/tasks' },
          { icon: 'group', label: 'Team', href: '/team' },
        ];
      case 'settings':
        return [
          { icon: 'dashboard', label: 'Dashboard', href: '/' },
          { icon: 'folder', label: 'Project', href: '/projects' },
          { icon: 'check_box', label: 'Task', href: '/tasks' },
          { icon: 'group', label: 'Team', href: '/team' },
        ];
      default:
        return [
          { icon: 'grid_view', label: 'Dashboard', href: '/', active: true },
          { icon: 'view_kanban', label: 'Projects', href: '/projects' },
          { icon: 'check_box', label: 'Tasks', href: '/tasks' },
          { icon: 'group', label: 'Team', href: '/team' },
        ];
    }
  };

  const getPersonalNavItems = () => {
    switch (variant) {
      case 'team':
        return [
          { icon: 'task_alt', label: 'My Tasks', href: '/my-tasks' },
          { icon: 'notifications', label: 'Notifications', href: '/notifications' },
          { icon: 'settings', label: 'Settings', href: '/settings' },
        ];
      case 'my-tasks':
        return [
          { icon: 'check_circle', label: 'My Tasks', href: '/my-tasks', active: true },
          { icon: 'settings', label: 'Settings', href: '/settings' },
        ];
      case 'notifications':
        return [
          { icon: 'notifications', label: 'Notifications', href: '/notifications', active: true },
          { icon: 'settings', label: 'Settings', href: '/settings' },
        ];
      case 'settings':
        return [
          { icon: 'check_circle', label: 'My Task', href: '/my-tasks' },
          { icon: 'notifications', label: 'Notification', href: '/notifications' },
          { icon: 'settings', label: 'Setting', href: '/settings', active: true },
        ];
      default:
        return [
          { icon: 'task_alt', label: 'My Tasks', href: '/my-tasks' },
          { icon: 'notifications', label: 'Notifications', href: '/notifications' },
          { icon: 'settings', label: 'Settings', href: '/settings' },
        ];
    }
  };

  const mainNavItems = getMainNavItems();
  const personalNavItems = getPersonalNavItems();

  if (variant === 'team') {
    return (
      <aside className="hidden lg:flex h-full w-72 flex-col justify-between border-r border-[#e8ebf3] bg-white dark:bg-[#1a202c] overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <Link href="/" className="flex items-center gap-3 px-2 py-4">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10 shadow-sm flex items-center justify-center bg-primary text-white">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                waves
              </span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#0e121b] dark:text-white text-base font-bold leading-normal">
                Project Flow
              </h1>
              <p className="text-[#506395] text-xs font-normal leading-normal">Management</p>
            </div>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="px-3 py-2">
              <p className="text-[#506395] text-xs font-bold uppercase tracking-wider">Workspace</p>
            </div>
            {mainNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href) || item.active
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    isActive(item.href) || item.active
                      ? 'text-primary'
                      : 'text-[#506395] group-hover:text-primary transition-colors'
                  }`}
                  style={{ fontSize: '24px' }}
                >
                  {item.icon}
                </span>
                <p
                  className={`text-sm font-medium leading-normal ${
                    isActive(item.href) || item.active
                      ? 'font-bold'
                      : 'text-[#0e121b] dark:text-gray-200'
                  }`}
                >
                  {item.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-[#e8ebf3] dark:border-gray-700">
          <div className="flex flex-col gap-1 mb-2">
            <div className="px-3 py-2">
              <p className="text-[#506395] text-xs font-bold uppercase tracking-wider">Personal</p>
            </div>
            {personalNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href) || item.active
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    isActive(item.href) || item.active
                      ? 'text-primary'
                      : 'text-[#506395] group-hover:text-primary transition-colors'
                  }`}
                  style={{ fontSize: '24px' }}
                >
                  {item.icon}
                </span>
                <p className="text-[#0e121b] dark:text-gray-200 text-sm font-medium leading-normal">
                  {item.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (variant === 'projects') {
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
          {mainNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive(item.href) || item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label={item.label}
            >
              <span
                className={`material-symbols-outlined ${isActive(item.href) || item.active ? 'fill-1' : ''}`}
              >
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1 mb-2">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Personal
            </p>
          </div>
          {personalNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive(item.href) || item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label={item.label}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>
    );
  }

  // Default sidebar style for other variants
  return (
    <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark hidden lg:flex flex-col flex-shrink-0 z-20">
      <Link href="/" className="h-16 flex items-center px-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3 text-text-main dark:text-white">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-[20px]">account_tree</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Project Flow</h2>
        </div>
      </Link>
      <nav className="flex flex-col flex-1 px-4 py-6 gap-8 overflow-y-auto custom-scrollbar justify-between">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
            Main Menu
          </p>
          {mainNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                isActive(item.href) || item.active
                  ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isActive(item.href) || item.active
                    ? 'fill-current'
                    : 'group-hover:text-primary transition-colors'
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">
            Secondary
          </p>
          {personalNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                isActive(item.href) || item.active
                  ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isActive(item.href) || item.active
                    ? 'fill-current'
                    : 'group-hover:text-primary transition-colors'
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
};
