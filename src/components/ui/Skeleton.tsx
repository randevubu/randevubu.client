import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangle' | 'circle' | 'text' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base Skeleton component for loading states
 *
 * @example
 * // Simple rectangle
 * <Skeleton className="w-full h-12" />
 *
 * @example
 * // Circle for avatars
 * <Skeleton variant="circle" className="w-16 h-16" />
 *
 * @example
 * // Text line
 * <Skeleton variant="text" className="w-3/4 h-4" />
 *
 * @example
 * // Rounded card
 * <Skeleton variant="rounded" className="w-full h-48" />
 *
 * @example
 * // Custom size with inline styles
 * <Skeleton width={200} height={100} />
 *
 * @example
 * // Wave animation
 * <Skeleton animation="wave" className="w-full h-12" />
 */
export default function Skeleton({
  className = '',
  variant = 'rectangle',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    rectangle: 'rounded',
    circle: 'rounded-full',
    text: 'rounded',
    rounded: 'rounded-2xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const baseClasses = 'bg-gray-200';
  const variantClass = variantClasses[variant] || variantClasses.rectangle;
  const animationClass = animationClasses[animation] || animationClasses.pulse;

  const inlineStyles: React.CSSProperties = {};
  if (width) inlineStyles.width = typeof width === 'number' ? `${width}px` : width;
  if (height) inlineStyles.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClass} ${animationClass} ${className}`}
      style={inlineStyles}
    />
  );
}

/**
 * Skeleton variant for text lines
 */
export function SkeletonText({
  lines = 1,
  className = '',
  lastLineWidth = '75%',
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={`h-4 ${index === lines - 1 ? '' : 'w-full'}`}
          width={index === lines - 1 ? lastLineWidth : undefined}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton variant for cards
 */
export function SkeletonCard({
  className = '',
  hasImage = false,
  imageHeight = '12rem',
}: {
  className?: string;
  hasImage?: boolean;
  imageHeight?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
      {hasImage && (
        <Skeleton
          variant="rounded"
          className="w-full mb-4"
          height={imageHeight}
        />
      )}
      <Skeleton className="h-6 w-3/4 mb-3" />
      <SkeletonText lines={3} />
      <Skeleton className="h-10 w-full mt-4" variant="rounded" />
    </div>
  );
}

/**
 * Skeleton variant for list items
 */
export function SkeletonListItem({
  className = '',
  hasAvatar = false,
}: {
  className?: string;
  hasAvatar?: boolean;
}) {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {hasAvatar && (
        <Skeleton variant="circle" className="w-12 h-12 flex-shrink-0" />
      )}
      <div className="flex-1">
        <Skeleton className="h-5 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/**
 * Skeleton variant for form fields
 */
export function SkeletonFormField({
  className = '',
  hasLabel = true,
}: {
  className?: string;
  hasLabel?: boolean;
}) {
  return (
    <div className={className}>
      {hasLabel && <Skeleton className="h-4 w-24 mb-2" />}
      <Skeleton variant="rounded" className="h-12 w-full" />
    </div>
  );
}

/**
 * Skeleton variant for buttons
 */
export function SkeletonButton({
  className = '',
  size = 'medium',
}: {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}) {
  const sizeClasses = {
    small: 'h-8 w-20',
    medium: 'h-10 w-28',
    large: 'h-12 w-36',
  };

  return (
    <Skeleton
      variant="rounded"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}
