'use client';

import { useState } from 'react';
import { User } from '../types';
import { DEFAULT_USER } from '../constants';

interface ProjectsHeaderProps {
  user?: User;
}


const handleMenuClick = () => {
  console.log('Toggle mobile menu');
};

const handleNotificationsClick = () => {
  console.log('Open notifications');
};

const handleSearch = (query: string) => {
  console.log('Search:', query);
};

export const ProjectsHeader = ({ user = DEFAULT_USER }: ProjectsHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 shrink-0">
      <div className="flex items-center md:hidden">
        <button
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          onClick={handleMenuClick}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
      <div className="hidden md:block w-48"></div>
      <div className="flex-1 max-w-xl px-4">
        <div className="relative w-full group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all"
            placeholder="Search projects..."
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search projects"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 w-48 justify-end">
        <button
          className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          onClick={handleNotificationsClick}
          aria-label="View notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <div className="flex items-center gap-3 cursor-pointer p-1 pr-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <div
            className="h-9 w-9 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700"
            style={{ backgroundImage: `url('${user.avatar}')` }}
            role="img"
            aria-label={`${user.name} profile picture`}
          ></div>
          <div className="hidden lg:flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              {user.name}
            </span>
            <span className="text-[11px] text-slate-500 leading-tight">{user.role}</span>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[20px]">
            expand_more
          </span>
        </div>
      </div>
    </header>
  );
};
