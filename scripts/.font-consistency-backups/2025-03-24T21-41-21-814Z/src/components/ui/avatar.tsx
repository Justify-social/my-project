import React from 'react';
import { cn } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  bordered?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusClasses = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

export function Avatar({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className,
  status,
  bordered = false,
}: AvatarProps) {
  const sizeClass = sizeClasses[size];
  
  // Generate initials from alt text if not provided
  const fallbackInitials = initials || (alt && alt !== 'Avatar' 
    ? alt
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '');

  return (
    <div className="relative inline-block">
      <div 
        className={cn(
          'rounded-full flex items-center justify-center overflow-hidden',
          sizeClass,
          bordered && 'border-2 border-white ring-2 ring-gray-200',
          className
        )}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#3182CE] flex items-center justify-center text-white font-medium">
            {fallbackInitials}
          </div>
        )}
      </div>
      
      {status && (
        <span 
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            statusClasses[status],
            size === 'xs' ? 'w-1.5 h-1.5' : 
            size === 'sm' ? 'w-2 h-2' : 
            size === 'md' ? 'w-2.5 h-2.5' : 
            size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          )}
        />
      )}
    </div>
  );
}

export default Avatar; 