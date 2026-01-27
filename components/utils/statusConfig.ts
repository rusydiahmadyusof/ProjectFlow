export interface StatusConfig {
  label: string;
  bgColor: string;
  textColor?: string;
  dotColor?: string;
  borderColor?: string;
  progressColor?: string;
}

export const getProjectStatusConfig = (status: 'on-track' | 'at-risk' | 'late'): StatusConfig => {
  switch (status) {
    case 'on-track':
      return {
        label: 'On Track',
        bgColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        textColor: 'text-green-800 dark:text-green-400',
        dotColor: 'bg-green-500',
        progressColor: 'bg-primary',
        borderColor: 'hover:border-primary/30',
      };
    case 'at-risk':
      return {
        label: 'At Risk',
        bgColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        textColor: 'text-orange-800 dark:text-orange-400',
        dotColor: 'bg-orange-500',
        progressColor: 'bg-orange-500',
        borderColor: 'hover:border-orange-300',
      };
    case 'late':
      return {
        label: 'Late',
        bgColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        textColor: 'text-red-800 dark:text-red-400',
        dotColor: 'bg-red-500',
        progressColor: 'bg-red-500',
        borderColor: 'hover:border-red-400',
      };
  }
};

export const getTaskStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case 'in-progress':
      return {
        label: 'In Progress',
        bgColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        textColor: 'text-blue-700 dark:text-blue-300',
        borderColor: 'border-blue-100 dark:border-blue-900/50',
      };
    case 'done':
      return {
        label: 'Done',
        bgColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        textColor: 'text-green-700 dark:text-green-300',
        borderColor: 'border-green-100 dark:border-green-900/50',
      };
    case 'overdue':
      return {
        label: 'Overdue',
        bgColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        textColor: 'text-orange-700 dark:text-orange-400',
        borderColor: 'border-orange-100 dark:border-orange-900/50',
      };
    case 'review':
      return {
        label: 'Review',
        bgColor: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
        textColor: 'text-orange-700 dark:text-orange-400',
        borderColor: 'border-orange-100 dark:border-orange-900/50',
      };
    case 'drafting':
      return {
        label: 'Drafting',
        bgColor: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-700',
      };
    case 'pending':
      return {
        label: 'Pending',
        bgColor: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-700',
      };
    default:
      return {
        label: status,
        bgColor: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-700',
      };
  }
};

export const getTaskPriorityConfig = (priority: 'high' | 'medium' | 'low' | 'critical'): StatusConfig => {
  switch (priority) {
    case 'high':
      return {
        label: 'High',
        bgColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        textColor: 'text-red-700 dark:text-red-400',
        dotColor: 'bg-red-600',
      };
    case 'medium':
      return {
        label: 'Medium',
        bgColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        dotColor: 'bg-yellow-600',
      };
    case 'low':
      return {
        label: 'Low',
        bgColor: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        textColor: 'text-gray-700 dark:text-gray-300',
        dotColor: 'bg-gray-600',
      };
    case 'critical':
      return {
        label: 'Critical',
        bgColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        textColor: 'text-purple-700 dark:text-purple-400',
        dotColor: 'bg-purple-600',
      };
  }
};

export const getTeamRoleConfig = (role: string): StatusConfig => {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin',
        bgColor: 'bg-purple-50 dark:bg-purple-900/30',
        textColor: 'text-purple-700 dark:text-purple-300',
      };
    case 'member':
      return {
        label: 'Member',
        bgColor: 'bg-blue-50 dark:bg-blue-900/30',
        textColor: 'text-blue-700 dark:text-blue-300',
      };
    case 'guest':
      return {
        label: 'Guest',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        textColor: 'text-gray-600 dark:text-gray-300',
      };
    case 'editor':
      return {
        label: 'Editor',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-800 dark:text-gray-300',
      };
    case 'viewer':
      return {
        label: 'Viewer',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-800 dark:text-gray-300',
      };
    default:
      return {
        label: role,
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-800 dark:text-gray-300',
      };
  }
};
