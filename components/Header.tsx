'use client';

import { User } from './types';
import { DEFAULT_USER } from './constants';

interface HeaderProps {
  user?: User;
}

const handleDateRangeClick = () => {
  // Date range picker handler
  console.log('Open date range picker');
};

const handleNotificationsClick = () => {
  // Notifications handler
  console.log('Open notifications');
};

export const Header = ({ user = DEFAULT_USER }: HeaderProps) => {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-[#1a202c] border-b border-[#e8ebf3] dark:border-[#2d3748] shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold">Dashboard</h2>
      </div>
      <div className="flex items-center gap-6">
        <button
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background-light dark:bg-gray-800 rounded-lg border border-[#e8ebf3] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={handleDateRangeClick}
          aria-label="Select date range"
        >
          <span className="material-symbols-outlined text-[#506395] text-[20px]">
            calendar_today
          </span>
          <span className="text-sm font-medium text-[#0e121b] dark:text-white">Last 30 Days</span>
          <span className="material-symbols-outlined text-[#506395] text-[20px]">expand_more</span>
        </button>
        <button
          className="relative p-2 text-[#506395] hover:text-primary transition-colors"
          onClick={handleNotificationsClick}
          aria-label="View notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 size-2 bg-danger rounded-full border-2 border-white dark:border-[#1a202c]"></span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-[#e8ebf3] dark:border-[#2d3748]">
          <div
            className="size-10 rounded-full bg-cover bg-center border border-[#e8ebf3]"
            style={{ backgroundImage: `url("${user.avatar}")` }}
            role="img"
            aria-label={`${user.name} profile picture`}
          ></div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-[#0e121b] dark:text-white truncate">
              {user.name}
            </span>
            <span className="text-xs text-[#506395] truncate">{user.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
