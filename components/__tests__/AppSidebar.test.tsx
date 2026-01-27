import { render, screen } from '@testing-library/react';
import { AppSidebar } from '../layout/AppSidebar';

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  }),
}));

describe('AppSidebar', () => {
  it('renders ProjectFlow branding', () => {
    render(<AppSidebar />);
    expect(screen.getByText('ProjectFlow')).toBeInTheDocument();
  });

  it('renders main navigation items', () => {
    render(<AppSidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('renders utility navigation items', () => {
    render(<AppSidebar />);
    expect(screen.getByText('My Tasks')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    // Note: Notifications may not be visible if there are no notifications or it's conditionally rendered
  });
});
