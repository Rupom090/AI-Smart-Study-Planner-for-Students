import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({ 
  variant = 'text', 
  width, 
  height, 
  count = 1,
  className = '' 
}: LoadingSkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-md';
      case 'card':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getDefaultSize = () => {
    switch (variant) {
      case 'circular':
        return { width: width || 'w-12', height: height || 'h-12' };
      case 'rectangular':
        return { width: width || 'w-full', height: height || 'h-32' };
      case 'card':
        return { width: width || 'w-full', height: height || 'h-64' };
      case 'text':
      default:
        return { width: width || 'w-full', height: height || 'h-4' };
    }
  };

  const size = getDefaultSize();
  const skeletonClasses = `${size.width} ${size.height} ${getVariantClasses()} bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`;

  if (variant === 'card') {
    return (
      <div className={skeletonClasses}>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} />
      ))}
    </>
  );
}
