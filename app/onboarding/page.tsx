'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { sanitizeForStorage } from '@/lib/security';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

type OnboardingStep = 'welcome' | 'profile' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: userData, refetch } = useUser();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user has already completed onboarding
    if (userData && userData.name && userData.name !== user?.email?.split('@')[0]) {
      // User already has a proper name set, skip onboarding
      router.push('/');
      return;
    }

    // Initialize name from user data or email
    if (userData?.name && userData.name !== user?.email?.split('@')[0]) {
      setName(userData.name);
    } else if (user?.email) {
      const defaultName = user.email.split('@')[0].replace(/[._]/g, ' ');
      setName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
    }
  }, [isAuthenticated, user, userData, router]);

  const handleWelcomeNext = () => {
    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      setLoading(false);
      return;
    }

    try {
      // Update team member record
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('authUserId', user?.id)
        .single();

      if (teamMember) {
        const { error: updateError } = await supabase
          .from('team_members')
          .update({
            name: sanitizeForStorage(name.trim()),
            avatar: avatar.trim() || '',
          })
          .eq('id', teamMember.id);

        if (updateError) throw updateError;
      }

      // Refresh user data
      await refetch();
      setStep('complete');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <AppLayout headerTitle="Welcome to ProjectFlow">
      <div className="max-w-2xl mx-auto py-12 px-4">
        {step === 'welcome' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
              <span className="text-white text-3xl font-bold">P</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Welcome to ProjectFlow!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Let's get you set up. This will only take a minute.
            </p>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                What you can do:
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">check_circle</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Create and manage projects
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">check_circle</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Assign tasks to team members
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">check_circle</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Track progress with analytics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">check_circle</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Collaborate with your team
                  </span>
                </li>
              </ul>
            </div>
            <button
              onClick={handleWelcomeNext}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        )}

        {step === 'profile' && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                Set Up Your Profile
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Tell us a bit about yourself
              </p>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="avatar"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Avatar URL (Optional)
                </label>
                <input
                  id="avatar"
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="https://example.com/avatar.jpg"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  You can add an avatar later in settings
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('welcome')}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        refresh
                      </span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[40px]">
                check_circle
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
              You're All Set!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Redirecting to your dashboard...
            </p>
            <div className="flex justify-center">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
                refresh
              </span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
    </AuthGuard>
  );
}
