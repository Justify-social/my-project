import React from 'react';
import { cn } from '@/utils/string/utils';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'outline' | 'status';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeStatus = 'live' | 'paused' | 'completed' | 'draft' | 'scheduled';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  status?: BadgeStatus;
  count?: number;
  className?: string;
  rounded?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-[#333333] text-white',
  secondary: 'bg-[#4A5568] text-white',
  accent: 'bg-[#00BFFF] text-white',
  outline: 'bg-transparent border border-gray-300 text-gray-700',
  status: 'font-medium'
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
};

const statusClasses: Record<BadgeStatus, string> = {
  live: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-purple-100 text-purple-800'
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  status,
  count,
  className,
  rounded = false
}: BadgeProps) {
  // If it's a status badge, use the status styling
  const variantClass = variant === 'status' && status ?
  statusClasses[status] :
  variantClasses[variant];

  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`${cn(
        'inline-flex items-center justify-center font-medium',
        variantClass,
        sizeClass,
        rounded ? 'rounded-full' : 'rounded',
        className
      )} font-work-sans`}>

      {children}
      {count !== undefined &&
      <span className="ml-1 bg-white bg-opacity-20 px-1 py-0.5 rounded-full text-xs font-work-sans">
          {count}
        </span>
      }
    </span>);

}

export function StatusBadge({ status, ...props }: Omit<BadgeProps, 'variant'> & {status: BadgeStatus;}) {
  return (
    <Badge variant="status" status={status} {...props} />);

}

export default Badge;