'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { User } from '@/components/types';
import { supabase } from '@/lib/supabase';

const fetchUser = async (): Promise<User | null> => {
  // Get the currently authenticated Supabase user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Not logged in or auth error – treat as no authenticated user
    return null;
  }

  // Look up the corresponding team member by authUserId to get name/role/avatar
  let { data, error: teamError } = await supabase
    .from('team_members')
    .select('*')
    .eq('authUserId', user.id)
    .maybeSingle();

  // If not found by authUserId, try by email
  if (!data && !teamError) {
    // First, try to get all records with this email to check for duplicates
    const { data: allEmailData, error: allEmailError } = await supabase
      .from('team_members')
      .select('*')
      .eq('email', user.email ?? '');
    
    if (allEmailData && !allEmailError && allEmailData.length > 0) {
      // If multiple records, prefer admin > owner > member > guest
      const rolePriority: Record<string, number> = { admin: 4, owner: 3, member: 2, guest: 1 };
      const sortedRecords = allEmailData.sort((a, b) => {
        const aPriority = rolePriority[a.role] || 0;
        const bPriority = rolePriority[b.role] || 0;
        return bPriority - aPriority;
      });
      
      const emailData = sortedRecords[0]; // Use the highest priority role
      
      if (allEmailData.length > 1) {
        console.warn(`⚠️ Found ${allEmailData.length} team_member records for ${user.email}. Using role: ${emailData.role}`);
        console.warn('💡 Run supabase/03_link_user.sql to clean up duplicates');
      }
      
      // Try to update authUserId
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ authUserId: user.id })
        .eq('id', emailData.id);
      
      if (!updateError) {
        // Update succeeded - use the updated data
        data = { ...emailData, authUserId: user.id };
        console.log(`✅ Linked auth user to team member: ${emailData.role}`);
      } else {
        // Update failed (likely RLS blocking) - but still use the email-matched data
        console.warn('⚠️ Found team member by email but could not update authUserId:', updateError);
        console.warn('💡 Run the SQL script in supabase/03_link_user.sql to fix this permanently');
        // Use the email-matched data anyway (user will see correct role)
        data = emailData;
      }
    }
  }

  // If still not found, auto-create team member (first user becomes owner)
  if (!data && !teamError) {
    // Check if this is the first user (no other team members exist)
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true });

    const isFirstUser = (count ?? 0) === 0;
    const defaultRole = isFirstUser ? 'owner' : 'member';

    // Create team member
    const newTeamMember = {
      id: `tm-${Date.now()}`,
      name: user.email?.split('@')[0] ?? 'User',
      email: user.email ?? '',
      avatar: '',
      role: defaultRole,
      authUserId: user.id,
      tasksAssigned: 0,
      tasksOverdue: 0,
    };

    const { data: createdData, error: createError } = await supabase
      .from('team_members')
      .insert([newTeamMember])
      .select()
      .single();

    if (!createError && createdData) {
      data = createdData;
      console.log(`✅ Auto-created team member with role: ${defaultRole}`);
    } else {
      console.error('Failed to auto-create team member:', createError);
    }
  }

  if (teamError || !data) {
    // Fallback: use basic info from auth user
    return {
      name: user.email ?? 'User',
      role: 'Guest',
      avatar: '',
    };
  }

  return {
    name: data.name,
    role: data.role ?? 'member',
    avatar: data.avatar ?? '',
  };
};

export const useUser = () => {
  const queryClient = useQueryClient();

  // Listen to auth state changes and invalidate user query
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Invalidate user query when auth state changes
      queryClient.invalidateQueries({ queryKey: ['user'] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 0, // Always refetch to get latest user data
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
};

