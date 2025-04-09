/**
 * @component NotificationSonner
 * @category atom
 * @subcategory toast
 * @description A toast notification system using Sonner
 */
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import { cn } from '@/lib/utils';

export interface NotificationSonnerProps {
  /** Container position */
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  /** Whether to show multiple notifications stacked or one at a time */
  multipleNotifications?: boolean;
  /** Animation style for custom CSS */
  animation?: 'slide' | 'fade' | 'zoom' | 'bounce';
  /** Custom offset from edge */
  offset?: number | string;
  /** Gap between notifications */
  gapBetween?: number;
  /** Expand notification width to container width */
  expand?: boolean;
  /** Duration in milliseconds before notifications auto-dismiss */
  duration?: number;
  /** Whether to close notifications when clicked */
  closeButton?: boolean;
  /** Rich color theme for notifications */
  richColors?: boolean;
  /** Custom class name for toast container */
  className?: string;
  /** Custom class name for toasts */
  toastClassName?: string;
}

/**
 * A toast notification system using Sonner.
 * This component should be placed at the root of your application.
 * 
 * Usage:
 * ```tsx
 * // In your layout or root component
 * <NotificationSonner />
 * 
 * // To show a notification from anywhere in your app
 * import { toast } from 'sonner';
 * 
 * toast('Hello World');
 * toast.success('Successfully saved!');
 * toast.error('Something went wrong');
 * ```
 */
export function NotificationSonner({
  position = 'bottom-right',
  multipleNotifications = true,
  animation = 'slide',
  offset = '1.5rem',
  gapBetween = 8,
  expand = false,
  duration = 4000,
  closeButton = true,
  richColors = false,
  className,
  toastClassName,
  ...props
}: NotificationSonnerProps) {
  const { theme } = useTheme();

  // Generate appropriate animation classes based on the animation prop
  const getAnimationClass = () => {
    switch (animation) {
      case 'fade':
        return 'animate-in fade-in-50 duration-300';
      case 'zoom':
        return 'animate-in zoom-in-50 duration-300';
      case 'bounce':
        return 'animate-in slide-in-from-bottom-3 duration-300';
      case 'slide':
      default:
        return 'animate-in slide-in-from-bottom-2 duration-300';
    }
  };

  return (
    <Sonner
      // Theme handling
      theme={theme as 'light' | 'dark' | 'system'}
      // Position and layout
      position={position}
      expand={expand}
      offset={offset}
      gap={gapBetween}
      // Animation and behavior
      closeButton={closeButton}
      richColors={richColors}
      duration={duration}
      visibleToasts={multipleNotifications ? undefined : 1}
      // Styling
      toastOptions={{
        className: cn(
          'border-border bg-background text-foreground',
          getAnimationClass(),
          toastClassName
        ),
      }}
      className={className}
      {...props}
    />
  );
}

export default NotificationSonner; 