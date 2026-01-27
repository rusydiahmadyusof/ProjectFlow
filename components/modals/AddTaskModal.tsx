'use client';

import { useState } from 'react';
import { useCreateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { validateTaskTitle } from '@/lib/validation';
import { sanitizeForStorage } from '@/lib/security';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const AddTaskModal = ({ isOpen, onClose, defaultProjectId }: AddTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [status, setStatus] = useState<'to-do' | 'in-progress' | 'done' | 'pending'>('to-do');
  const [errors, setErrors] = useState<{ title?: string }>({});
  const createTask = useCreateTask();
  const { data: projects = [] } = useProjects();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const titleValidation = validateTaskTitle(title);
    if (!titleValidation.isValid) {
      setErrors({ title: titleValidation.error });
      return;
    }

    try {
      const selectedProject = projects.find((p) => p.id === projectId);
      await createTask.mutateAsync({
        title: sanitizeForStorage(title),
        project: selectedProject?.name || '',
        projectId,
        dueDate,
        priority,
        status,
      });
      setTitle('');
      setProjectId(defaultProjectId || '');
      setDueDate('');
      setPriority('medium');
      setStatus('to-do');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a202c] rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0e121b] dark:text-white">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-[#506395] hover:text-[#0e121b] dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              required
              maxLength={200}
              className={`w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.title
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-[#e8ebf3] dark:border-gray-700'
              }`}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">
              Project *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending || !title.trim() || !projectId}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
