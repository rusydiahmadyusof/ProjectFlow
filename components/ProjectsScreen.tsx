'use client';

import { useState } from 'react';
import { AppLayout } from './layout/AppLayout';
import { QuickStats, ProjectsGrid } from './projects';

export const ProjectsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <AppLayout
        headerTitle="Projects"
        showSearch
        searchPlaceholder="Search projects..."
        onSearchChange={setSearchQuery}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <QuickStats />
          <ProjectsGrid searchQuery={searchQuery} />
        </div>
      </AppLayout>
    </>
  );
};
