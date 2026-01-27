'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard = ({ children, redirectTo = '/login' }: AuthGuardProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    } else if (!loading && isAuthenticated && user) {
      // Check if user needs to complete onboarding
      // Skip onboarding check for verify-email, reset-password, and onboarding pages
      const onboardingPages = ['/verify-email', '/reset-password', '/onboarding'];
      
      if (!onboardingPages.includes(pathname)) {
        // Check if user email is verified
        if (!user.email_confirmed_at) {
          router.push('/verify-email');
          return;
        }
      }
    }
  }, [isAuthenticated, loading, router, redirectTo, user, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            refresh
          </span>
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
