'use client';

import { useState, useMemo, useEffect } from 'react';
import { Task } from '../types';

interface TaskTimeChartProps {
  tasks: Task[];
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

export const TaskTimeChart = ({ tasks }: TaskTimeChartProps) => {
  const [period, setPeriod] = useState<TimePeriod>('weekly');
  const [isAnimated, setIsAnimated] = useState(false);

  // Helper function to parse createdAt dates from mock data format
  const parseTaskDate = (dateString: string | undefined): Date | null => {
    if (!dateString) return null;
    
    try {
      // Handle formats like "Oct 15 at 8:00 AM" or "Oct 24, 2024"
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Try parsing as standard date first
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      
      // Parse format like "Oct 15 at 8:00 AM"
      const match = dateString.match(/(\w+)\s+(\d+)/);
      if (match) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames.indexOf(match[1]);
        const day = parseInt(match[2]);
        
        if (month !== -1 && day) {
          return new Date(currentYear, month, day);
        }
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const chartData = useMemo(() => {
    const now = new Date();
    const data: Array<{ label: string; created: number; completed: number; total: number }> = [];

    if (period === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const dayTasks = tasks.filter((task) => {
          const taskDate = parseTaskDate(task.createdAt);
          if (!taskDate) return false;
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === date.getTime();
        });

        const completed = dayTasks.filter((t) => t.status === 'done' || t.isCompleted).length;
        data.push({
          label: dateKey,
          created: dayTasks.length,
          completed,
          total: dayTasks.length,
        });
      }
    } else if (period === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        const weekTasks = tasks.filter((task) => {
          const taskDate = parseTaskDate(task.createdAt);
          if (!taskDate) return false;
          return taskDate >= weekStart && taskDate <= weekEnd;
        });

        const completed = weekTasks.filter((t) => t.status === 'done' || t.isCompleted).length;
        data.push({
          label: weekLabel,
          created: weekTasks.length,
          completed,
          total: weekTasks.length,
        });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const monthTasks = tasks.filter((task) => {
          const taskDate = parseTaskDate(task.createdAt);
          if (!taskDate) return false;
          return taskDate.getMonth() === month.getMonth() && taskDate.getFullYear() === month.getFullYear();
        });

        const completed = monthTasks.filter((t) => t.status === 'done' || t.isCompleted).length;
        data.push({
          label: monthLabel,
          created: monthTasks.length,
          completed,
          total: monthTasks.length,
        });
      }
    }

    return data;
  }, [tasks, period]);

  const maxValue = Math.max(...chartData.map((d) => Math.max(d.created, d.completed)), 1);

  useEffect(() => {
    // Reset and restart animation when period or data changes
    setIsAnimated(false);
    setTimeout(() => {
      setIsAnimated(true);
    }, 100);
  }, [period, chartData]);

  // Calculate SVG path for created tasks line
  const getCreatedPath = () => {
    if (chartData.length === 0) return '';
    const width = 400;
    const height = 200;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = chartData.map((item, index) => {
      const x = padding + (index / (chartData.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - (item.created / maxValue) * chartHeight;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 3;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) / 3;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  // Calculate SVG path for completed tasks line
  const getCompletedPath = () => {
    if (chartData.length === 0) return '';
    const width = 400;
    const height = 200;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = chartData.map((item, index) => {
      const x = padding + (index / (chartData.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - (item.completed / maxValue) * chartHeight;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 3;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) / 3;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  // Calculate area fill path for created tasks
  const getCreatedAreaPath = () => {
    const linePath = getCreatedPath();
    if (!linePath) return '';
    const width = 400;
    const height = 200;
    const padding = 20;
    const firstX = padding;
    const lastX = width - padding;
    const bottomY = height - padding;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Calculate area fill path for completed tasks
  const getCompletedAreaPath = () => {
    const linePath = getCompletedPath();
    if (!linePath) return '';
    const width = 400;
    const height = 200;
    const padding = 20;
    const firstX = padding;
    const lastX = width - padding;
    const bottomY = height - padding;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Approximate path lengths for animation
  const createdPathLength = 500;
  const completedPathLength = 500;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Task Activity Trends</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track task creation and completion over time</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          {(['daily', 'weekly', 'monthly'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                period === p
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {chartData.length > 0 ? (
          <>
            <div className="relative h-48 w-full">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 200"
                preserveAspectRatio="xMidYMid meet"
                aria-label="Task activity trends chart"
              >
                {/* Grid lines */}
                <defs>
                  <linearGradient id="createdGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1d4fd7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1d4fd7" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="completedGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <clipPath id="chartClip">
                    <rect
                      x="0"
                      y={200 - (isAnimated ? 200 : 0)}
                      width="400"
                      height={isAnimated ? 200 : 0}
                      style={{
                        transition: 'all 1.2s ease-out',
                        transitionDelay: '0.1s',
                      }}
                    />
                  </clipPath>
                </defs>

                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                  <line
                    key={ratio}
                    x1="20"
                    y1={20 + ratio * 160}
                    x2="380"
                    y2={20 + ratio * 160}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray={ratio === 0 || ratio === 1 ? '0' : '4 4'}
                    className="dark:stroke-slate-700"
                  />
                ))}

                {/* Area fills */}
                <g clipPath="url(#chartClip)">
                  <path
                    d={getCreatedAreaPath()}
                    fill="url(#createdGradient)"
                    className="transition-opacity duration-500"
                    style={{ opacity: isAnimated ? 1 : 0, transitionDelay: '0.3s' }}
                  />
                  <path
                    d={getCompletedAreaPath()}
                    fill="url(#completedGradient)"
                    className="transition-opacity duration-500"
                    style={{ opacity: isAnimated ? 1 : 0, transitionDelay: '0.4s' }}
                  />
                </g>

                {/* Line paths */}
                <g clipPath="url(#chartClip)">
                  <path
                    d={getCreatedPath()}
                    fill="none"
                    stroke="#1d4fd7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={createdPathLength}
                    strokeDashoffset={isAnimated ? 0 : createdPathLength}
                    style={{
                      transition: 'stroke-dashoffset 1s ease-out',
                      transitionDelay: '0.2s',
                    }}
                  />
                  <path
                    d={getCompletedPath()}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={completedPathLength}
                    strokeDashoffset={isAnimated ? 0 : completedPathLength}
                    style={{
                      transition: 'stroke-dashoffset 1s ease-out',
                      transitionDelay: '0.3s',
                    }}
                  />
                </g>

                {/* Data points */}
                {chartData.map((item, index) => {
                  const width = 400;
                  const height = 200;
                  const padding = 20;
                  const chartWidth = width - padding * 2;
                  const chartHeight = height - padding * 2;
                  const x = padding + (index / (chartData.length - 1 || 1)) * chartWidth;
                  const createdY = padding + chartHeight - (item.created / maxValue) * chartHeight;
                  const completedY = padding + chartHeight - (item.completed / maxValue) * chartHeight;

                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={createdY}
                        r="4"
                        fill="#1d4fd7"
                        className={`transition-all duration-300 ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                        style={{ transitionDelay: `${0.4 + index * 0.1}s` }}
                      />
                      <circle
                        cx={x}
                        cy={completedY}
                        r="4"
                        fill="#10b981"
                        className={`transition-all duration-300 ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                        style={{ transitionDelay: `${0.5 + index * 0.1}s` }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between mt-2 px-5">
                {chartData.map((item, index) => (
                  <div key={index} className="text-center flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.total}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary" />
                <span className="text-xs text-slate-600 dark:text-slate-400">Created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400">Completed</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">No data available for selected period</p>
          </div>
        )}
      </div>
    </div>
  );
};
