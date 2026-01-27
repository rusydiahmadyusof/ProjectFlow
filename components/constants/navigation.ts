import { NavItem } from '../types';

export const MAIN_NAV_ITEMS: NavItem[] = [
  { icon: 'grid_view', label: 'Dashboard', href: '/' },
  { icon: 'view_kanban', label: 'Projects', href: '/projects' },
  { icon: 'check_box', label: 'Tasks', href: '/tasks' },
  { icon: 'group', label: 'Team', href: '/team' },
];

export const UTILITY_NAV_ITEMS: NavItem[] = [
  { icon: 'task_alt', label: 'My Tasks', href: '/my-tasks' },
  { icon: 'settings', label: 'Settings', href: '/settings' },
  { icon: 'logout', label: 'Logout', href: '#', isDanger: true },
];
