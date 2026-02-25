'use client';

import { useState, useEffect } from 'react';
import { useCreateProject } from '@/hooks/useProjects';
import { useCreateActivity } from '@/hooks/useActivities';
import { useUser } from '@/hooks/useUser';
import { sanitizeForStorage } from '@/lib/security';
import type { Project } from '@/components/types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: Project) => void;
}

const inputBase =
  'w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-gray-400 dark:placeholder:text-gray-500';
const inputError = 'border-red-300 dark:border-red-700';
const inputNormal = 'border-[#e8ebf3] dark:border-gray-700';
const labelClass = 'block text-sm font-medium text-[#0e121b] dark:text-white mb-1';

export const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createProject = useCreateProject();
  const createActivity = useCreateActivity();
  const { data: currentUser } = useUser();

  useEffect(() => {
    if (!isOpen) {
      setSubmitError(null);
      setErrors({});
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setClient('');
    setDueDate('');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});
    try {
      const created = await createProject.mutateAsync({
        name: sanitizeForStorage(name.trim()),
        client: sanitizeForStorage(client.trim()),
        dueDate: dueDate.trim(),
        progress: 0,
        status: 'on-track',
        taskCount: 0,
        teamMembers: [],
      });
      createActivity.mutateAsync({
        user: currentUser?.name ?? 'Someone',
        action: 'created project',
        target: created.name,
        icon: 'folder_open',
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      }).catch(() => {});
      resetForm();
      onClose();
      onProjectCreated?.(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project. Please try again.';
      setSubmitError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a202c] rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#0e121b] dark:text-white">Create New Project</h2>
            <p className="text-sm text-[#506395] dark:text-gray-400 mt-1">
              Enter the project name, client, and due date.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#506395] hover:text-[#0e121b] dark:hover:text-white transition-colors p-1"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            {submitError && (
              <div
                className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
                role="alert"
              >
                {submitError}
              </div>
            )}

            <div>
              <label className={labelClass}>Project Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  if (submitError) setSubmitError(null);
                }}
                required
                maxLength={200}
                className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
                placeholder="e.g. Q1 Marketing Campaign"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className={labelClass}>Client Name</label>
              <input
                type="text"
                value={client}
                onChange={(e) => {
                  setClient(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
                maxLength={200}
                className={`${inputBase} ${inputNormal}`}
                placeholder="Enter client or internal stakeholder"
              />
            </div>

            <div>
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
          </div>

          <div className="flex-shrink-0 flex gap-3 p-6 pt-4 border-t border-[#e8ebf3] dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
