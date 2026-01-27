'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';
import { DEFAULT_USER } from '../constants';
import { useUser } from '@/hooks/useUser';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { useNotifications } from '@/hooks/useNotifications';
import { SearchDropdown } from './SearchDropdown';
import { NotificationPreview } from './NotificationPreview';

interface AppHeaderProps {
  title?: string;
  user?: User;
  showDateRange?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  actions?: React.ReactNode;
}

export const AppHeader = ({
  title = 'Dashboard',
  user: propUser,
  showDateRange = false,
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearchChange,
  actions,
}: AppHeaderProps) => {
  // Automatically fetch current user based on auth ID
  const { data: apiUser, isLoading: isLoadingUser } = useUser();
  // Use prop user if provided, otherwise use fetched user, fallback to default
  const user = propUser || apiUser || DEFAULT_USER;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationHovered, setIsNotificationHovered] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Fetch data for search
  const { data: projects = [] } = useProjects();
  const { data: tasksData } = useTasks();
  const tasks = tasksData?.pages.flatMap((page) => page.tasks) ?? [];
  const { data: teamMembers = [] } = useTeam();
  const { data: notifications = [] } = useNotifications();

  // Calculate unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        // Check if click is outside notification preview
        const target = event.target as HTMLElement;
        if (!target.closest('[data-notification-preview]')) {
          setIsNotificationHovered(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const handleNotificationMouseEnter = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
    setIsNotificationHovered(true);
  };

  const handleNotificationMouseLeave = () => {
    // Add delay before closing to allow user to move mouse to dropdown
    notificationTimeoutRef.current = setTimeout(() => {
      setIsNotificationHovered(false);
    }, 300); // 300ms delay
  };

  const handleDateRangeClick = () => {
    // In real app, this would open a date range picker modal
    console.log('Open date range picker');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
    if (value.length > 0) {
      setIsSearchFocused(true);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.length > 0) {
      setIsSearchFocused(true);
    }
  };

  const handleSearchBlur = (e: React.FocusEvent) => {
    // Check if the blur is happening because we're clicking inside the dropdown
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (searchRef.current?.contains(relatedTarget)) {
      return;
    }
    // Delay to allow click events on dropdown items
    setTimeout(() => setIsSearchFocused(false), 150);
  };

  const showDropdown = isSearchFocused && searchQuery.length > 0;

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-[#1a202c] border-b border-[#e8ebf3] dark:border-[#2d3748] shrink-0">
      <div className="flex items-center gap-4 flex-1">
        {showSearch ? (
          <div className="flex-1 max-w-xl" ref={searchRef}>
            <div className="relative w-full group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#506395] group-focus-within:text-primary transition-colors z-10">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-background-light dark:bg-gray-800 border-none rounded-lg text-sm text-[#0e121b] dark:text-white placeholder-[#506395] focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-900 transition-all"
                placeholder={searchPlaceholder}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                aria-label="Search"
              />
              {showDropdown && (
                <SearchDropdown
                  query={searchQuery}
                  projects={projects}
                  tasks={tasks}
                  teamMembers={teamMembers}
                  onClose={() => setIsSearchFocused(false)}
                />
              )}
            </div>
          </div>
        ) : (
          <h2 className="text-lg font-bold">{title}</h2>
        )}
      </div>
      <div className="flex items-center gap-6">
        {showDateRange && (
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
        )}
        {actions}
        <div className="relative" ref={notificationRef}>
          <button
            className="relative p-2 text-[#506395] hover:text-primary transition-colors"
            onClick={() => router.push('/notifications')}
            onMouseEnter={handleNotificationMouseEnter}
            onMouseLeave={handleNotificationMouseLeave}
            aria-label={`View notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-danger rounded-full border-2 border-white dark:border-[#1a202c]">
                <span className="text-[10px] font-bold text-white leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </span>
            )}
          </button>
          {isNotificationHovered && (
            <>
              {/* Invisible bridge to prevent accidental close when moving mouse */}
              <div
                className="absolute top-full right-0 w-full h-2"
                onMouseEnter={handleNotificationMouseEnter}
                onMouseLeave={handleNotificationMouseLeave}
              />
              <div
                data-notification-preview
                onMouseEnter={handleNotificationMouseEnter}
                onMouseLeave={handleNotificationMouseLeave}
                className="pointer-events-auto"
              >
                <NotificationPreview
                  notifications={notifications}
                  onClose={() => {
                    if (notificationTimeoutRef.current) {
                      clearTimeout(notificationTimeoutRef.current);
                    }
                    setIsNotificationHovered(false);
                  }}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 pl-6 border-l border-[#e8ebf3] dark:border-[#2d3748]">
          {isLoadingUser ? (
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              <div
                className="size-10 rounded-full bg-cover bg-center border border-[#e8ebf3] dark:border-[#2d3748]"
                style={{ 
                  backgroundImage: user.avatar ? `url("${user.avatar}")` : undefined,
                  backgroundColor: user.avatar ? undefined : '#e5e7eb'
                }}
                role="img"
                aria-label={`${user.name} profile picture`}
              >
                {!user.avatar && (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-[#0e121b] dark:text-white truncate">
                  {user.name}
                </span>
                <span className="text-xs text-[#506395] dark:text-gray-400 truncate capitalize">
                  {user.role}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
