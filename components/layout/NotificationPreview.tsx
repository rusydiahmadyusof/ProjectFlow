'use client';

import { useRouter } from 'next/navigation';
import { Notification } from '../types';
import { useMarkNotificationRead } from '@/hooks/useNotifications';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

interface NotificationPreviewProps {
  notifications: Notification[];
  onClose: () => void;
}

export const NotificationPreview = ({ notifications, onClose }: NotificationPreviewProps) => {
  const router = useRouter();
  const { mutate: markAsRead } = useMarkNotificationRead();
  const { data: tasksData } = useTasks();
  const tasks = tasksData?.pages.flatMap((page) => page.tasks) ?? [];
  const { data: projects = [] } = useProjects();

  // Show only unread notifications, limited to 5
  const unreadNotifications = notifications.filter((n) => !n.isRead).slice(0, 5);

  const handleNotificationClick = (e: React.MouseEvent, notification: Notification) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Mark as read
    if (!notification.isRead) {
      markAsRead({ id: notification.id, isRead: true });
    }
    onClose();

    // Navigate based on notification type and target
    if (!notification.target) {
      router.push('/notifications');
      return;
    }

    const target = notification.target.toLowerCase().trim();
    const isTaskType = ['comment', 'mention', 'assignment', 'overdue'].includes(notification.type);

    // Priority 1: Check if it contains a task number pattern (e.g., "#WR-102" or "Task #WR-102")
    const taskNumberMatch = target.match(/#?([a-z]+-\d+)/i);
    if (taskNumberMatch) {
      const taskNumber = `#${taskNumberMatch[1].toUpperCase()}`;
      const task = tasks.find((t) => t.taskNumber?.toLowerCase() === taskNumber.toLowerCase());
      if (task && task.projectId) {
        router.push(`/tasks?projectId=${task.projectId}&taskId=${task.id}`);
        return;
      }
    }

    // Priority 2: For task-related notifications, try to find by task title first
    if (isTaskType) {
      const task = tasks.find(
        (t) =>
          t.title.toLowerCase() === target ||
          t.title.toLowerCase().includes(target) ||
          target.includes(t.title.toLowerCase())
      );
      if (task && task.projectId) {
        router.push(`/tasks?projectId=${task.projectId}&taskId=${task.id}`);
        return;
      }
    }

    // Priority 3: Check if it's a project name
    const project = projects.find(
      (p) =>
        p.name.toLowerCase() === target ||
        p.name.toLowerCase().includes(target) ||
        target.includes(p.name.toLowerCase())
    );
    if (project) {
      router.push(`/tasks?projectId=${project.id}`);
      return;
    }

    // Priority 4: If not task-related, try to find task by title anyway
    if (!isTaskType) {
      const task = tasks.find(
        (t) =>
          t.title.toLowerCase() === target ||
          t.title.toLowerCase().includes(target) ||
          target.includes(t.title.toLowerCase())
      );
      if (task && task.projectId) {
        router.push(`/tasks?projectId=${task.projectId}&taskId=${task.id}`);
        return;
      }
    }

    // Fallback to notifications page
    router.push('/notifications');
  };

  if (unreadNotifications.length === 0) {
    return (
      <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#1a202c] border border-[#e8ebf3] dark:border-[#2d3748] rounded-lg shadow-lg z-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#0e121b] dark:text-white">Notifications</h3>
          </div>
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-[#506395] text-4xl mb-2">notifications_none</span>
            <p className="text-sm text-[#506395]">No unread notifications</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-[#1a202c] border border-[#e8ebf3] dark:border-[#2d3748] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#0e121b] dark:text-white">Notifications</h3>
          <button
            onClick={() => router.push('/notifications')}
            className="text-xs text-primary hover:underline"
          >
            View all
          </button>
        </div>
        <div className="space-y-1">
          {unreadNotifications.map((notification) => (
            <button
              key={notification.id}
              onMouseDown={(e) => handleNotificationClick(e, notification)}
              className="w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
            >
              <div className="flex items-start gap-3">
                {notification.user ? (
                  notification.user.avatar && notification.user.avatar.trim() !== '' ? (
                    <div
                      className="size-8 rounded-full bg-cover bg-center flex-shrink-0 border border-[#e8ebf3] dark:border-gray-700"
                      style={{ backgroundImage: `url("${notification.user.avatar}")` }}
                      role="img"
                      aria-label={`${notification.user.name} avatar`}
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-[#e8ebf3] dark:border-gray-700">
                      <span className="text-xs font-semibold text-primary">
                        {notification.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-[#e8ebf3] dark:border-gray-700">
                    <span className="material-symbols-outlined text-primary text-[18px]">{notification.icon || 'notifications'}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-[#0e121b] dark:text-white line-clamp-1">
                      {notification.user ? (
                        <>
                          <span className="font-semibold">{notification.user.name}</span> {notification.title} {notification.target && <span className="text-primary">{notification.target}</span>}
                        </>
                      ) : (
                        <>
                          {notification.title} {notification.target && <span className="text-primary">{notification.target}</span>}
                        </>
                      )}
                    </p>
                    <span className="size-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                  </div>
                  {notification.message && (
                    <p className="text-xs text-[#506395] line-clamp-2 mb-1">{notification.message}</p>
                  )}
                  <p className="text-xs text-[#506395]">{notification.time}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
