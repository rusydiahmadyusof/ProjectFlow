'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number; // Minimum time to show splash (ms)
}

export const SplashScreen = ({ onComplete, minDisplayTime = 1500 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDisplayTime - elapsed);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300); // Fade out duration
    }, remaining);

    return () => clearTimeout(timer);
  }, [startTime, minDisplayTime, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo Animation */}
        <div className="relative">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white text-3xl font-bold">P</span>
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            ProjectFlow
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading your workspace...
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};
