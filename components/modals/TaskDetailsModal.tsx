'use client';

import { useEffect, useRef, useState } from 'react';
import { Task, TaskComment, TaskSubtask, TeamMember } from '../types';
import { getTaskStatusConfig, getTaskPriorityConfig } from '../utils/statusConfig';
import { useProjects } from '@/hooks/useProjects';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCreateActivity } from '@/hooks/useActivities';
import { useUser } from '@/hooks/useUser';
import { AssignTaskModal, SetReminderModal, ConfirmationModal, AlertModal } from './index';
import { uploadFile, formatFileSize, getFileIcon } from '@/lib/fileUpload';
import { validateComment } from '@/lib/validation';
import { sanitizeForStorage } from '@/lib/security';
import { sanitizeForDisplay } from '@/lib/security';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdate?: () => void;
}

export const TaskDetailsModal = ({ isOpen, onClose, task, onTaskUpdate }: TaskDetailsModalProps) => {
  const [commentText, setCommentText] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<
    TaskComment['attachments'] | undefined
  >(undefined);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const closeTaskModalAfterAlertRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: projects = [] } = useProjects();
  const { data: currentUser } = useUser();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createActivity = useCreateActivity();
  const [statusValue, setStatusValue] = useState<Task['status']>('to-do');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingDescriptionValue, setEditingDescriptionValue] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  // Debug logging
  console.log('TaskDetailsModal render:', { isOpen, task: task?.id, taskTitle: task?.title });

  useEffect(() => {
    if (task) {
      setStatusValue(task.status);
      if (!isEditingDescription) setEditingDescriptionValue(task.description ?? '');
    }
  }, [task?.id, task?.status, task?.description, isEditingDescription]);

  if (!isOpen || !task) {
    console.log('TaskDetailsModal not rendering:', { isOpen, hasTask: !!task });
    return null;
  }

  const priorityConfig = getTaskPriorityConfig(task.priority);
  const statusConfig = getTaskStatusConfig(statusValue);
  const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null;
  const completedSubtasks = task.subtasks?.filter((st) => st.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handlePostComment = async () => {
    if (!task || !currentUser) return;

    // Validate comment
    const validation = validateComment(commentText);
    if (!validation.isValid) {
      setCommentError(validation.error || 'Invalid comment');
      return;
    }

    setCommentError(null);

    try {
      // Create new comment
      const newComment: TaskComment = {
        id: `comment-${Date.now()}`,
        user: {
          name: currentUser.name,
          avatar: currentUser.avatar || '',
        },
        content: sanitizeForStorage(commentText),
        time: new Date().toISOString(),
        attachments: pendingAttachments,
      };

      // Get existing comments
      const existingComments = task.comments || [];
      const updatedComments = [...existingComments, newComment];

      // Update task with new comment
      await updateTask.mutateAsync({
        id: task.id,
        comments: updatedComments,
      });

      setCommentText('');
      setPendingAttachments(undefined);
      onTaskUpdate?.();
    } catch (err) {
      console.error('Failed to post comment', err);
      setCommentError('Failed to post comment. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!task || !event.target.files || event.target.files.length === 0) return;

    const files = Array.from(event.target.files);
    setUploadingFiles(true);
    setCommentError(null);

    try {
      const uploadPromises = files.map((file) => uploadFile(file, 'task-attachments', task.id));
      const results = await Promise.all(uploadPromises);

      const successfulUploads = results.filter((r) => r.success);
      const failedUploads = results.filter((r) => !r.success);

      if (failedUploads.length > 0) {
        setCommentError(`Failed to upload ${failedUploads.length} file(s)`);
      }

      if (successfulUploads.length > 0) {
        const uploadedAttachments =
          successfulUploads.map((result, index) => ({
            name: files[index].name,
            size: formatFileSize(files[index].size),
            type: files[index].type,
            url: result.url,
          })) || [];

        setPendingAttachments((current) => [
          ...(current ?? []),
          ...uploadedAttachments,
        ]);
      }
    } catch (err) {
      console.error('Failed to upload files', err);
      setCommentError('Failed to upload files. Please try again.');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAssignTask = async (assignee: TeamMember | null) => {
    if (!task) return;
    
    try {
      await updateTask.mutateAsync({
        id: task.id,
        assignee: assignee
          ? {
              id: assignee.id,
              name: assignee.name,
              avatar: assignee.avatar,
              email: assignee.email,
            }
          : undefined,
      });
      if (currentUser) {
        createActivity.mutateAsync({
          user: currentUser.name,
          action: assignee ? 'assigned' : 'unassigned',
          target: assignee ? `${task.title} to ${assignee.name}` : task.title,
          icon: 'person',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        }).catch(() => {});
      }
      onTaskUpdate?.();
    } catch (err) {
      console.error('Failed to assign task', err);
    }
  };

  const handleSetReminder = async (reminderDate: string | null) => {
    if (!task) return;
    
    try {
      await updateTask.mutateAsync({
        id: task.id,
        reminderDate: reminderDate || undefined,
      });
      onTaskUpdate?.();
    } catch (err) {
      console.error('Failed to set reminder', err);
    }
  };

  const statusLabels: Record<Task['status'], string> = {
    'to-do': 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
    overdue: 'Overdue',
    review: 'Review',
    drafting: 'Drafting',
    pending: 'Pending',
  };

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!task) return;

    const nextStatus = event.target.value as Task['status'];
    setStatusValue(nextStatus);

    try {
      await updateTask.mutateAsync({
        id: task.id,
        status: nextStatus,
        isCompleted: nextStatus === 'done',
      });
      if (currentUser) {
        if (nextStatus === 'done') {
          createActivity.mutateAsync({
            user: currentUser.name,
            action: 'completed',
            target: task.title,
            icon: 'check_circle',
            iconColor: 'text-primary',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          }).catch(() => {});
        } else {
          createActivity.mutateAsync({
            user: currentUser.name,
            action: 'moved to',
            target: `${task.title} · ${statusLabels[nextStatus] ?? nextStatus}`,
            icon: 'swap_horiz',
            iconColor: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          }).catch(() => {});
        }
      }
      onTaskUpdate?.();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDescriptionSave = async () => {
    if (!task) return;
    try {
      await updateTask.mutateAsync({
        id: task.id,
        description: sanitizeForStorage(editingDescriptionValue.trim()) || undefined,
      });
      if (currentUser) {
        createActivity.mutateAsync({
          user: currentUser.name,
          action: 'updated description of',
          target: task.title,
          icon: 'description',
          iconColor: 'text-slate-600',
          bgColor: 'bg-slate-50 dark:bg-slate-900/20',
        }).catch(() => {});
      }
      setIsEditingDescription(false);
      onTaskUpdate?.();
    } catch (err) {
      console.error('Failed to update description', err);
    }
  };

  const handleSubtaskToggle = async (subtaskId: string) => {
    if (!task?.subtasks) return;
    const next = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    try {
      await updateTask.mutateAsync({ id: task.id, subtasks: next });
      onTaskUpdate?.();
    } catch (err) {
      console.error('Failed to update subtask', err);
    }
  };

  const handleAddSubtask = async () => {
    if (!task) return;
    const newSubtask: TaskSubtask = {
      id: `st-${Date.now()}`,
      title: 'New subtask',
      isCompleted: false,
    };
    const next = [...(task.subtasks ?? []), newSubtask];
    try {
      await updateTask.mutateAsync({ id: task.id, subtasks: next });
      setEditingSubtaskId(newSubtask.id);
      setEditingSubtaskTitle(newSubtask.title);
      onTaskUpdate?.();
    } catch (err) {
      console.error('Failed to add subtask', err);
    }
  };

  const handleSubtaskTitleSave = async (subtaskId: string, title: string) => {
    if (!task?.subtasks) return;
    const next = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, title: sanitizeForStorage(title.trim()) || st.title } : st
    );
    try {
      await updateTask.mutateAsync({ id: task.id, subtasks: next });
      setEditingSubtaskId(null);
      setEditingSubtaskTitle('');
      onTaskUpdate?.();
    } catch (err) {
      console.error('Failed to update subtask title', err);
    }
  };

  const handleRemoveSubtask = async (subtaskId: string) => {
    if (!task?.subtasks) return;
    const next = task.subtasks.filter((st) => st.id !== subtaskId);
    try {
      await updateTask.mutateAsync({ id: task.id, subtasks: next });
      if (editingSubtaskId === subtaskId) {
        setEditingSubtaskId(null);
        setEditingSubtaskTitle('');
      }
      onTaskUpdate?.();
    } catch (err) {
      console.error('Failed to remove subtask', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a202c] rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col relative z-[101]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8ebf3] dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#506395] dark:text-gray-400">
            {project && (
              <>
                <span className="font-medium">{project.name}</span>
                {task.taskNumber && (
                  <>
                    <span>/</span>
                    <span>{task.taskNumber}</span>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded"
              aria-label="Delete task"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#506395] hover:text-[#0e121b] dark:hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left Column - Task Details */}
            <div className="lg:col-span-2 p-6 border-r border-[#e8ebf3] dark:border-gray-700">
              {/* Task Title Section */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className={`mt-1 ${
                    task.isCompleted
                      ? 'text-green-600'
                      : 'text-text-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[28px]">
                    {task.isCompleted ? 'check_circle' : 'check_circle_outline'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h2
                      className={`text-2xl font-bold text-[#0e121b] dark:text-white ${
                        task.isCompleted
                          ? 'line-through decoration-gray-400 dark:decoration-gray-600 text-gray-500'
                          : ''
                      }`}
                    >
                      {task.title}
                    </h2>
                    <button
                      className="p-2 text-[#506395] hover:text-primary transition-colors"
                      aria-label="Edit task"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </div>
                  <p className="text-sm text-[#506395] dark:text-gray-400">
                    in List {statusConfig.label}
                  </p>
                </div>
              </div>

              {/* Task Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-[#506395] dark:text-gray-400 uppercase tracking-wider mb-2">
                    Assignee
                  </label>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg p-1 -ml-1 transition-colors"
                  >
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        {task.assignee.avatar ? (
                          <div
                            className="size-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-cover bg-center"
                            style={{ backgroundImage: `url('${task.assignee.avatar}')` }}
                            role="img"
                            aria-label={`${task.assignee.name} avatar`}
                          ></div>
                        ) : (
                          <div className="size-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-[#0e121b] dark:text-white">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <div className="size-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          <span className="material-symbols-outlined text-[16px]">person_add</span>
                        </div>
                        <span className="text-sm font-medium text-[#506395] dark:text-gray-400">Assign</span>
                      </div>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#506395] dark:text-gray-400 uppercase tracking-wider mb-2">
                    Due Date
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#506395] dark:text-gray-400">
                      calendar_today
                    </span>
                    <p
                      className={`text-sm font-medium text-[#0e121b] dark:text-gray-300 ${
                        task.status === 'overdue' ? 'text-red-600 dark:text-red-400 font-bold' : ''
                      }`}
                    >
                      {task.dueDate}
                    </p>
                  </div>
                  {task.reminderDate && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="material-symbols-outlined text-[16px] text-primary">notifications</span>
                      <p className="text-xs text-primary">
                        Reminder: {new Date(task.reminderDate).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    className="mt-2 text-xs text-primary hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {task.reminderDate ? 'edit' : 'add'}
                    </span>
                    {task.reminderDate ? 'Edit Reminder' : 'Set Reminder'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#506395] dark:text-gray-400 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#506395] dark:text-gray-400">
                      flag
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${priorityConfig.bgColor}`}
                    >
                      {priorityConfig.label} Priority
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#506395] dark:text-gray-400 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    <div className={`size-2 rounded-full ${statusConfig.dotColor || 'bg-blue-500'}`}></div>
                    <select
                      className="text-sm font-medium text-[#0e121b] dark:text-white bg-transparent border-none focus:ring-0 cursor-pointer"
                      value={statusValue}
                      onChange={handleStatusChange}
                    >
                      <option value="to-do">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="review">Review</option>
                      <option value="drafting">Drafting</option>
                      <option value="pending">Pending</option>
                    </select>
                    <span className="material-symbols-outlined text-[16px] text-[#506395] dark:text-gray-400">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Section - always visible, editable */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-[#506395] dark:text-gray-400 uppercase tracking-wider mb-3">
                  Description
                </h3>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingDescriptionValue}
                      onChange={(e) => setEditingDescriptionValue(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      className="w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-sm text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary resize-y placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Add a description..."
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDescriptionSave}
                        className="px-3 py-1.5 bg-primary hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingDescription(false);
                          setEditingDescriptionValue(task.description ?? '');
                        }}
                        className="px-3 py-1.5 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-sm font-medium text-[#0e121b] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setIsEditingDescription(true);
                      setEditingDescriptionValue(task.description ?? '');
                    }}
                    className="text-sm text-[#0e121b] dark:text-gray-300 min-h-[2.5rem] px-3 py-2 rounded-lg border border-transparent hover:border-[#e8ebf3] dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-text transition-colors"
                  >
                    {task.description ? (
                      <p className="whitespace-pre-wrap">{task.description}</p>
                    ) : (
                      <p className="text-[#506395] dark:text-gray-500">Add description...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Subtasks Section - always visible, editable */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[#506395] dark:text-gray-400 uppercase tracking-wider">
                    Subtasks ({completedSubtasks}/{totalSubtasks})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="text-xs text-primary hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add subtask
                  </button>
                </div>
                <div className="space-y-2">
                  {(task.subtasks ?? []).map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={subtask.isCompleted}
                        onChange={() => handleSubtaskToggle(subtask.id)}
                        className="size-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                        aria-label={`Mark "${subtask.title}" complete`}
                      />
                      {editingSubtaskId === subtask.id ? (
                        <input
                          type="text"
                          value={editingSubtaskTitle}
                          onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                          onBlur={() => {
                            if (editingSubtaskTitle.trim()) {
                              handleSubtaskTitleSave(subtask.id, editingSubtaskTitle);
                            } else {
                              setEditingSubtaskId(null);
                              setEditingSubtaskTitle('');
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          autoFocus
                          className="flex-1 px-3 py-1.5 text-sm bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        <>
                          <span
                            onClick={() => {
                              setEditingSubtaskId(subtask.id);
                              setEditingSubtaskTitle(subtask.title);
                            }}
                            className={`text-sm text-[#0e121b] dark:text-gray-300 flex-1 cursor-text py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              subtask.isCompleted
                                ? 'line-through decoration-gray-400 dark:decoration-gray-600 text-gray-500'
                                : ''
                            }`}
                          >
                            {subtask.title || 'Untitled'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtask(subtask.id)}
                            className="p-1 rounded text-[#506395] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                            aria-label={`Remove subtask "${subtask.title}"`}
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Comments */}
            <div className="lg:col-span-1 p-6">
              <h3 className="text-sm font-semibold text-[#0e121b] dark:text-white mb-4">
                Activity & Comments
              </h3>

              <div className="space-y-6">
                {/* Activity Log */}
                {task.createdBy && (
                  <div className="flex gap-3">
                    <div
                      className="size-8 rounded-full bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url('${task.createdBy.avatar}')` }}
                      role="img"
                      aria-label={`${task.createdBy.name} avatar`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-[#0e121b] dark:text-white">
                        <span className="font-semibold">{task.createdBy.name}</span> created this task
                      </p>
                      {task.createdAt && (
                        <p className="text-xs text-[#506395] dark:text-gray-400 mt-1">{task.createdAt}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {task.comments && task.comments.length > 0 && (
                  <>
                    {task.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div
                          className="size-8 rounded-full bg-cover bg-center shrink-0"
                          style={{ backgroundImage: `url('${comment.user.avatar}')` }}
                          role="img"
                          aria-label={`${comment.user.name} avatar`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-[#0e121b] dark:text-white">
                              {comment.user.name}
                            </span>
                            <span className="text-xs text-[#506395] dark:text-gray-400">{comment.time}</span>
                          </div>
                          <p
                            className="text-sm text-[#0e121b] dark:text-gray-300 mb-2"
                            dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(comment.content) }}
                          />
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="space-y-2 mt-2">
                              {comment.attachments.map((attachment, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-[#506395] dark:text-gray-400">
                                    {getFileIcon(attachment.type || '')}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[#0e121b] dark:text-white truncate">
                                      {attachment.name}
                                    </p>
                                    <p className="text-xs text-[#506395] dark:text-gray-400">
                                      {attachment.size}
                                    </p>
                                  </div>
                                  {(attachment as any).url && (
                                    <a
                                      href={(attachment as any).url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-[#506395] hover:text-primary transition-colors"
                                      aria-label={`Download ${attachment.name}`}
                                    >
                                      <span className="material-symbols-outlined text-[16px]">download</span>
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Add Comment Section */}
                <div className="pt-4 border-t border-[#e8ebf3] dark:border-gray-700">
                  {commentError && (
                    <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                      {commentError}
                    </div>
                  )}
                  <textarea
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      setCommentError(null);
                    }}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-sm text-[#0e121b] dark:text-white placeholder-[#506395] focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    rows={3}
                    maxLength={5000}
                  />
                  {pendingAttachments && pendingAttachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {pendingAttachments.map((attachment, index) => (
                        <div
                          key={`${attachment.name}-${index}`}
                          className="flex items-center gap-2 text-xs text-[#506395] dark:text-gray-400"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {getFileIcon(attachment.type || '')}
                          </span>
                          <span className="truncate">{attachment.name}</span>
                          <span className="text-[10px] opacity-80">{attachment.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,application/pdf,text/*"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFiles}
                        className="text-xs text-[#506395] hover:text-primary font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Attach file"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {uploadingFiles ? 'hourglass_empty' : 'attach_file'}
                        </span>
                        {uploadingFiles ? 'Uploading...' : 'Attach file'}
                      </button>
                    </div>
                    <button
                      onClick={handlePostComment}
                      disabled={!commentText.trim() || uploadingFiles}
                      className="px-4 py-1.5 bg-primary hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        currentAssignee={task.assignee || null}
        onAssign={handleAssignTask}
        onClose={() => setIsAssignModalOpen(false)}
      />

      {/* Reminder Modal */}
      <SetReminderModal
        isOpen={isReminderModalOpen}
        currentReminderDate={task.reminderDate}
        dueDate={task.dueDate}
        onSetReminder={handleSetReminder}
        onClose={() => setIsReminderModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          try {
            await deleteTask.mutateAsync(task.id);
            setShowDeleteConfirm(false);
            setAlertMessage({
              title: 'Success',
              message: `Task "${task.title}" has been deleted.`,
              type: 'success',
            });
            closeTaskModalAfterAlertRef.current = true;
          } catch (err) {
            console.error('Failed to delete task', err);
            setShowDeleteConfirm(false);
            setAlertMessage({
              title: 'Error',
              message: 'Failed to delete task. Please try again.',
              type: 'error',
            });
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Alert Modal */}
      {alertMessage && (
        <AlertModal
          isOpen={!!alertMessage}
          title={alertMessage.title}
          message={alertMessage.message}
          type={alertMessage.type}
          onClose={() => {
            setAlertMessage(null);
            if (closeTaskModalAfterAlertRef.current) {
              closeTaskModalAfterAlertRef.current = false;
              onClose();
              onTaskUpdate?.();
            }
          }}
        />
      )}
    </div>
  );
};
