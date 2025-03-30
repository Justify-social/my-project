import React from 'react';
import { cn } from '@/utils/string/utils';

export type StackDirection = 'horizontal' | 'vertical';
export type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlignment = 'start' | 'center' | 'end' | 'stretch';
export type StackDistribution = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Direction of the stack
   * @default "vertical"
   */
  direction?: StackDirection;

  /**
   * Spacing between items
   * @default "md"
   */
  spacing?: StackSpacing;

  /**
   * Cross-axis alignment
   * @default "start"
   */
  align?: StackAlignment;

  /**
   * Main-axis distribution
   * @default "start"
   */
  justify?: StackDistribution;

  /**
   * Whether to fill available width
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Responsive direction change at breakpoint
   * If provided, stack will become vertical below this breakpoint
   */
  responsive?: boolean;

  /**
   * Stack children
   */
  children: React.ReactNode;
}

/**
 * Stack component for arranging elements vertically or horizontally with consistent spacing
 * 
 * @example
 * ```tsx
 * // Vertical stack (default)
 * <Stack>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * 
 * // Horizontal stack
 * <Stack direction="horizontal">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * 
 * // With custom spacing
 * <Stack spacing="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * 
 * // With alignment
 * <Stack align="center" justify="between">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * 
 * // Responsive stack (horizontal on desktop, vertical on mobile)
 * <Stack direction="horizontal" responsive>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * ```
 */
export function Stack({
  direction = 'vertical',
  spacing = 'md',
  align = 'start',
  justify = 'start',
  fullWidth = true,
  responsive = false,
  className,
  children,
  ...props
}: StackProps) {
  // Map spacing to Tailwind's gap utilities
  const spacingClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  // Map alignment to Tailwind's alignment utilities
  const alignmentClasses = {
    start: direction === 'vertical' ? 'items-start' : 'items-start',
    center: direction === 'vertical' ? 'items-center' : 'items-center',
    end: direction === 'vertical' ? 'items-end' : 'items-end',
    stretch: direction === 'vertical' ? 'items-stretch' : 'items-stretch'
  };

  // Map distribution to Tailwind's justify utilities
  const justifyClasses = {
    start: direction === 'vertical' ? 'justify-start' : 'justify-start',
    center: direction === 'vertical' ? 'justify-center' : 'justify-center',
    end: direction === 'vertical' ? 'justify-end' : 'justify-end',
    between: direction === 'vertical' ? 'justify-between' : 'justify-between',
    around: direction === 'vertical' ? 'justify-around' : 'justify-around',
    evenly: direction === 'vertical' ? 'justify-evenly' : 'justify-evenly'
  };

  return (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        responsive && direction === 'horizontal' && 'flex-col sm:flex-row',
        spacingClasses[spacing],
        alignmentClasses[align],
        justifyClasses[justify],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 
/**
 * Default export for Stack
 */
export default Stack;
