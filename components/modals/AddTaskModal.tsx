'use client';

import { useMemo, useState } from 'react';
import { useCreateTask } from '@/hooks/useTasks';
import { useCreateActivity } from '@/hooks/useActivities';
import { useProjects } from '@/hooks/useProjects';
import { useUser } from '@/hooks/useUser';
import { validateTaskTitle } from '@/lib/validation';
import { sanitizeForStorage } from '@/lib/security';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import type { TaskSubtask } from '@/components/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const AddTaskModal = ({ isOpen, onClose, defaultProjectId }: AddTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [status, setStatus] = useState<'to-do' | 'in-progress' | 'done' | 'pending'>('to-do');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [errors, setErrors] = useState<{ title?: string }>({});
  const createTask = useCreateTask();
  const createActivity = useCreateActivity();
  const { data: currentUser } = useUser();
  const { data: projects = [] } = useProjects();

  const effectiveProjectId = useMemo(
    () => defaultProjectId || projectId || '',
    [defaultProjectId, projectId]
  );

  const { data: projectMembers = [] } = useProjectMembers(effectiveProjectId || null);

  const selectedAssignee = useMemo(
    () => projectMembers.find((member) => member.id === assigneeId),
    [assigneeId, projectMembers]
  );

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

    if (!effectiveProjectId) {
      return;
    }

    try {
      const selectedProject = projects.find((p) => p.id === effectiveProjectId);
      await createTask.mutateAsync({
        title: sanitizeForStorage(title),
        description: description.trim() ? sanitizeForStorage(description.trim()) : undefined,
        subtasks: subtasks.filter((st) => st.title.trim()).map((st) => ({
          id: st.id,
          title: sanitizeForStorage(st.title.trim()),
          isCompleted: false,
        })),
        project: selectedProject?.name || '',
        projectId: effectiveProjectId,
        dueDate,
        priority,
        status,
        assignee: selectedAssignee
          ? {
              id: selectedAssignee.id,
              name: selectedAssignee.name,
              avatar: selectedAssignee.avatar,
            }
          : undefined,
      });
      createActivity.mutateAsync({
        user: currentUser?.name ?? 'Someone',
        action: 'added task',
        target: title.trim(),
        icon: 'add_task',
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
      }).catch(() => {});
      setTitle('');
      setDescription('');
      setSubtasks([]);
      setProjectId(defaultProjectId || '');
      setDueDate('');
      setPriority('medium');
      setStatus('to-do');
      setAssigneeId('');
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
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary resize-y min-h-[80px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Add details about the task (optional)"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[#0e121b] dark:text-white">
                Subtasks
              </label>
              <button
                type="button"
                onClick={() =>
                  setSubtasks((prev) => [
                    ...prev,
                    { id: `st-${Date.now()}-${prev.length}`, title: '', isCompleted: false },
                  ])
                }
                className="text-xs text-primary hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add subtask
              </button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-2">
                {subtasks.map((st, index) => (
                  <div key={st.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => {
                        const next = [...subtasks];
                        next[index] = { ...st, title: e.target.value };
                        setSubtasks(next);
                      }}
                      placeholder={`Subtask ${index + 1}`}
                      className="flex-1 px-3 py-2 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-sm text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSubtasks((prev) => prev.filter((s) => s.id !== st.id))}
                      className="p-1.5 rounded-lg text-[#506395] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label={`Remove subtask ${index + 1}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!defaultProjectId && (
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
          )}
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
              Assign To
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
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
              disabled={createTask.isPending || !title.trim() || !effectiveProjectId}
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
