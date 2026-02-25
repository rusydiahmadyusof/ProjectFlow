'use client';

import { useActivities } from '@/hooks/useActivities';
import { Card } from '@/components/ui';

const formatActivityTime = (time: string): string => {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  const now = new Date();
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} minutes ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
  if (sec < 172800) return 'Yesterday';
  if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`;
  return date.toLocaleDateString();
};

export const ActivityLog = () => {
  const { data: activities = [], isLoading } = useActivities();

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Activity Log</h3>
            <p className="text-xs text-[#506395] mt-0.5">Recent user actions</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#506395] text-sm">Loading...</p>
        </div>
      </Card>
    );
  }
  const displayActivities = activities.slice(0, 3);

  if (displayActivities.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Activity Log</h3>
            <p className="text-xs text-[#506395] mt-0.5">Recent user actions</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#506395] text-sm">No activity yet. Create a project or task to see updates here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
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
              <p className="text-[10px] text-[#506395] mt-0.5">{formatActivityTime(activity.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
