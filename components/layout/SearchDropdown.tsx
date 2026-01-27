'use client';

import { useRouter } from 'next/navigation';
import { Project, Task, TeamMember } from '../types';

interface SearchResult {
  type: 'project' | 'task' | 'person';
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  href: string;
}

interface SearchDropdownProps {
  query: string;
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  onClose: () => void;
}

export const SearchDropdown = ({
  query,
  projects,
  tasks,
  teamMembers,
  onClose,
}: SearchDropdownProps) => {
  const router = useRouter();
  const lowerQuery = query.toLowerCase();

  // Filter projects
  const matchedProjects: SearchResult[] = projects
    .filter(
      (project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.client.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 5)
    .map((project) => ({
      type: 'project' as const,
      id: project.id,
      title: project.name,
      subtitle: project.client,
      icon: 'folder',
      href: `/tasks?projectId=${project.id}`,
    }));

  // Filter tasks
  const matchedTasks: SearchResult[] = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.project.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 5)
    .map((task) => ({
      type: 'task' as const,
      id: task.id,
      title: task.title,
      subtitle: task.project,
      icon: 'task',
      href: task.projectId ? `/tasks?projectId=${task.projectId}` : '/tasks',
    }));

  // Filter team members
  const matchedPeople: SearchResult[] = teamMembers
    .filter(
      (member) =>
        member.name.toLowerCase().includes(lowerQuery) ||
        member.email.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 5)
    .map((member) => ({
      type: 'person' as const,
      id: member.id,
      title: member.name,
      subtitle: member.email,
      icon: 'person',
      href: `/team`,
    }));

  const allResults: SearchResult[] = [...matchedProjects, ...matchedTasks, ...matchedPeople];

  if (allResults.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a202c] border border-[#e8ebf3] dark:border-[#2d3748] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        <div className="p-4 text-center text-[#506395] text-sm">
          No results found for &quot;{query}&quot;
        </div>
      </div>
    );
  }

  const handleResultClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    router.push(href);
  };

  // Group results by type
  const groupedResults = {
    projects: matchedProjects,
    tasks: matchedTasks,
    people: matchedPeople,
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a202c] border border-[#e8ebf3] dark:border-[#2d3748] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="py-2">
        {groupedResults.projects.length > 0 && (
          <div className="mb-2">
            <div className="px-4 py-2 text-xs font-semibold text-[#506395] uppercase tracking-wider">
              Projects
            </div>
            {groupedResults.projects.map((result) => (
              <button
                key={`project-${result.id}`}
                onMouseDown={(e) => handleResultClick(e, result.href)}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[20px] text-[#506395]">
                  folder
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#0e121b] dark:text-white truncate">
                    {result.title}
                  </div>
                  {result.subtitle && (
                    <div className="text-xs text-[#506395] truncate">{result.subtitle}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {groupedResults.tasks.length > 0 && (
          <div className="mb-2">
            <div className="px-4 py-2 text-xs font-semibold text-[#506395] uppercase tracking-wider">
              Tasks
            </div>
            {groupedResults.tasks.map((result) => (
              <button
                key={`task-${result.id}`}
                onMouseDown={(e) => handleResultClick(e, result.href)}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[20px] text-[#506395]">
                  task
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#0e121b] dark:text-white truncate">
                    {result.title}
                  </div>
                  {result.subtitle && (
                    <div className="text-xs text-[#506395] truncate">{result.subtitle}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {groupedResults.people.length > 0 && (
          <div className="mb-2">
            <div className="px-4 py-2 text-xs font-semibold text-[#506395] uppercase tracking-wider">
              People
            </div>
            {groupedResults.people.map((result) => (
              <button
                key={`person-${result.id}`}
                onMouseDown={(e) => handleResultClick(e, result.href)}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[20px] text-[#506395]">
                  person
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#0e121b] dark:text-white truncate">
                    {result.title}
                  </div>
                  {result.subtitle && (
                    <div className="text-xs text-[#506395] truncate">{result.subtitle}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
