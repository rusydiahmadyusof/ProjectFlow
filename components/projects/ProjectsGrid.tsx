'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';
import { useProjects, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { CreateProjectModal, EditProjectModal, ConfirmationModal, AlertModal, AssignProjectMembersModal } from '../modals';
import { useUser } from '@/hooks/useUser';
import { canCreateProject, canArchiveProject, canDeleteProject } from '../utils/permissions';

type SortOption = 'name' | 'progress' | 'dueDate' | 'status';
type ViewMode = 'grid' | 'list';

interface ProjectsGridProps {
  searchQuery?: string;
}

export const ProjectsGrid = ({ searchQuery = '' }: ProjectsGridProps) => {
  const { data: projects = [], isLoading, error } = useProjects();
  const { data: user } = useUser();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [archiveProject, setArchiveProject] = useState<Project | null>(null);
  const [deleteProjectState, setDeleteProjectState] = useState<Project | null>(null);
  const [assignMembersProject, setAssignMembersProject] = useState<Project | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  const userRole = user?.role;
  const canCreate = canCreateProject(userRole);
  const canArchive = canArchiveProject(userRole);
  const canDelete = canDeleteProject(userRole);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(e.target.value);
  };

  const searchTerm = searchQuery || filterQuery;

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(
      (project) => {
        // Filter by archived status
        if (!showArchived && project.isArchived) return false;
        if (showArchived && !project.isArchived) return false;
        
        // Filter by search term
        return (
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    );

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return b.progress - a.progress;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'dueDate':
          // Simple date comparison (in real app, parse dates properly)
          return a.dueDate.localeCompare(b.dueDate);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchTerm, sortBy, showArchived]);

  const handleProjectClick = (project: Project) => {
    router.push(`/tasks?projectId=${project.id}`);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleSaveEdit = async (data: { name: string; client: string }) => {
    if (!editingProject) return;

    try {
      await updateProject.mutateAsync({
        id: editingProject.id,
        name: data.name,
        client: data.client,
      });
      setEditingProject(null);
      setAlertMessage({
        title: 'Success',
        message: 'Project updated successfully!',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to update project', err);
      setAlertMessage({
        title: 'Error',
        message: 'Failed to update project. Please try again.',
        type: 'error',
      });
    }
  };

  const handleArchiveProject = (project: Project) => {
    setArchiveProject(project);
  };

  const handleConfirmArchive = async () => {
    if (!archiveProject) return;

    try {
      await updateProject.mutateAsync({
        id: archiveProject.id,
        isArchived: true,
      });
      setArchiveProject(null);
      setAlertMessage({
        title: 'Success',
        message: `Project "${archiveProject.name}" has been archived.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to archive project', err);
      setArchiveProject(null);
      setAlertMessage({
        title: 'Error',
        message: 'Failed to archive project. Please try again.',
        type: 'error',
      });
    }
  };

  const handleUnarchiveProject = async (project: Project) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        isArchived: false,
      });
      setAlertMessage({
        title: 'Success',
        message: `Project "${project.name}" has been unarchived.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to unarchive project', err);
      setAlertMessage({
        title: 'Error',
        message: 'Failed to unarchive project. Please try again.',
        type: 'error',
      });
    }
  };

  const handleDeleteProject = (project: Project) => {
    setDeleteProjectState(project);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProjectState) return;

    try {
      await deleteProject.mutateAsync(deleteProjectState.id);
      setDeleteProjectState(null);
      setAlertMessage({
        title: 'Success',
        message: `Project "${deleteProjectState.name}" has been deleted.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to delete project', err);
      setDeleteProjectState(null);
      setAlertMessage({
        title: 'Error',
        message: 'Failed to delete project. Please try again.',
        type: 'error',
      });
    }
  };

  const handleViewDetails = (project: Project) => {
    router.push(`/tasks?projectId=${project.id}`);
  };

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6">
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">Loading projects...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col gap-6">
        <div className="text-center py-12">
          <p className="text-red-500">Error loading projects. Please try again.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Projects
        </h2>
        <div className="flex items-center gap-3">
          <button
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showArchived
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            onClick={() => setShowArchived(!showArchived)}
            aria-label={showArchived ? 'Hide archived projects' : 'Show archived projects'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showArchived ? 'visibility_off' : 'archive'}
            </span>
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          {canCreate && (
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
              onClick={() => setIsCreateModalOpen(true)}
              aria-label="Create new project"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Create Project
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 p-1">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </span>
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
            placeholder="Filter projects by name, client, or status..."
            type="text"
            value={filterQuery}
            onChange={handleFilterChange}
            aria-label="Filter projects"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 shadow-sm transition-colors appearance-none pr-8 cursor-pointer"
              aria-label="Sort projects"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="status">Sort by Status</option>
              <option value="dueDate">Sort by Due Date</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </span>
          </div>
          <button
            className={`px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 shadow-sm transition-colors ${
              viewMode === 'grid' ? 'bg-primary/10 text-primary border-primary' : ''
            }`}
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            aria-label="Toggle grid view"
          >
            <span className="material-symbols-outlined text-[18px]">
              {viewMode === 'grid' ? 'view_list' : 'grid_view'}
            </span>
          </button>
        </div>
      </div>
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
        {filteredAndSortedProjects.length > 0 ? (
          filteredAndSortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
              onEdit={handleEditProject}
              onArchive={canArchive && !project.isArchived ? handleArchiveProject : undefined}
              onUnarchive={canArchive && project.isArchived ? handleUnarchiveProject : undefined}
              onDelete={canDelete ? handleDeleteProject : undefined}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No projects found matching your filter.</p>
          </div>
        )}
      </div>
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={(project) => {
          setIsCreateModalOpen(false);
          setAssignMembersProject(project);
        }}
      />
      {assignMembersProject && (
        <AssignProjectMembersModal
          isOpen={!!assignMembersProject}
          projectId={assignMembersProject.id}
          projectName={assignMembersProject.name}
          initialLeaderId={assignMembersProject.projectLeaderId ?? null}
          onClose={() => setAssignMembersProject(null)}
          onComplete={() => {
            setAlertMessage({
              title: 'Members assigned',
              message: `Team members have been assigned to "${assignMembersProject.name}".`,
              type: 'success',
            });
          }}
        />
      )}
      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onSave={handleSaveEdit}
        onClose={() => setEditingProject(null)}
      />
      <ConfirmationModal
        isOpen={!!archiveProject}
        title="Archive Project"
        message={`Archive "${archiveProject?.name}"?\n\nThis will mark the project as archived but keep its data.`}
        confirmText="Archive"
        cancelText="Cancel"
        type="warning"
        onConfirm={handleConfirmArchive}
        onCancel={() => setArchiveProject(null)}
      />
      <ConfirmationModal
        isOpen={!!deleteProjectState}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deleteProjectState?.name}"?\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteProjectState(null)}
      />
      {alertMessage && (
        <AlertModal
          isOpen={!!alertMessage}
          title={alertMessage.title}
          message={alertMessage.message}
          type={alertMessage.type}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </section>
  );
};
