import React from 'react';
import { cn } from '@/utils/string/utils';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns at the default (smallest) breakpoint
   * @default 1
   */
  cols?: GridColumns;

  /**
   * Number of columns at the sm breakpoint (640px)
   */
  colsSm?: GridColumns;

  /**
   * Number of columns at the md breakpoint (768px)
   */
  colsMd?: GridColumns;

  /**
   * Number of columns at the lg breakpoint (1024px)
   */
  colsLg?: GridColumns;

  /**
   * Number of columns at the xl breakpoint (1280px)
   */
  colsXl?: GridColumns;

  /**
   * Gap between grid items
   * @default "md"
   */
  gap?: GridGap;

  /**
   * The grid items
   */
  children: React.ReactNode;
}

/**
 * Grid component for creating responsive grid layouts
 * 
 * @example
 * ```tsx
 * // Default (1 column)
 * <Grid>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Grid>
 * 
 * // Responsive grid: 1 column on mobile, 2 on small screens, 3 on medium, 4 on large
 * <Grid cols={1} colsSm={2} colsMd={3} colsLg={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 *   <div>Item 4</div>
 * </Grid>
 * 
 * // Custom gap
 * <Grid gap="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Grid>
 * ```
 */
export function Grid({
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  colsXl,
  gap = 'md',
  className,
  children,
  ...props
}: GridProps) {
  // Convert columns to grid-template-columns utility classes
  const getColumnClass = (columns: GridColumns) => `grid-cols-${columns}`;

  // Map gap size to Tailwind's gap utilities
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div
      className={cn(
        'grid',
        getColumnClass(cols),
        colsSm && `sm:${getColumnClass(colsSm)}`,
        colsMd && `md:${getColumnClass(colsMd)}`,
        colsLg && `lg:${getColumnClass(colsLg)}`,
        colsXl && `xl:${getColumnClass(colsXl)}`,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 