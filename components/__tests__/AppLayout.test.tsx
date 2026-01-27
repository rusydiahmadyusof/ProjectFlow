import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '../layout/AppLayout';

// Create a test QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
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

// Mock useUser hook
jest.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: {
      name: 'Test User',
      role: 'member',
      avatar: '',
    },
    isLoading: false,
    refetch: jest.fn(),
  }),
}));

// Mock useProjects hook
jest.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    data: [],
    isLoading: false,
  }),
}));

describe('AppLayout', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders children correctly', () => {
    renderWithProviders(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header with title', () => {
    renderWithProviders(
      <AppLayout headerTitle="Test Page">
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('renders sidebar', () => {
    renderWithProviders(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    // Check if sidebar is rendered (it should have ProjectFlow branding)
    expect(screen.getByText('ProjectFlow')).toBeInTheDocument();
  });
});
