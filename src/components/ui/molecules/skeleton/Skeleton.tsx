import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton component for loading states
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional className to apply
   */
  className?: string;
}

/**
 * Skeleton Component
 * 
 * Used to show a placeholder while content is loading
 * 
 * @example
 * ```tsx
 * // Basic skeleton
 * <Skeleton className="h-4 w-32" />
 * 
 * // Skeleton with custom styling
 * <Skeleton className="h-12 w-full rounded-full" />
 * 
 * // Multiple skeletons for a card
 * <div className="space-y-2">
 *   <Skeleton className="h-12 w-12 rounded-full" />
 *   <Skeleton className="h-4 w-40" />
 *   <Skeleton className="h-4 w-32" />
 * </div>
 * ```
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export default Skeleton;