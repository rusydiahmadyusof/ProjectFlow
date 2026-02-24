'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ProjectMember {
  id: string;
  name: string;
  avatar: string;
}

const fetchProjectMembers = async (projectId: string | null): Promise<ProjectMember[]> => {
  if (!projectId) return [];
  const { data: memberships, error: pmErr } = await supabase
    .from('project_memberships')
    .select('memberId')
    .eq('projectId', projectId);
  if (pmErr || !memberships?.length) return [];
  const memberIds = memberships.map((r: Record<string, unknown>) => (r.memberId ?? r.member_id) as string);
  const { data: members, error: tmErr } = await supabase
    .from('team_members')
    .select('id, name, avatar')
    .in('id', memberIds);
  if (tmErr || !members) return [];
  return (members as Array<{ id: string; name: string; avatar?: string }>).map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar || '',
  }));
};

export const useProjectMembers = (projectId: string | null) => {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => fetchProjectMembers(projectId),
    enabled: !!projectId,
  });
};
