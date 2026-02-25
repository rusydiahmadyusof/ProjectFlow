'use client';

import { useEffect, useMemo, useState } from 'react';
import { Task, Project } from '@/components/types';
import { calculateProjectStats } from '@/lib/projectStats';
import { getTaskStatusConfig } from '../utils/statusConfig';

interface ProjectHeaderProps {
  projectName?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  projectLead?: {
    name: string;
    avatar: string;
  };
  teamMembers?: string[];
  description?: string;
  tasks?: Task[];
  project?: Project;
}

export const ProjectHeader = ({
  projectName = 'Website Redesign',
  progress: propProgress,
  startDate: propStartDate,
  endDate: propEndDate,
  projectLead: propProjectLead,
  teamMembers: propTeamMembers = [],
  description,
  tasks = [],
  project,
}: ProjectHeaderProps) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Normalize project dates (Supabase may return created_at/due_date or Date objects)
  const projectWithDates = useMemo(() => {
    if (!project) return project;
    const p = project as Project & Record<string, unknown>;
    const toDateStr = (v: unknown): string => {
      if (v == null || v === '') return '';
      if (typeof v === 'string') return v.trim();
      if (typeof v === 'object' && 'toISOString' in (v as Date)) return (v as Date).toISOString();
      return String(v);
    };
    return {
      ...project,
      createdAt: toDateStr(project.createdAt ?? p?.created_at ?? ''),
      dueDate: toDateStr(project.dueDate ?? p?.due_date ?? ''),
    };
  }, [project]);

  // Calculate stats from tasks and project (always run so we get project dates even with no tasks)
  const stats = useMemo(
    () => calculateProjectStats(tasks, projectWithDates),
    [tasks, projectWithDates]
  );

  // Use calculated stats or props; no hardcoded fallbacks so we show actual data or clear empty state
  const progress = stats?.progress ?? propProgress ?? 0;
  const startDate = stats?.startDate || propStartDate || '';
  const endDate = stats?.endDate || propEndDate || '';
  const projectLead = stats?.projectLead || propProjectLead || null;
  const teamMembers = (stats?.teamMembers && stats.teamMembers.length > 0) ? stats.teamMembers : propTeamMembers;
  const progressDataPoints = stats?.progressDataPoints || [];
  const projectDescription = description || project?.client || 'Comprehensive project management and task tracking.';

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<Task['status'], number>> = {};
    tasks.forEach((task) => {
      counts[task.status] = (counts[task.status] ?? 0) + 1;
    });
    return counts;
  }, [tasks]);

  const statusColors: Record<Task['status'], string> = {
    'to-do': '#9CA3AF',
    'in-progress': '#3B82F6',
    done: '#10B981',
    overdue: '#F59E0B',
    review: '#F97316',
    drafting: '#6B7280',
    pending: '#A855F7',
  };

  // Generate SVG path from overall progress data points
  const generatePath = useMemo(() => {
    if (progressDataPoints.length < 2) {
      const start = startDate || '—';
      const end = endDate || '—';
      const y = progress > 0 ? 100 - (progress / 100) * 80 - 10 : 80;
      return {
        areaPath: `M0,80 L400,80 L400,${y} L0,80 Z`,
        linePath: `M0,80 L400,${y}`,
        circles: [
          { cx: 0, cy: 80 },
          { cx: 400, cy: y },
        ],
        dates: [start, end],
      };
    }

    const numPoints = progressDataPoints.length;
    const width = 400;
    const height = 100;
    const maxProgress = 100;

    // Generate path coordinates
    const points = progressDataPoints.map((point, index) => {
      const x = (index / (numPoints - 1)) * width;
      const y = height - (point.progress / maxProgress) * (height - 20) - 10; // Leave 10px margin at bottom
      return { x, y, progress: point.progress };
    });

    // Create smooth curve using quadratic bezier
    let areaPath = `M${points[0].x},${points[0].y}`;
    let linePath = `M${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const controlX = (prev.x + curr.x) / 2;
      const controlY = (prev.y + curr.y) / 2;

      if (i === 1) {
        linePath += ` Q${controlX},${controlY} ${curr.x},${curr.y}`;
      } else {
        linePath += ` T${curr.x},${curr.y}`;
      }
    }

    // Close area path
    areaPath = linePath + ` L${width},${height} L0,${height} Z`;

    const circles = points.map((p) => ({ cx: p.x, cy: p.y }));
    const dates = progressDataPoints.map((p) => p.date);

    return { areaPath, linePath, circles, dates };
  }, [progressDataPoints, startDate, endDate, progress]);

  // No per-point status tooltip: keep header graph clean

  useEffect(() => {
    // Start animations after component mounts
    setTimeout(() => {
      setIsAnimated(true);
    }, 200);

    // Animate progress bar
    setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);

    // Animate percentage text
    setTimeout(() => {
      setAnimatedPercentage(progress);
    }, 400);
  }, [progress]);

  // Approximate path length for line animation
  const pathLength = 450;
  const maskHeight = isAnimated ? 100 : 0;
  return (
    <div className="flex flex-col gap-6 mb-8 bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-text-main dark:text-white">{projectName}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary">Overall Progress</span>
              <span className="text-lg font-bold text-primary transition-all duration-1000 ease-out">
                {Math.round(animatedPercentage)}%
              </span>
            </div>
          </div>
          <div className="h-28 w-full relative overflow-hidden mb-2">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 400 100"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="gradientArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1d4fd7" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="#1d4fd7" stopOpacity="0"></stop>
                </linearGradient>
                <clipPath id="projectChartClip">
                  <rect
                    x="0"
                    y={100 - maskHeight}
                    width="400"
                    height={maskHeight}
                    style={{
                      transition: 'all 1.2s ease-out',
                      transitionDelay: '0.1s',
                    }}
                  />
                </clipPath>
              </defs>
              <g clipPath="url(#projectChartClip)">
                <path
                  d={generatePath.areaPath}
                  fill="url(#gradientArea)"
                  className="transition-opacity duration-500"
                  style={{ opacity: isAnimated ? 1 : 0, transitionDelay: '0.3s' }}
                ></path>
                <path
                  d={generatePath.linePath}
                  fill="none"
                  stroke="#1d4fd7"
                  strokeWidth="2.5"
                  strokeDasharray={pathLength}
                  strokeDashoffset={isAnimated ? 0 : pathLength}
                  style={{
                    transition: 'stroke-dashoffset 1s ease-out',
                    transitionDelay: '0.2s',
                  }}
                ></path>
              </g>
              {generatePath.circles.map((circle, index) => (
                <circle
                  key={index}
                  cx={circle.cx}
                  cy={circle.cy}
                  fill="#1d4fd7"
                  r="3"
                  className={`transition-all duration-300 ${
                    isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  style={{ transitionDelay: `${0.4 + index * 0.1}s` }}
                ></circle>
              ))}
            </svg>
            <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[10px] text-text-secondary font-medium pt-2 border-t border-dashed border-border-light dark:border-border-dark">
              {generatePath.dates.map((date, index) => (
                <span key={index}>{date}</span>
              ))}
            </div>
          </div>
          {tasks.length > 0 && (
            <div className="flex flex-wrap gap-3 text-[11px] text-text-secondary mb-1">
              {(['to-do', 'in-progress', 'done', 'overdue', 'review', 'drafting', 'pending'] as Task['status'][])
                .map((statusKey) => {
                  const count = statusCounts[statusKey] ?? 0;
                  if (!count) return null;
                  const config = getTaskStatusConfig(statusKey);
                  return (
                    <div key={statusKey} className="flex items-center gap-1">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: statusColors[statusKey] }}
                      ></span>
                      <span>{config.label}</span>
                      <span className="opacity-70">({count})</span>
                    </div>
                  );
                })}
            </div>
          )}
          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${animatedProgress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
        <div className="lg:w-1/3 lg:border-l border-border-light dark:border-border-dark lg:pl-6 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-text-main dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">info</span>
            Project Details
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
              {projectDescription}
            </p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-tight mb-1">
                  Project Lead
                </p>
                <div className="flex items-center gap-2">
                  {projectLead ? (
                    <>
                      {projectLead.avatar ? (
                        <div
                          className="size-6 rounded-full bg-cover bg-center ring-1 ring-border-light flex-shrink-0"
                          style={{ backgroundImage: `url('${projectLead.avatar}')` }}
                          role="img"
                          aria-label={`${projectLead.name} avatar`}
                        />
                      ) : (
                        <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0" aria-hidden>
                          {projectLead.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-text-main dark:text-white truncate">
                        {projectLead.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-text-secondary dark:text-gray-400">Not assigned</span>
                  )}
                </div>
              </div>
              <div className="col-span-2 min-w-0">
                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-tight mb-1">
                  Start / End
                </p>
                <p className="text-sm font-medium text-text-main dark:text-white">
                  {startDate && endDate
                    ? `${startDate} – ${endDate}`
                    : startDate || endDate
                      ? `${startDate || '—'} – ${endDate || '—'}`
                      : '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-tight mb-1">
                  Team Presence
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {teamMembers.slice(0, 3).map((avatar, index) => (
                      <div
                        key={index}
                        className="size-7 rounded-full border-2 border-white dark:border-surface-dark bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: avatar ? `url('${avatar}')` : undefined }}
                        role="img"
                        aria-label={`Team member ${index + 1}`}
                      />
                    ))}
                    {teamMembers.length > 3 && (
                      <div className="size-7 rounded-full border-2 border-white dark:border-surface-dark bg-primary flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                        +{teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary">
                    {teamMembers.length} Member{teamMembers.length !== 1 ? 's' : ''} total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
