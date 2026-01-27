export interface User {
  name: string;
  role: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'late';
  dueDate: string;
  taskCount: number;
  teamMembers: string[];
  isOverdue?: boolean;
  isArchived?: boolean;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

export interface NavItem {
  icon: string;
  label: string;
  href: string;
  isActive?: boolean;
  isDanger?: boolean;
}

export interface TaskComment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
    url?: string;
  }>;
}

export interface TaskSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  projectId?: string;
  assignee?: {
    id?: string;
    name: string;
    avatar: string;
    email?: string;
  };
  dueDate: string;
  reminderDate?: string;
  priority: 'high' | 'medium' | 'low' | 'critical';
  status: 'to-do' | 'in-progress' | 'done' | 'overdue' | 'review' | 'drafting' | 'pending';
  isCompleted?: boolean;
  taskNumber?: string;
  description?: string;
  subtasks?: TaskSubtask[];
  comments?: TaskComment[];
  createdBy?: {
    name: string;
    avatar: string;
  };
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  tasksAssigned: number;
  tasksOverdue: number;
}

export interface Notification {
  id: string;
  type: 'comment' | 'mention' | 'assignment' | 'overdue' | 'system';
  user?: {
    name: string;
    avatar: string;
  };
  title: string;
  message?: string;
  target?: string;
  time: string;
  isRead: boolean;
  icon?: string;
  iconColor?: string;
  bgColor?: string;
}

export interface ActivityFeedItem {
  id: string;
  user?: {
    name: string;
    avatar: string;
    role?: string;
  };
  type: 'project' | 'task' | 'system' | 'team';
  action: string;
  target?: string;
  details?: string;
  time: string;
  color: string;
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
  }>;
}
