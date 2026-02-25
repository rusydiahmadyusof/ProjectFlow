'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { Card } from '@/components/ui';

const VIEW_WIDTH = 400;
const VIEW_HEIGHT = 200;
const PAD_X = 40;
const CHART_WIDTH = VIEW_WIDTH - PAD_X * 2;
const CHART_HEIGHT = VIEW_HEIGHT - 20;

export const ActivityTrends = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const trendPercentage = stats?.trendPercentage ?? 0;
  const weeklyTrend = stats?.weeklyTrend;
  const projects = stats?.projects ?? [];
  const [isAnimated, setIsAnimated] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [filter, setFilter] = useState<string>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const labels = weeklyTrend?.labels ?? [];
  const valuesAll = weeklyTrend?.all ?? [];
  const byProject = weeklyTrend?.byProject ?? {};
  const currentValues =
    filter === 'all'
      ? valuesAll
      : (byProject[filter] ?? Array(labels.length).fill(0));
  // Show a subset of x-axis labels for readability (e.g. 30d, 25d, 20d, ... Today)
  const axisLabelIndices =
    labels.length > 6
      ? [0, Math.floor(labels.length / 5), Math.floor((2 * labels.length) / 5), Math.floor((3 * labels.length) / 5), Math.floor((4 * labels.length) / 5), labels.length - 1]
      : labels.map((_, i) => i);
  const axisLabels = axisLabelIndices.map((i) => labels[i]);

  const maxValue = Math.max(1, ...currentValues);
  const points = useMemo(() => {
    const step = CHART_WIDTH / (currentValues.length - 1 || 1);
    return currentValues.map((v, i) => ({
      x: PAD_X + i * step,
      y: 10 + CHART_HEIGHT - (v / maxValue) * CHART_HEIGHT,
      value: v,
    }));
  }, [currentValues, maxValue]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    let d = `M ${first.x},${first.y}`;
    rest.forEach((p) => {
      d += ` L ${p.x},${p.y}`;
    });
    return d;
  }, [points]);

  const chartBottomY = 10 + CHART_HEIGHT;
  const areaD = useMemo(() => {
    if (pathD === '') return '';
    return `${pathD} L ${points[points.length - 1].x},${chartBottomY} L ${points[0].x},${chartBottomY} Z`;
  }, [pathD, points, chartBottomY]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setIsAnimated(true), 200);
      setTimeout(() => setAnimatedPercentage(trendPercentage), 400);
    }
  }, [isLoading, trendPercentage]);

  const pathLength = 600;
  const maskHeight = isAnimated ? VIEW_HEIGHT : 0;

  // Chart content in viewBox: x from PAD_X to PAD_X+CHART_WIDTH (same range as the line)
  const contentLeft = PAD_X / VIEW_WIDTH;
  const contentRight = (PAD_X + CHART_WIDTH) / VIEW_WIDTH;
  const contentWidth = contentRight - contentLeft;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = chartRef.current;
    if (!el || points.length === 0) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fraction = x / rect.width;
    const contentFraction = (fraction - contentLeft) / contentWidth;
    const index = Math.max(
      0,
      Math.min(points.length - 1, Math.round(contentFraction * (points.length - 1)))
    );
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  // Position dot/tooltip using same coordinates as the line (viewBox → % of container)
  const hoverLeftPercent = hoveredPoint != null ? (hoveredPoint.x / VIEW_WIDTH) * 100 : 50;
  const hoverTopPercent = hoveredPoint != null ? (hoveredPoint.y / VIEW_HEIGHT) * 100 : 50;

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Activity Trends</h3>
            <p className="text-xs text-[#506395] mt-0.5">Last 30 days task completion</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#506395] text-sm">Loading...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-3 gap-2 flex-shrink-0">
        <div>
          <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Activity Trends</h3>
          <p className="text-xs text-[#506395] mt-0.5">Last 30 days task completion</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-[10px] font-medium text-[#506395] dark:text-[#94a3b8] bg-gray-50 dark:bg-gray-800 border border-[#e8ebf3] dark:border-[#2d3748] rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            aria-label="Filter by project"
          >
            <option value="all">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span
            className={`text-green-600 bg-green-50 dark:bg-green-900/20 text-[10px] px-1.5 py-0.5 rounded font-bold transition-all duration-1000 ease-out ${isAnimated ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '0.4s' }}
          >
            +{animatedPercentage}%
          </span>
        </div>
      </div>
      <div className="flex-1 w-full min-w-0 flex flex-col justify-end relative min-h-0 overflow-hidden">
        <div
          ref={chartRef}
          className="relative h-[140px] md:h-[160px] w-full min-w-0 cursor-crosshair overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {hoveredPoint !== null && (
            <div
              className="absolute z-20 flex flex-col items-center pointer-events-none transition-transform duration-75"
              style={{
                left: `${hoverLeftPercent}%`,
                top: `${hoverTopPercent}%`,
                transform:
                  hoverTopPercent < 50
                    ? 'translate(-50%, 0) translateY(12px)'
                    : 'translate(-50%, -100%) translateY(-8px)',
              }}
            >
              {hoverTopPercent >= 50 && (
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#0e121b] dark:border-t-slate-800" />
              )}
              <div className="bg-[#0e121b] dark:bg-slate-800 text-white text-xs py-1.5 px-3 rounded shadow-lg border border-[#2d3748] whitespace-nowrap">
                <span className="font-bold block">{labels[hoveredIndex!]}</span>
                <span className="text-gray-300">
                  {hoveredPoint.value} Task{hoveredPoint.value !== 1 ? 's' : ''}
                </span>
              </div>
              {hoverTopPercent < 50 && (
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#0e121b] dark:border-b-slate-800" />
              )}
            </div>
          )}
          {hoveredPoint !== null && (
            <div
              className="absolute size-3 bg-white border-2 border-primary rounded-full shadow z-10 pointer-events-none"
              style={{
                left: `${hoverLeftPercent}%`,
                top: `${hoverTopPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
          <svg
            className="w-full h-full block"
            preserveAspectRatio="none"
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            aria-label="Activity trends chart"
          >
            <line stroke="#e8ebf3" strokeWidth="1" x1="0" x2={VIEW_WIDTH} y1={VIEW_HEIGHT} y2={VIEW_HEIGHT} />
            <line stroke="#e8ebf3" strokeDasharray="4 4" strokeWidth="1" x1="0" x2={VIEW_WIDTH} y1="150" y2="150" />
            <line stroke="#e8ebf3" strokeDasharray="4 4" strokeWidth="1" x1="0" x2={VIEW_WIDTH} y1="100" y2="100" />
            <line stroke="#e8ebf3" strokeDasharray="4 4" strokeWidth="1" x1="0" x2={VIEW_WIDTH} y1="50" y2="50" />
            <defs>
              <linearGradient id="activityAreaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1d4fd7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1d4fd7" stopOpacity="0" />
              </linearGradient>
              <clipPath id="chartContentClip">
                <rect x={PAD_X} y={10} width={CHART_WIDTH} height={CHART_HEIGHT} />
              </clipPath>
              <clipPath id="activityChartClip">
                <rect
                  x="0"
                  y={VIEW_HEIGHT - maskHeight}
                  width={VIEW_WIDTH}
                  height={maskHeight}
                  style={{ transition: 'all 1.2s ease-out', transitionDelay: '0.2s' }}
                />
              </clipPath>
            </defs>
            <g clipPath="url(#chartContentClip)">
              <g clipPath="url(#activityChartClip)">
                <path d={areaD} fill="url(#activityAreaGradient)" />
                <path
                d={pathD}
                fill="none"
                stroke="#1d4fd7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                strokeDasharray={pathLength}
                strokeDashoffset={isAnimated ? 0 : pathLength}
                style={{ transition: 'stroke-dashoffset 1s ease-out', transitionDelay: '0.2s' }}
              />
              </g>
            </g>
          </svg>
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-medium text-[#506395] dark:text-gray-400 uppercase tracking-wide flex-shrink-0 overflow-hidden">
          {axisLabels.map((l) => (
            <span key={l} className="truncate min-w-0">{l}</span>
          ))}
        </div>
      </div>
    </Card>
  );
};
