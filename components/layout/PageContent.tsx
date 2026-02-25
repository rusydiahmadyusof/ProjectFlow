'use client';

import { ReactNode } from 'react';

type MaxWidth = 'default' | 'wide' | 'narrow';

interface PageContentProps {
  children: ReactNode;
  className?: string;
  maxWidth?: MaxWidth;
}

const maxWidthClasses: Record<MaxWidth, string> = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  narrow: 'max-w-3xl',
};

export const PageContent = ({
  children,
  className = '',
  maxWidth = 'default',
}: PageContentProps) => {
  return (
    <div
      className={`w-full ${maxWidthClasses[maxWidth]} mx-auto flex flex-col gap-4 h-full min-h-0 min-w-0 px-4 sm:px-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
};
