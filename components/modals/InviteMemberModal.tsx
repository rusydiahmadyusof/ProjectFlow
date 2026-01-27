'use client';

import { useState } from 'react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string) => void;
}

export const InviteMemberModal = ({ isOpen, onClose, onInvite }: InviteMemberModalProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'guest' | 'owner'>('member');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email.trim(), role);
      setEmail('');
      setRole('member');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a202c] rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0e121b] dark:text-white">Invite Team Member</h2>
          <button
            onClick={onClose}
            className="text-[#506395] hover:text-[#0e121b] dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="colleague@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="w-full px-4 py-2.5 bg-background-light dark:bg-gray-800 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="guest">Guest</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#e8ebf3] dark:border-gray-700 rounded-lg text-[#0e121b] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email.trim()}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
