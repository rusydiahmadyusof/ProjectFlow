'use client';

import { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { useTeam } from '@/hooks/useTeam';

interface AssignTaskModalProps {
  isOpen: boolean;
  currentAssignee?: {
    id?: string;
    name: string;
    avatar: string;
    email?: string;
  } | null;
  onAssign: (assignee: TeamMember | null) => void;
  onClose: () => void;
}

export const AssignTaskModal = ({
  isOpen,
  currentAssignee,
  onAssign,
  onClose,
}: AssignTaskModalProps) => {
  const { data: teamMembers = [], isLoading } = useTeam();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = (member: TeamMember) => {
    onAssign(member);
    onClose();
  };

  const handleUnassign = () => {
    onAssign(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assign Task</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {currentAssignee && (
            <div className="mb-4">
              <button
                onClick={handleUnassign}
                className="w-full flex items-center gap-3 p-3 border-2 border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                    person_remove
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Unassign Task
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Currently assigned to {currentAssignee.name}
                  </p>
                </div>
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Loading team members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">No team members found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => {
                const isAssigned = currentAssignee?.id === member.id || currentAssignee?.email === member.email;
                return (
                  <button
                    key={member.id}
                    onClick={() => handleAssign(member)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isAssigned
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div
                      className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-800"
                      style={{
                        backgroundImage: member.avatar ? `url('${member.avatar}')` : undefined,
                        backgroundColor: member.avatar ? undefined : '#e5e7eb',
                      }}
                    >
                      {!member.avatar && (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {member.name}
                        {isAssigned && (
                          <span className="ml-2 text-xs text-primary font-semibold">(Assigned)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                    </div>
                    {isAssigned && (
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
