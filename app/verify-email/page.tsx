'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true);
        setIsChecking(false);
        // Redirect to onboarding after a short delay
        setTimeout(() => {
          router.push('/onboarding');
        }, 2000);
      } else {
        setIsChecking(false);
      }
    };

    checkVerification();

    // Listen for auth state changes (when user clicks verification link)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setIsVerified(true);
        setIsChecking(false);
        setTimeout(() => {
          router.push('/onboarding');
        }, 2000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          {isChecking ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[32px] animate-pulse">
                  mail
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Check Your Email
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                We've sent a verification link to
              </p>
              {email && (
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-6">
                  {email}
                </p>
              )}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Click the link in the email to verify your account. You can close this page and return after verification.
                </p>
              </div>
              <Link
                href="/login"
                className="text-primary hover:underline text-sm font-medium"
              >
                Back to Sign In
              </Link>
            </>
          ) : isVerified ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[32px]">
                  check_circle
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Your email has been verified. Redirecting to onboarding...
              </p>
              <div className="flex justify-center">
                <span className="material-symbols-outlined animate-spin text-primary text-[24px]">
                  refresh
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-[32px]">
                  schedule
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Verification Pending
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Please check your email and click the verification link.
              </p>
              <Link
                href="/login"
                className="inline-block text-primary hover:underline text-sm font-medium"
              >
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
          <p className="text-slate-500 dark:text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
