'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div
      className={`rounded-lg border border-[#e8ebf3] dark:border-[#2d3748] bg-white dark:bg-[#1a202c] shadow-sm flex flex-col min-h-0 min-w-0 overflow-hidden p-4 ${className}`.trim()}
    >
      {children}
    </div>
  );
};
