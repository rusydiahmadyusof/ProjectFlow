'use client';

import { useState, useMemo } from 'react';
import { TeamMember } from './types';
import { AppLayout, PageContent } from './layout';
import { getTeamRoleConfig } from './utils/statusConfig';
import { useTeam, useCreateTeamMember, useUpdateTeamMember, useDeleteTeamMember } from '@/hooks/useTeam';
import { useTaskCountsByAssignee } from '@/hooks/useTasks';
import { InviteMemberModal, EditMemberModal, ConfirmationModal, AlertModal } from './modals';
import { validateEmail } from '@/lib/validation';
import { sanitizeForStorage } from '@/lib/security';

export const TeamScreen = () => {
  const { data: members = [], isLoading } = useTeam();
  const { data: taskCountsByAssignee = {} } = useTaskCountsByAssignee();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleExport = () => {
    // In real app, this would export team data to CSV/Excel
    console.log('Export team data');
    setAlertMessage({
      title: 'Export',
      message: 'Export functionality - would download team data as CSV',
      type: 'info',
    });
  };

  const handleEdit = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setEditingMember(member);
    }
  };

  const handleDelete = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setDeletingMember(member);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    
    try {
      await deleteMember.mutateAsync(deletingMember.id);
      setDeletingMember(null);
      setAlertMessage({
        title: 'Success',
        message: `Member "${deletingMember.name}" has been removed.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to delete team member', err);
      setDeletingMember(null);
      setAlertMessage({
        title: 'Error',
        message: 'Failed to remove team member. Please try again.',
        type: 'error',
      });
    }
  };

  const handleSaveEdit = async (data: { name: string; email: string; role: string }) => {
    if (!editingMember) return;

    // Validate email
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      setAlertMessage({
        title: 'Error',
        message: emailValidation.error || 'Invalid email address',
        type: 'error',
      });
      return;
    }

    try {
      await updateMember.mutateAsync({
        id: editingMember.id,
        name: sanitizeForStorage(data.name),
        email: sanitizeForStorage(data.email),
        role: data.role as TeamMember['role'],
      });
      setEditingMember(null);
      setAlertMessage({
        title: 'Success',
        message: `Member "${data.name}" has been updated.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to update team member', err);
      setEditingMember(null);
      setAlertMessage({
        title: 'Error',
        message: 'Failed to update team member. Please try again.',
        type: 'error',
      });
    }
  };

  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    if (searchQuery) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((member) => member.role === roleFilter);
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter((member) => (taskCountsByAssignee[member.id]?.assigned ?? 0) > 0);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((member) => (taskCountsByAssignee[member.id]?.assigned ?? 0) === 0);
    }

    return filtered;
  }, [members, searchQuery, roleFilter, statusFilter, taskCountsByAssignee]);

  const handleInvite = async (email: string, role: string) => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setAlertMessage({
        title: 'Error',
        message: emailValidation.error || 'Invalid email address',
        type: 'error',
      });
      return;
    }

    try {
      // Extract name from email (before @) as default name
      const defaultName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      
      await createMember.mutateAsync({
        name: defaultName,
        email: sanitizeForStorage(email),
        role: role as TeamMember['role'],
        avatar: '',
      });
      setIsInviteModalOpen(false);
      setAlertMessage({
        title: 'Success',
        message: `Team member "${email}" has been added as ${role}.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to create team member', err);
      setIsInviteModalOpen(false);
      setAlertMessage({
        title: 'Error',
        message: 'Failed to add team member. The email may already be in use.',
        type: 'error',
      });
    }
  };

  return (
    <>
      <AppLayout
        headerTitle="Team Management"
        showSearch
        searchPlaceholder="Search team members..."
        onSearchChange={setSearchQuery}
      >
      <PageContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[#506395] text-base">Manage your team members and their permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-sm font-medium text-[#0e121b] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              onClick={handleExport}
              aria-label="Export team data"
            >
              <span className="material-symbols-outlined text-[20px]">file_upload</span>
              Export
            </button>
            <button
              className="flex items-center justify-center gap-2 px-5 h-11 rounded-lg bg-primary hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              onClick={() => setIsInviteModalOpen(true)}
              aria-label="Invite new user"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Invite User
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5 md:col-span-4 relative group">
            <span className="material-symbols-outlined absolute left-3 top-3.5 text-[#506395] group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              className="w-full h-12 pl-10 pr-4 bg-white dark:bg-gray-800 border border-[#d1d6e6] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white placeholder-[#506395] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-normal"
              placeholder="Search by name or email"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search team members"
            />
          </div>
          <div className="sm:col-span-3 md:col-span-2 relative">
            <select
              className="w-full h-12 pl-4 pr-10 bg-white dark:bg-gray-800 border border-[#d1d6e6] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter by role"
            >
              <option disabled value="">
                Role
              </option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="guest">Guest</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3.5 text-[#506395] pointer-events-none">
              expand_more
            </span>
          </div>
          <div className="sm:col-span-3 md:col-span-2 relative">
            <select
              className="w-full h-12 pl-4 pr-10 bg-white dark:bg-gray-800 border border-[#d1d6e6] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white text-sm font-normal focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option disabled value="">
                Status
              </option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3.5 text-[#506395] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
        <div className="w-full min-w-0 overflow-hidden rounded-lg border border-[#d1d6e6] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e8ebf3] dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#506395]">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#506395]">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#506395]">
                    Tasks Assigned
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#506395]">
                    Tasks Overdue
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#506395] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ebf3] dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#506395]">
                      Loading team members...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#506395]">
                      No team members found.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                  const roleConfig = getTeamRoleConfig(member.role);
                  return (
                    <tr
                      key={member.id}
                      className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-white dark:ring-gray-800 shadow-sm"
                            style={{ backgroundImage: `url('${member.avatar}')` }}
                            role="img"
                            aria-label={`${member.name} avatar`}
                          ></div>
                          <div className="flex flex-col">
                            <span className="text-[#0e121b] dark:text-white text-sm font-medium">
                              {member.name}
                            </span>
                            <span className="text-[#506395] text-xs">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md ${roleConfig.bgColor} px-2 py-1 text-xs font-medium ${roleConfig.textColor} ring-1 ring-inset ring-gray-500/10`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#506395]">
                        {taskCountsByAssignee[member.id]?.assigned ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(taskCountsByAssignee[member.id]?.overdue ?? 0) > 0 ? (
                          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 w-fit">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[16px]">
                              warning
                            </span>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              {taskCountsByAssignee[member.id]?.overdue ?? 0} Overdue
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500"></span>
                            <span className="text-sm text-[#506395]">0</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 rounded-lg text-[#506395] hover:text-primary hover:bg-primary/10 transition-colors"
                            onClick={() => handleEdit(member.id)}
                            title="Edit User"
                            aria-label={`Edit ${member.name}`}
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-[#506395] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={() => handleDelete(member.id)}
                            title="Remove User"
                            aria-label={`Remove ${member.name}`}
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#e8ebf3] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <a
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                href="#"
              >
                Previous
              </a>
              <a
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                href="#"
              >
                Next
              </a>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#506395]">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
                  <span className="font-medium">12</span> results
                </p>
              </div>
              <div>
                <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <a
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    href="#"
                    aria-label="Previous page"
                  >
                    <span className="sr-only">Previous</span>
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </a>
                  <a
                    aria-current="page"
                    className="relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    href="#"
                  >
                    1
                  </a>
                  <a
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    href="#"
                  >
                    2
                  </a>
                  <a
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    href="#"
                  >
                    3
                  </a>
                  <a
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    href="#"
                    aria-label="Next page"
                  >
                    <span className="sr-only">Next</span>
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </AppLayout>
    <InviteMemberModal
      isOpen={isInviteModalOpen}
      onClose={() => setIsInviteModalOpen(false)}
      onInvite={handleInvite}
    />
    <EditMemberModal
      isOpen={!!editingMember}
      member={editingMember}
      onSave={handleSaveEdit}
      onClose={() => setEditingMember(null)}
    />
    <ConfirmationModal
      isOpen={!!deletingMember}
      title="Remove Team Member"
      message={`Are you sure you want to remove "${deletingMember?.name}" from the team?\n\nThis action cannot be undone.`}
      confirmText="Remove"
      cancelText="Cancel"
      type="danger"
      onConfirm={handleConfirmDelete}
      onCancel={() => setDeletingMember(null)}
    />
    {alertMessage && (
      <AlertModal
        isOpen={!!alertMessage}
        title={alertMessage.title}
        message={alertMessage.message}
        type={alertMessage.type}
        onClose={() => setAlertMessage(null)}
      />
    )}
    </>
  );
};
