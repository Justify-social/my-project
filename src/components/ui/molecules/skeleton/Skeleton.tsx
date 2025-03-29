import React from 'react';
import { cn } from '@/utils/string/utils';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text' | 'card';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse'
}: SkeletonProps) {
  const animationClass =
  animation === 'pulse' ? 'animate-pulse' :
  animation === 'wave' ? 'animate-shimmer' : '';

  const variantClass =
  variant === 'circular' ? 'rounded-full' :
  variant === 'text' ? 'h-4 rounded w-3/4' :
  variant === 'card' ? 'rounded-lg' : 'rounded';

  const styles: React.CSSProperties = {
    width: width,
    height: height
  };

  return (
    <div
      className={`${cn(
        'bg-gray-200',
        variantClass,
        animationClass,
        className
      )} font-work-sans`}
      style={styles}
      role="status"
      aria-busy="true"
      aria-label="Loading" />);


}

// Predefined skeletons for common use cases
export function TextSkeleton({ className, width = '100%', lines = 1 }: {className?: string;width?: string | number;lines?: number;}) {
  return (
    <div className={`${cn("space-y-2", className)} font-work-sans`}>
      {Array(lines).fill(0).map((_, i) =>
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 && lines > 1 ? '80%' : width}
        className="h-4" />

      )}
    </div>);

}

export function AvatarSkeleton({ size = 'md', className }: {size?: 'sm' | 'md' | 'lg';className?: string;}) {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClass[size], className)} />);


}

export function CardSkeleton({ className }: {className?: string;}) {
  return (
    <div className={`${cn("space-y-3 p-4 border rounded-lg", className)} font-work-sans`}>
      <Skeleton variant="text" className="h-6 w-1/2" />
      <Skeleton variant="text" className="h-4" />
      <Skeleton variant="text" className="h-4" />
      <Skeleton variant="text" className="h-4 w-2/3" />
    </div>);

}

export function TableRowSkeleton({ cols = 4, className }: {cols?: number;className?: string;}) {
  return (
    <div className={`${cn("flex items-center space-x-4", className)} font-work-sans`}>
      {Array(cols).fill(0).map((_, i) =>
      <Skeleton
        key={i}
        variant="text"
        width={`${100 / cols}%`}
        className="h-4" />

      )}
    </div>);

}

// Add shimmer animation to global CSS
const globalStyles = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  position: relative;
  overflow: hidden;
  background-color: #f3f4f6;
}

.animate-shimmer::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
  content: '';
}
`;

export default Skeleton;