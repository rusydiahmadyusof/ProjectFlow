import { Task, Project } from '@/components/types';

export type TaskStatusKey = Task['status'];

export interface ProjectStats {
  progress: number;
  startDate: string;
  endDate: string;
  teamMembers: string[];
  projectLead?: {
    name: string;
    avatar: string;
  };
  progressDataPoints: Array<{
    date: string;
    progress: number;
  }>;
  perStatusSeries: Array<{
    status: TaskStatusKey;
    points: Array<{
      date: string;
      count: number;
    }>;
  }>;
}

/**
 * Calculate project progress based on task completion
 */
export const calculateProjectProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(
    (task) => task.status === 'done' || task.isCompleted === true
  ).length;
  
  return Math.round((completedTasks / tasks.length) * 100);
};

/**
 * Get project start date from earliest task creation date
 */
export const getProjectStartDate = (tasks: Task[]): string => {
  if (tasks.length === 0) return '';
  
  const dates = tasks
    .map((task) => task.createdAt)
    .filter((date): date is string => !!date)
    .sort();
  
  if (dates.length === 0) return '';
  
  const date = new Date(dates[0]);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

/**
 * Get project end date from latest task due date
 */
export const getProjectEndDate = (tasks: Task[]): string => {
  if (tasks.length === 0) return '';
  
  const dueDates = tasks
    .map((task) => task.dueDate)
    .filter((date) => !!date && date !== '')
    .map((dateStr) => {
      // Try to parse various date formats
      if (dateStr.includes('-')) {
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      // Try "MMM DD" format
      const currentYear = new Date().getFullYear();
      const parsed = new Date(`${dateStr} ${currentYear}`);
      return isNaN(parsed.getTime()) ? null : parsed;
    })
    .filter((date): date is Date => date !== null)
    .sort((a, b) => b.getTime() - a.getTime());
  
  if (dueDates.length === 0) return '';
  
  return dueDates[0].toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

/**
 * Get unique team members from task assignees
 */
export const getTeamMembersFromTasks = (tasks: Task[]): string[] => {
  const memberAvatars = new Set<string>();
  
  tasks.forEach((task) => {
    if (task.assignee?.avatar) {
      memberAvatars.add(task.assignee.avatar);
    }
  });
  
  return Array.from(memberAvatars);
};

/**
 * Get project lead (most assigned team member or first assignee)
 */
export const getProjectLead = (tasks: Task[]): { name: string; avatar: string } | undefined => {
  if (tasks.length === 0) return undefined;
  
  // Count assignments per member
  const assigneeCounts = new Map<string, { name: string; avatar: string; count: number }>();
  
  tasks.forEach((task) => {
    if (task.assignee) {
      const key = task.assignee.id || task.assignee.email || task.assignee.name;
      const existing = assigneeCounts.get(key);
      
      if (existing) {
        existing.count++;
      } else {
        assigneeCounts.set(key, {
          name: task.assignee.name,
          avatar: task.assignee.avatar,
          count: 1,
        });
      }
    }
  });
  
  if (assigneeCounts.size === 0) {
    // Fallback to first assignee
    const firstAssignee = tasks.find((t) => t.assignee);
    if (firstAssignee?.assignee) {
      return {
        name: firstAssignee.assignee.name,
        avatar: firstAssignee.assignee.avatar,
      };
    }
    return undefined;
  }
  
  // Get member with most assignments
  const sorted = Array.from(assigneeCounts.values()).sort((a, b) => b.count - a.count);
  return {
    name: sorted[0].name,
    avatar: sorted[0].avatar,
  };
};

/**
 * Generate progress data points for graph based on task completion over time
 */
export const generateProgressDataPoints = (
  tasks: Task[],
  startDate: string,
  endDate: string
): Array<{ date: string; progress: number }> => {
  if (tasks.length === 0) {
    return [
      { date: startDate, progress: 0 },
      { date: endDate, progress: 0 },
    ];
  }
  
  // Parse dates
  const parseDate = (dateStr: string): Date => {
    if (dateStr.includes('-')) {
      return new Date(dateStr);
    }
    const currentYear = new Date().getFullYear();
    return new Date(`${dateStr} ${currentYear}`);
  };
  
  let start: Date;
  let end: Date;
  
  try {
    start = startDate ? parseDate(startDate) : new Date();
    end = endDate ? parseDate(endDate) : new Date();
  } catch {
    start = new Date();
    end = new Date();
  }
  
  // Get all task creation dates and completion dates
  const taskDates: Array<{ date: Date; isCompleted: boolean }> = [];
  
  tasks.forEach((task) => {
    if (task.createdAt) {
      taskDates.push({ date: new Date(task.createdAt), isCompleted: false });
    }
    if (task.status === 'done' || task.isCompleted) {
      // Use updatedAt if available, otherwise use createdAt
      const completionDate = task.createdAt ? new Date(task.createdAt) : new Date();
      taskDates.push({ date: completionDate, isCompleted: true });
    }
  });
  
  // Sort by date
  taskDates.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Generate 4-5 data points evenly spaced
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const numPoints = Math.min(5, Math.max(2, Math.ceil(totalDays / 7))); // 1 point per week, max 5
  
  const dataPoints: Array<{ date: string; progress: number }> = [];
  
  for (let i = 0; i < numPoints; i++) {
    const pointDate = new Date(start);
    pointDate.setDate(start.getDate() + (i * totalDays) / (numPoints - 1));
    
    // Calculate progress up to this date
    const tasksUpToDate = tasks.filter((task) => {
      const taskDate = task.createdAt ? new Date(task.createdAt) : new Date();
      return taskDate <= pointDate;
    });
    
    const completedUpToDate = tasksUpToDate.filter(
      (task) => task.status === 'done' || task.isCompleted === true
    ).length;
    
    const progress = tasksUpToDate.length > 0 
      ? Math.round((completedUpToDate / tasksUpToDate.length) * 100)
      : 0;
    
    dataPoints.push({
      date: pointDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      progress,
    });
  }
  
  return dataPoints;
};

function formatProjectDate(dateStr: string | undefined): string {
  if (!dateStr || dateStr === '') return '';
  if (typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function getProjectDate(
  project: Record<string, unknown> | undefined,
  field: 'dueDate' | 'createdAt'
): string | undefined {
  if (!project) return undefined;
  const camel = field === 'dueDate' ? 'dueDate' : 'createdAt';
  const snake = field === 'dueDate' ? 'due_date' : 'created_at';
  const value = (project[camel] ?? project[snake]) as string | undefined;
  if (value == null || value === '') return undefined;
  return String(value).trim();
}

/**
 * Calculate all project stats from tasks and optional project (DB) data
 */
export const calculateProjectStats = (
  tasks: Task[],
  project?: Project & { createdAt?: string; dueDate?: string } & Record<string, unknown>
): ProjectStats => {
  const taskProgress = calculateProjectProgress(tasks);
  const taskStart = getProjectStartDate(tasks);
  const taskEnd = getProjectEndDate(tasks);
  const projectDue = getProjectDate(project, 'dueDate');
  const projectCreated = getProjectDate(project, 'createdAt');
  const projectEndFormatted = formatProjectDate(projectDue);
  const projectStartFormatted = formatProjectDate(projectCreated);

  const progress = tasks.length > 0 ? taskProgress : (project?.progress ?? 0);
  // Start = project creation date; End = project due date (user-set when creating). Fall back to task-derived dates if project dates missing.
  const startDate = projectStartFormatted || taskStart || '';
  const endDate = projectEndFormatted || taskEnd || '';
  const teamMembers = getTeamMembersFromTasks(tasks);
  const projectLead = getProjectLead(tasks);
  const progressDataPoints =
    tasks.length > 0
      ? generateProgressDataPoints(tasks, startDate || 'Oct 01', endDate || 'Nov 15')
      : startDate && endDate
        ? [
            { date: startDate, progress: 0 },
            { date: endDate, progress: progress },
          ]
        : endDate
          ? [{ date: endDate, progress: 0 }, { date: endDate, progress: progress }]
          : [];

  const parseLabelToDate = (label: string): Date => {
    if (label.includes(',')) {
      const parsed = new Date(label);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const currentYear = new Date().getFullYear();
    const parsed = new Date(`${label} ${currentYear}`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const baseBuckets = progressDataPoints.map((p) => ({
    label: p.date,
    date: parseLabelToDate(p.date),
  }));

  const allStatuses: TaskStatusKey[] = ['to-do', 'in-progress', 'done', 'overdue', 'review', 'drafting', 'pending'];

  const perStatusSeries = allStatuses
    .map((status) => {
      if (!baseBuckets.length || tasks.length === 0) return null;

      const points = baseBuckets.map((bucket) => {
        const count = tasks.filter((t) => {
          if (t.status !== status) return false;
          if (!t.createdAt) return false;
          const created = new Date(t.createdAt);
          if (Number.isNaN(created.getTime())) return false;
          return created <= bucket.date;
        }).length;

        return {
          date: bucket.label,
          count,
        };
      });

      const hasAny = points.some((p) => p.count > 0);
      if (!hasAny) return null;

      return {
        status,
        points,
      };
    })
    .filter(Boolean) as ProjectStats['perStatusSeries'];

  return {
    progress,
    startDate,
    endDate,
    teamMembers,
    projectLead,
    progressDataPoints,
    perStatusSeries,
  };
};
