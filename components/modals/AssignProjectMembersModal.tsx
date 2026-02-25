'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useTeam } from '@/hooks/useTeam';
import { useUpdateProject } from '@/hooks/useProjects';
import type { Project } from '@/components/types';

interface AssignProjectMembersModalProps {
  isOpen: boolean;
  projectId: string;
  projectName: string;
  initialLeaderId?: string | null;
  onClose: () => void;
  onComplete?: () => void;
}

export const AssignProjectMembersModal = ({
  isOpen,
  projectId,
  projectName,
  initialLeaderId = null,
  onClose,
  onComplete,
}: AssignProjectMembersModalProps) => {
  const { data: teamMembers = [], isLoading: teamLoading } = useTeam();
  const updateProject = useUpdateProject();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [existingMemberIds, setExistingMemberIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !projectId) return;
    setLeaderId(initialLeaderId ?? null);
    const fetchExisting = async () => {
      const { data, error: err } = await supabase
        .from('project_memberships')
        .select('memberId')
        .eq('projectId', projectId);
      if (err) {
        setExistingMemberIds(new Set());
        return;
      }
      const ids = new Set(
        (data ?? []).map((r: Record<string, unknown>) => (r.memberId ?? r.member_id) as string)
      );
      setExistingMemberIds(ids);
      setSelectedIds(ids);
    };
    fetchExisting();
  }, [isOpen, projectId, initialLeaderId]);

  if (!isOpen) return null;

  const handleToggle = (memberId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
    if (error) setError(null);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === teamMembers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(teamMembers.map((m) => m.id)));
    }
    if (error) setError(null);
  };

  const handleDone = async () => {
    setSaving(true);
    setError(null);
    try {
      const toAdd = [...selectedIds].filter((id) => !existingMemberIds.has(id));
      const toRemove = [...existingMemberIds].filter((id) => !selectedIds.has(id));

      if (toRemove.length > 0) {
        const { error: deleteErr } = await supabase
          .from('project_memberships')
          .delete()
          .eq('projectId', projectId)
          .in('memberId', toRemove);
        if (deleteErr) throw deleteErr;
      }

      if (toAdd.length > 0) {
        const rows = toAdd.map((memberId) => ({
          projectId,
          memberId,
          role: 'member',
        }));
        const { error: insertErr } = await supabase.from('project_memberships').insert(rows);
        if (insertErr) throw insertErr;
      }

      const newLeaderId = leaderId && selectedIds.has(leaderId) ? leaderId : null;
      const selectedMembers = teamMembers.filter((m) => selectedIds.has(m.id));
      const memberAvatars = selectedMembers.map((m) => m.avatar || '');

      try {
        await updateProject.mutateAsync({
          id: projectId,
          projectLeaderId: newLeaderId,
          teamMembers: memberAvatars,
        });

        // Optimistically update cached projects so cards show members immediately
        queryClient.setQueryData<Project[]>(['projects'], (old = []) =>
          old.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  projectLeaderId: newLeaderId,
                  teamMembers: memberAvatars,
                }
              : project
          )
        );
      } catch {
        // Ignore if projectLeaderId column is not yet added (migration 10_add_project_leader.sql)
      }

      onComplete?.();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update project members.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a202c] rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-[#0e121b] dark:text-white">
            Assign team to {projectName}
          </h2>
          <button
            onClick={onClose}
            className="text-[#506395] hover:text-[#0e121b] dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-sm text-[#506395] dark:text-slate-400 px-6 pb-4">
          Select team members and choose a project leader (optional).
        </p>
        {error && (
          <div className="mx-6 mb-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm" role="alert">
            {error}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {teamLoading ? (
            <p className="text-[#506395] text-sm py-4">Loading team members...</p>
          ) : teamMembers.length === 0 ? (
            <p className="text-[#506395] text-sm py-4">No team members found. Add members from the Team page first.</p>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-primary hover:underline font-medium mb-3"
              >
                {selectedIds.size === teamMembers.length ? 'Deselect all' : 'Select all'}
              </button>
              <ul className="space-y-2">
                {teamMembers.map((member) => {
                  const isSelected = selectedIds.has(member.id);
                  const isLeader = leaderId === member.id;
                  return (
                    <li key={member.id}>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-[#e8ebf3] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <input
                          type="checkbox"
                          id={`member-${member.id}`}
                          checked={isSelected}
                          onChange={() => handleToggle(member.id)}
                          className="rounded border-[#e8ebf3] dark:border-gray-600 text-primary focus:ring-primary"
                        />
                        {member.avatar ? (
                          <div
                            className="size-9 rounded-full bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url('${member.avatar}')` }}
                            role="img"
                            aria-hidden
                          />
                        ) : (
                          <div className="size-9 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#0e121b] dark:text-white truncate">{member.name}</p>
                          <p className="text-xs text-[#506395] dark:text-slate-400 truncate">{member.email}</p>
                        </div>
                        {isSelected && (
                          <label className="flex items-center gap-1.5 shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="radio"
                              name="project-leader"
                              checked={isLeader}
                              onChange={() => setLeaderId(member.id)}
                              className="border-[#e8ebf3] dark:border-gray-600 text-primary focus:ring-primary"
                            />
                            <span className="text-xs font-medium text-[#506395] dark:text-slate-400 whitespace-nowrap">
                              Leader
                            </span>
                          </label>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
        <div className="flex gap-3 p-6 pt-4 border-t border-[#e8ebf3] dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDone}
            disabled={teamLoading || saving}
            className="flex-1 px-4 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : `Done (${selectedIds.size} selected)`}
          </button>
        </div>
      </div>
    </div>
  );
};
