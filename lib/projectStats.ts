import { Task, Project } from '@/components/types';

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

/**
 * Calculate all project stats from tasks
 */
export const calculateProjectStats = (
  tasks: Task[],
  project?: Project
): ProjectStats => {
  const progress = calculateProjectProgress(tasks);
  const startDate = getProjectStartDate(tasks) || project?.dueDate || '';
  const endDate = getProjectEndDate(tasks) || project?.dueDate || '';
  const teamMembers = getTeamMembersFromTasks(tasks);
  const projectLead = getProjectLead(tasks);
  const progressDataPoints = generateProgressDataPoints(tasks, startDate, endDate);
  
  return {
    progress,
    startDate,
    endDate,
    teamMembers,
    projectLead,
    progressDataPoints,
  };
};
