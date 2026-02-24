'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error('Error getting session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      // Add a small delay to allow splash screen to show
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 100);
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Failed to sign in' };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      // Note: User will need to verify email before they can sign in
      return { error: null, user: data.user };
    } catch (error: any) {
      return { error: error.message || 'Failed to sign up', user: null };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      // Redirect to landing page (root) after logout
      // Use window.location for a full page reload to ensure clean state
      window.location.href = '/';
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Failed to sign out' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Use NEXT_PUBLIC_APP_URL so reset emails use the correct port (e.g. 3001). Supabase uses this for the link.
      const baseUrl =
        typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL
          ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
          : typeof window !== 'undefined'
            ? window.location.origin
            : '';
      const redirectTo = baseUrl ? `${baseUrl}/reset-password` : '/reset-password';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Failed to send password reset email' };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };
};
