'use client';

import { useState } from 'react';
import { TeamMember } from './types';
import { AppLayout, PageContent } from './layout';
import { getTeamRoleConfig } from './utils/statusConfig';
import { AlertModal } from './modals';
import { useTeam } from '@/hooks/useTeam';


export const SettingsScreen = () => {
  const { data: teamMembers = [], isLoading: isLoadingTeam } = useTeam();
  const [orgName, setOrgName] = useState('Acme Corp');
  const [supportEmail, setSupportEmail] = useState('admin@acme.inc');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMessage, setAlertMessage] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would save to API
    console.log('Save settings', { orgName, supportEmail, darkMode });
    setAlertMessage({
      title: 'Success',
      message: 'Settings saved successfully!',
      type: 'success',
    });
  };

  const handleDiscard = () => {
    // Reset to original values
    setOrgName('Acme Corp');
    setSupportEmail('admin@acme.inc');
    setDarkMode(false);
    setAlertMessage({
      title: 'Changes Discarded',
      message: 'All unsaved changes have been discarded.',
      type: 'info',
    });
  };

  const handleManageTeam = () => {
    console.log('Manage team');
  };

  return (
    <AppLayout
      headerTitle="Settings & Admin"
      showSearch
      searchPlaceholder="Search tasks, projects, or team members..."
    >
      <PageContent maxWidth="narrow">
              <div className="flex flex-col gap-2">
                <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black tracking-tight">Settings & Admin</h1>
                <p className="text-text-secondary text-base max-w-2xl">Manage your organization profile, default project configurations, team members, and system preferences.</p>
              </div>
              <form className="flex flex-col gap-6" onSubmit={handleSave}>
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">domain</span>
                    <h2 className="text-xl font-bold text-text-main dark:text-white">Organization Profile</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-5">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-text-main dark:text-gray-200">Organization Name</span>
                        <input
                          className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-black/20 px-4 h-12 text-base text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                          placeholder="Enter organization name"
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          aria-label="Organization name"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-text-main dark:text-gray-200">Support Email</span>
                        <input
                          className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-black/20 px-4 h-12 text-base text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                          placeholder="support@company.com"
                          type="email"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          aria-label="Support email"
                        />
                      </label>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-text-main dark:text-gray-200">Company Logo</span>
                      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border-light dark:border-border-dark bg-background-light/50 dark:bg-black/10 px-6 py-8 hover:bg-background-light dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                        <div className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-text-main dark:text-white">Click to upload</p>
                          <p className="text-xs text-text-secondary">SVG, PNG, JPG (max. 800x400px)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">tune</span>
                    <h2 className="text-xl font-bold text-text-main dark:text-white">Project Defaults</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-text-main dark:text-gray-200">Default Task Status</span>
                      <div className="relative">
                        <select className="w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-black/20 px-4 h-12 text-base text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none cursor-pointer" aria-label="Default task status">
                          <option>To Do</option>
                          <option>In Progress</option>
                          <option>Backlog</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
                          <span className="material-symbols-outlined">expand_more</span>
                        </div>
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-text-main dark:text-gray-200">Default Priority Level</span>
                      <div className="relative">
                        <select className="w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-black/20 px-4 h-12 text-base text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none cursor-pointer" aria-label="Default priority level">
                          <option>Medium</option>
                          <option>Low</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
                          <span className="material-symbols-outlined">expand_more</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">groups</span>
                      <h2 className="text-xl font-bold text-text-main dark:text-white">Team Management</h2>
                    </div>
                    <button className="text-sm font-bold text-primary hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center gap-1" onClick={handleManageTeam} type="button">
                      Manage Team <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                  <div className="flex flex-col divide-y divide-border-light dark:divide-gray-800">
                    {isLoadingTeam ? (
                      <div className="py-8 text-center text-text-secondary">Loading team members...</div>
                    ) : teamMembers.length === 0 ? (
                      <div className="py-8 text-center text-text-secondary">No team members found</div>
                    ) : (
                      teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between py-4 first:pt-0">
                          <div className="flex items-center gap-3">
                            {member.avatar ? (
                              <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${member.avatar}')` }} role="img" aria-label={`${member.name} avatar`}></div>
                            ) : (
                              <div className="size-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-text-secondary font-semibold">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <p className="text-sm font-bold text-text-main dark:text-white">{member.name}</p>
                              <p className="text-xs text-text-secondary">{member.email}</p>
                            </div>
                          </div>
                          {(() => {
                            const roleConfig = getTeamRoleConfig(member.role);
                            return (
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleConfig.bgColor} ${roleConfig.textColor}`}
                              >
                                {roleConfig.label}
                              </span>
                            );
                          })()}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">palette</span>
                    <h2 className="text-xl font-bold text-text-main dark:text-white">Appearance</h2>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-base font-semibold text-text-main dark:text-white">Dark Mode</p>
                      <p className="text-sm text-text-secondary">Adjust the interface theme for low-light environments.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        className="sr-only peer"
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        aria-label="Toggle dark mode"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-4 py-6 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-t border-border-light dark:border-border-dark mt-4">
                  <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-text-secondary hover:text-text-main hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors" type="button" onClick={handleDiscard}>
                    Discard Changes
                  </button>
                  <button className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2" type="submit">
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Settings
                  </button>
                </div>
              </form>
      </PageContent>
      {alertMessage && (
        <AlertModal
          isOpen={!!alertMessage}
          title={alertMessage.title}
          message={alertMessage.message}
          type={alertMessage.type}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </AppLayout>
  );
};
