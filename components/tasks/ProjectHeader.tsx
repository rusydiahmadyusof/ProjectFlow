'use client';

import { useEffect, useState, useMemo } from 'react';
import { Task, Project } from '@/components/types';
import { calculateProjectStats } from '@/lib/projectStats';

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

  // Calculate stats from tasks if available
  const stats = useMemo(() => {
    if (tasks.length > 0) {
      return calculateProjectStats(tasks, project);
    }
    return null;
  }, [tasks, project]);

  // Use calculated stats or fallback to props
  const progress = stats?.progress ?? propProgress ?? 0;
  const startDate = stats?.startDate || propStartDate || 'Oct 01';
  const endDate = stats?.endDate || propEndDate || 'Nov 15';
  const projectLead = stats?.projectLead || propProjectLead || {
    name: 'Sarah M.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3tgryqD_nkGvBmRRpnnVVTn1NcPdMEOn291SW6BJZU7klcHoXVECeBIvHkSxjPzD4VhdAayVJWDAnEAhy5r_ccpllgHRSkslZgCktVwmP8mtuG1uyetrCuUsyLpqeFK0CVRKig1i7wz42BHxj_7HZMogtHjbyCQ_jAYw5B-NMDCQy3G6Wlap2ZxjTft_ZNn5fwlLzazdToaIuXfubvtpDWhLeqLox0o48Xl13mUQ9PgMaXfj5jz5-A9eNeUqj9Nz0A',
  };
  const teamMembers = (stats?.teamMembers && stats.teamMembers.length > 0) ? stats.teamMembers : propTeamMembers;
  const progressDataPoints = stats?.progressDataPoints || [];
  const projectDescription = description || project?.client || 'Comprehensive project management and task tracking.';

  // Generate SVG path from progress data points
  const generatePath = useMemo(() => {
    if (progressDataPoints.length < 2) {
      // Default path if no data points
      return {
        areaPath: 'M0,80 Q50,70 100,60 T200,50 T300,30 T400,20 L400,100 L0,100 Z',
        linePath: 'M0,80 Q50,70 100,60 T200,50 T300,30 T400,20',
        circles: [
          { cx: 0, cy: 80 },
          { cx: 100, cy: 60 },
          { cx: 200, cy: 50 },
          { cx: 300, cy: 30 },
          { cx: 400, cy: 20 },
        ],
        dates: [startDate, 'Oct 15', 'Oct 30', endDate],
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
  }, [progressDataPoints, startDate, endDate]);

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
                  className={`transition-all duration-300 ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
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
                  <div
                    className="size-6 rounded-full bg-cover bg-center ring-1 ring-border-light"
                    style={{ backgroundImage: `url('${projectLead.avatar}')` }}
                    role="img"
                    aria-label={`${projectLead.name} avatar`}
                  ></div>
                  <span className="text-sm font-medium text-text-main dark:text-white">
                    {projectLead.name}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-tight mb-1">
                  Start / End
                </p>
                <p className="text-sm font-medium text-text-main dark:text-white">
                  {startDate} - {endDate}
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
                        className="size-7 rounded-full border-2 border-white dark:border-surface-dark bg-cover bg-center"
                        style={{ backgroundImage: `url('${avatar}')` }}
                        role="img"
                        aria-label={`Team member ${index + 1}`}
                      ></div>
                    ))}
                    {teamMembers.length > 3 && (
                      <div className="size-7 rounded-full border-2 border-white dark:border-surface-dark bg-primary flex items-center justify-center text-[10px] text-white font-bold">
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
