/**
 * Role-based permission utilities
 * 
 * Roles hierarchy:
 * - owner: Full access (all permissions)
 * - admin: All permissions except delete account
 * - member: CRUD tasks limited to assigned projects only
 * - guest: Read-only access limited to assigned projects only
 */

export type UserRole = 'owner' | 'admin' | 'member' | 'guest';

/**
 * Check if user can create projects
 */
export const canCreateProject = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role !== 'guest';
};

/**
 * Check if user can edit projects
 */
export const canEditProject = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role !== 'guest';
};

/**
 * Check if user can archive projects
 */
export const canArchiveProject = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role === 'owner' || role === 'admin';
};

/**
 * Check if user can delete projects
 */
export const canDeleteProject = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role === 'owner' || role === 'admin';
};

/**
 * Check if user can create tasks
 */
export const canCreateTask = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role !== 'guest';
};

/**
 * Check if user can edit tasks
 */
export const canEditTask = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role !== 'guest';
};

/**
 * Check if user can delete tasks
 */
export const canDeleteTask = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role !== 'guest';
};

/**
 * Check if user has admin-level access (owner or admin)
 */
export const isAdmin = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role === 'owner' || role === 'admin';
};

/**
 * Check if user is owner
 */
export const isOwner = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role === 'owner';
};
