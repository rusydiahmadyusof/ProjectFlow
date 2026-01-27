'use client';

import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { PageTransition } from './PageTransition';
import { User } from '../types';

interface AppLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerUser?: User;
  showDateRange?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  headerActions?: ReactNode;
}

export const AppLayout = ({
  children,
  headerTitle,
  headerUser,
  showDateRange,
  showSearch,
  searchPlaceholder,
  onSearchChange,
  headerActions,
}: AppLayoutProps) => {
  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
        <AppHeader
          title={headerTitle}
          user={headerUser}
          showDateRange={showDateRange}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={onSearchChange}
          actions={headerActions}
        />
        <main className="flex-1 overflow-y-auto p-6 relative min-h-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
};
