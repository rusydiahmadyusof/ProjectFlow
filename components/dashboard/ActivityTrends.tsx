'use client';

import { useEffect, useState } from 'react';
import { useDashboardStats } from '@/hooks/useDashboard';

export const ActivityTrends = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const trendPercentage = stats?.trendPercentage || 18;
  const [isAnimated, setIsAnimated] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      // Start animations after a short delay
      setTimeout(() => {
        setIsAnimated(true);
      }, 200);
      
      // Animate percentage badge
      setTimeout(() => {
        setAnimatedPercentage(trendPercentage);
      }, 400);
    }
  }, [isLoading, trendPercentage]);

  // Calculate path length for animation (approximate)
  const pathLength = 650; // Approximate length of the curve path
  // For bottom-to-top reveal animation
  const maskHeight = isAnimated ? 200 : 0;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a202c] p-5 rounded-lg shadow-sm border border-[#e8ebf3] dark:border-[#2d3748] flex flex-col h-full min-h-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Activity Trends</h3>
            <p className="text-xs text-[#506395] mt-0.5">Task completion velocity</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#506395] text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-[#1a202c] p-5 rounded-lg shadow-sm border border-[#e8ebf3] dark:border-[#2d3748] flex flex-col h-full min-h-0">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#0e121b] dark:text-white">Activity Trends</h3>
          <p className="text-xs text-[#506395] mt-0.5">Task completion velocity</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-green-600 bg-green-50 dark:bg-green-900/20 text-[10px] px-1.5 py-0.5 rounded font-bold transition-all duration-1000 ease-out ${isAnimated ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '0.4s' }}>
            +{animatedPercentage}%
          </span>
        </div>
      </div>
      <div className="flex-1 w-full flex flex-col justify-end relative min-h-0">
        <div className="relative h-[140px] md:h-[160px] w-full">
          <div className={`absolute top-[25%] left-[65%] -translate-x-1/2 -translate-y-full mb-2 z-20 flex flex-col items-center transition-all duration-700 ease-out ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '1.2s' }}>
            <div className="bg-[#0e121b] text-white text-xs py-1.5 px-3 rounded shadow-lg">
              <span className="font-bold block">Week 4</span>
              <span className="text-gray-300">42 Tasks</span>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#0e121b]"></div>
          </div>
          <div className={`absolute top-[25%] left-[65%] -translate-x-1/2 -translate-y-1/2 size-3 bg-white border-2 border-primary rounded-full shadow z-10 transition-all duration-500 ease-out ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} style={{ transitionDelay: '1s' }}></div>
          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 400 200"
            aria-label="Activity trends chart"
          >
            <line stroke="#e8ebf3" strokeWidth="1" x1="0" x2="400" y1="200" y2="200" />
            <line
              stroke="#e8ebf3"
              strokeDasharray="4 4"
              strokeWidth="1"
              x1="0"
              x2="400"
              y1="150"
              y2="150"
            />
            <line
              stroke="#e8ebf3"
              strokeDasharray="4 4"
              strokeWidth="1"
              x1="0"
              x2="400"
              y1="100"
              y2="100"
            />
            <line
              stroke="#e8ebf3"
              strokeDasharray="4 4"
              strokeWidth="1"
              x1="0"
              x2="400"
              y1="50"
              y2="50"
            />
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1d4fd7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1d4fd7" stopOpacity="0" />
              </linearGradient>
              <clipPath id="chartClip">
                <rect
                  x="0"
                  y={200 - maskHeight}
                  width="400"
                  height={maskHeight}
                  style={{
                    transition: 'all 1.2s ease-out',
                    transitionDelay: '0.2s',
                  }}
                />
              </clipPath>
            </defs>
            <g clipPath="url(#chartClip)">
              <path
                d="M0,160 C50,160 80,120 120,110 C180,95 220,130 260,50 C300,-10 350,80 400,60 L400,200 L0,200 Z"
                fill="url(#areaGradient)"
              />
              <path
                d="M0,160 C50,160 80,120 120,110 C180,95 220,130 260,50 C300,-10 350,80 400,60"
                fill="none"
                stroke="#1d4fd7"
                strokeLinecap="round"
                strokeWidth="3"
                strokeDasharray={pathLength}
                strokeDashoffset={isAnimated ? 0 : pathLength}
                style={{
                  transition: 'stroke-dashoffset 1s ease-out',
                  transitionDelay: '0.2s',
                }}
              />
            </g>
          </svg>
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-medium text-[#506395] uppercase tracking-wide">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
        </div>
      </div>
    </div>
  );
};
