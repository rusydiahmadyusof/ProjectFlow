'use client';

import { useState } from 'react';
import { AppLayout, PageContent } from './layout';
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
        <PageContent>
          <QuickStats />
          <ProjectsGrid searchQuery={searchQuery} />
        </PageContent>
      </AppLayout>
    </>
  );
};
