'use client';

import Image from 'next/image';
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * OptimizedImage component props
 */
export interface OptimizedImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  /**
   * Image source URL
   */
  src: string;
  
  /**
   * Alternative text for the image (required for accessibility)
   */
  alt: string;
  
  /**
   * Optional width of the image
   * @default undefined - will use layout responsive behavior
   */
  width?: number;
  
  /**
   * Optional height of the image
   * @default undefined - will use layout responsive behavior
   */
  height?: number;
  
  /**
   * Optional CSS classes
   */
  className?: string;
  
  /**
   * Whether to make the image fill its container
   * @default false
   */
  fill?: boolean;
  
  /**
   * Object fit property for the image
   * @default 'cover'
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  
  /**
   * Object position property for the image
   * @default 'center'
   */
  objectPosition?: string;
  
  /**
   * Priority loading for LCP images
   * @default false
   */
  priority?: boolean;
  
  /**
   * Whether to round the corners of the image
   * @default false
   */
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  
  /**
   * Optional border for the image
   * @default false
   */
  border?: boolean;
  
  /**
   * Optional shadow for the image
   * @default false
   */
  shadow?: boolean | 'sm' | 'md' | 'lg';
}

/**
 * OptimizedImage Component
 * 
 * A wrapper around Next.js Image component with enhanced features and styling options.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <OptimizedImage src="/images/hero.jpg" alt="Hero image" width={800} height={600} />
 * 
 * // Responsive image that fills its container
 * <OptimizedImage src="/images/background.jpg" alt="Background" fill priority />
 * 
 * // With styling options
 * <OptimizedImage 
 *   src="/images/profile.jpg" 
 *   alt="User profile" 
 *   width={200} 
 *   height={200} 
 *   rounded="full"
 *   border
 *   shadow="md"
 * />
 * 
 * // With object fit and position
 * <OptimizedImage 
 *   src="/images/landscape.jpg" 
 *   alt="Landscape" 
 *   fill
 *   objectFit="cover" 
 *   objectPosition="bottom"
 * />
 * ```
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  objectFit = 'cover',
  objectPosition = 'center',
  priority = false,
  rounded = false,
  border = false,
  shadow = false,
  style,
  ...rest
}, ref) => {
  // Calculate rounded corner classes
  const roundedClasses = rounded
    ? rounded === true
      ? 'rounded-md' 
      : rounded === 'sm'
        ? 'rounded-sm'
        : rounded === 'md'
          ? 'rounded-md'
          : rounded === 'lg'
            ? 'rounded-lg'
            : rounded === 'full'
              ? 'rounded-full'
              : ''
    : '';
    
  // Calculate shadow classes
  const shadowClasses = shadow
    ? shadow === true
      ? 'shadow'
      : shadow === 'sm'
        ? 'shadow-sm'
        : shadow === 'md'
          ? 'shadow'
          : shadow === 'lg'
            ? 'shadow-lg'
            : ''
    : '';
    
  // Calculate border classes
  const borderClasses = border ? 'border border-divider' : '';
  
  // Combined classes
  const combinedClasses = cn(
    // Base classes
    'max-w-full',
    
    // Styling classes
    roundedClasses,
    shadowClasses,
    borderClasses,
    
    // Custom classes
    className
  );
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
      className={combinedClasses}
      ref={ref}
      style={{
        objectFit,
        objectPosition,
        ...style
      }}
      {...rest}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage; 