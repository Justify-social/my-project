import React from 'react';
import { cn } from '@/utils/string/utils';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size variant that controls the max-width
   * @default "lg"
   */
  size?: ContainerSize;

  /**
   * Center content of the container (applies mx-auto)
   * @default true
   */
  centered?: boolean;

  /**
   * Control padding for the container
   * @default true
   */
  withPadding?: boolean;

  /**
   * The content to be contained
   */
  children: React.ReactNode;
}

/**
 * Container component for controlling layout width
 * 
 * @example
 * ```tsx
 * // Default (centered with lg width)
 * <Container>Content</Container>
 * 
 * // Small container
 * <Container size="sm">Narrow content</Container>
 * 
 * // Full width container
 * <Container size="full">Full width content</Container>
 * 
 * // Container without padding
 * <Container withPadding={false}>No padding content</Container>
 * ```
 */
export function Container({
  size = 'lg',
  centered = true,
  withPadding = true,
  className,
  children,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full'
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        centered && 'mx-auto',
        withPadding && 'px-4 sm:px-6 md:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 