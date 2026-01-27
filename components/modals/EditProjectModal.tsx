'use client';

import { useState, useEffect } from 'react';
import { Project } from '../types';
import { validateProjectName } from '@/lib/validation';
import { sanitizeForStorage } from '@/lib/security';

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onSave: (data: { name: string; client: string }) => void;
  onClose: () => void;
}

export const EditProjectModal = ({
  isOpen,
  project,
  onSave,
  onClose,
}: EditProjectModalProps) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (project) {
      setName(project.name);
      setClient(project.client || '');
    }
  }, [project]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const nameValidation = validateProjectName(name);
    if (!nameValidation.isValid) {
      setErrors({ name: nameValidation.error });
      return;
    }

    if (name.trim()) {
      onSave({
        name: sanitizeForStorage(name.trim()),
        client: sanitizeForStorage(client.trim()),
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-project-modal-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      <div
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
                edit
              </span>
            </div>
            <div className="flex-1">
              <h3
                id="edit-project-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Edit Project
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Update project details
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                maxLength={100}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none ${
                  errors.name
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter project name"
                required
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                placeholder="Enter client name"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
