'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
  priority?: boolean;
}

/**
 * Optimized image component with fallback support
 * Uses Next.js Image component for automatic optimization
 */
export const OptimizedImage = ({
  src,
  alt,
  width = 40,
  height = 40,
  className = '',
  fallback,
  priority = false,
}: OptimizedImageProps) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (error || !src) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={() => setError(true)}
        onLoad={() => setIsLoading(false)}
        priority={priority}
        unoptimized={src.startsWith('data:') || src.includes('localhost')}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  );
};
