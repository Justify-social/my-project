import React from 'react';
import { cn } from '@/utils/string/utils';
import { HeadingProps, HeadingLevel, HeadingSize } from './types';

/**
 * Heading component for h1-h6 elements
 * 
 * @example
 * ```tsx
 * <Heading level={1}>Page Title</Heading>
 * <Heading level={2} size="xl">Section Title</Heading>
 * <Heading level={3} weight="medium">Subsection Title</Heading>
 * ```
 */
export const Heading = ({
  level = 2,
  size,
  weight = 'semibold',
  truncate = false,
  className,
  children,
  ...props
}: HeadingProps) => {
  // Default size based on heading level
  const defaultSizes: Record<HeadingLevel, HeadingSize> = {
    1: '3xl',
    2: '2xl',
    3: 'xl',
    4: 'lg',
    5: 'md',
    6: 'sm'
  };

  // Size class mapping
  const sizeClasses: Record<HeadingSize, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  // Weight class mapping
  const weightClasses: Record<string, string> = {
    'light': 'font-light',
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold',
    'extrabold': 'font-extrabold'
  };

  const headingSize = size || defaultSizes[level];
  
  // Create the heading element based on level
  switch (level) {
    case 1:
      return (
        <h1
          className={cn(
            sizeClasses[headingSize],
            weightClasses[weight],
            truncate && 'truncate',
            className
          )}
          {...props}
        >
          {children}
        </h1>
      );
    case 2:
      return (
        <h2
          className={cn(
            sizeClasses[headingSize],
            weightClasses[weight],
            truncate && 'truncate',
            className
          )}
          {...props}
        >
          {children}
        </h2>
      );
    case 3:
      return (
        <h3
          className={cn(
            sizeClasses[headingSize],
            weightClasses[weight],
            truncate && 'truncate',
            className
          )}
          {...props}
        >
          {children}
        </h3>
      );
    case 4:
      return (
        <h4
          className={cn(
            sizeClasses[headingSize],
            weightClasses[weight],
            truncate && 'truncate',
            className
          )}
          {...props}
        >
          {children}
        </h4>
      );
    case 5:
      return (
        <h5
          className={cn(
            sizeClasses[headingSize],
            weightClasses[weight],
            truncate && 'truncate',
            className
          )}
          {...props}
        >
          {children}
        </h5>
      );
    case 6:
      return (
        <h6
          className={cn(
            sizeClasses[headingSize],
            weightClasses[weight],
            truncate && 'truncate',
            className
          )}
          {...props}
        >
          {children}
        </h6>
      );
    default:
      return (
        <h2
          className={cn(
            sizeClasses[headingSize],
            weightClasses[weight],
            truncate && 'truncate',
            className
          )}
          {...props}
        >
          {children}
        </h2>
      );
  }
};

export default Heading; 