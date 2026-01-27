'use client';

import { useActivities } from '@/hooks/useActivities';

export const ActivityLog = () => {
  const { data: activities = [], isLoading } = useActivities();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a202c] p-5 rounded-lg shadow-sm border border-[#e8ebf3] dark:border-[#2d3748] flex flex-col h-full min-h-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Activity Log</h3>
            <p className="text-xs text-[#506395] mt-0.5">Recent user actions</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#506395] text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  // Show only latest 3 activities
  const displayActivities = activities.slice(0, 3);

  return (
    <div className="bg-white dark:bg-[#1a202c] p-5 rounded-lg shadow-sm border border-[#e8ebf3] dark:border-[#2d3748] flex flex-col h-full min-h-0">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Activity Log</h3>
          <p className="text-xs text-[#506395] mt-0.5">Recent user actions</p>
        </div>
        <button
          className="text-[#506395] hover:text-primary transition-colors"
          aria-label="View full history"
          onClick={() => {}}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
        </button>
      </div>
      <div className="flex flex-col gap-0 flex-1 justify-center min-h-0">
        {displayActivities.map((activity, index) => (
          <div key={activity.id} className="flex gap-3 relative pb-3.5">
            {index < displayActivities.length - 1 && (
              <div className="absolute left-4 top-6 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
            )}
            <div
              className={`relative z-10 size-8 rounded-full ${activity.bgColor} ${activity.iconColor} flex items-center justify-center shrink-0`}
            >
              <span className="material-symbols-outlined text-[16px]">{activity.icon}</span>
            </div>
            <div className="pt-0.5">
              <p className="text-xs text-[#0e121b] dark:text-gray-200">
                <span className="font-bold">{activity.user}</span> {activity.action}{' '}
                {activity.target && <span className="font-medium">{activity.target}</span>}
              </p>
              <p className="text-[10px] text-[#506395] mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
