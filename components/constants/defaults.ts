import { User } from '../types';

/**
 * Default user fallback when no user data is available
 * Used as a last resort fallback in components
 */
export const DEFAULT_USER: User = {
  name: 'User',
  role: 'Guest',
  avatar: '',
};
