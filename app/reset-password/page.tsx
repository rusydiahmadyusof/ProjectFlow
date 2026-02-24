'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { validatePassword } from '@/lib/validation';

const RECOVERY_WAIT_MS = 4000;

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<'verifying' | 'ready' | 'invalid'>('verifying');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const recoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const hasRecoveryHash = () => {
      if (typeof window === 'undefined') return false;
      const hash = window.location.hash || '';
      return hash.includes('type=recovery') || hash.includes('access_token=');
    };

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus('ready');
        return;
      }
      if (hasRecoveryHash()) {
        // Wait for Supabase to parse the URL hash and set the session
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setStatus('ready');
            if (recoveryTimeoutRef.current) {
              clearTimeout(recoveryTimeoutRef.current);
              recoveryTimeoutRef.current = null;
            }
          }
        });
        subscription = sub;
        recoveryTimeoutRef.current = setTimeout(() => {
          recoveryTimeoutRef.current = null;
          setStatus((s) => (s === 'verifying' ? 'invalid' : s));
        }, RECOVERY_WAIT_MS);
        return;
      }
      setStatus('invalid');
    };

    checkSession();

    return () => {
      subscription?.unsubscribe();
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'invalid') {
      router.push('/forgot-password');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors({ password: passwordValidation.error });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[32px]">
                check_circle
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Password Reset Successful
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Your password has been updated. Redirecting to login...
            </p>
            <div className="flex justify-center">
              <span className="material-symbols-outlined animate-spin text-primary text-[24px]">
                refresh
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'verifying' || status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[32px] animate-pulse">
                {status === 'verifying' ? 'link' : 'schedule'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {status === 'verifying' ? 'Verifying reset link...' : 'Redirecting...'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {status === 'verifying'
                ? 'Please wait while we verify your password reset link.'
                : 'Taking you back to request a new link.'}
            </p>
            {status === 'verifying' && (
              <div className="flex justify-center">
                <span className="material-symbols-outlined animate-spin text-primary text-[24px]">
                  refresh
                </span>
              </div>
            )}
            {status === 'invalid' && (
              <Link href="/forgot-password" className="text-primary hover:underline text-sm font-medium">
                Go to Forgot Password
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <span className="material-symbols-outlined text-white text-[24px]">lock_reset</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Enter your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                required
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  errors.password
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                required
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  errors.confirmPassword
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    refresh
                  </span>
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Remember your password?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
          <p className="text-slate-500 dark:text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
