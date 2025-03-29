import React from 'react';
import { Icon } from '@/components/ui/atoms/icons';
import { cn } from '@/utils/string/utils';

// Types for Card variants
export type CardVariant = 'default' | 'interactive' | 'outline' | 'raised';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant style for the card
   * @default "default"
   */
  variant?: CardVariant;

  /**
   * Whether the card should have hover effects
   * @default false
   */
  hoverable?: boolean;

  /**
   * Content to render inside the card
   */
  children: React.ReactNode;
}

/**
 * Card component for grouping related content
 * 
 * @example
 * ```tsx
 * // Basic card
 * <Card>Content</Card>
 * 
 * // Interactive card with hover effects
 * <Card variant="interactive" hoverable>
 *   <CardHeader>
 *     <h3 className="text-lg font-medium">Card Title</h3>
 *   </CardHeader>
 *   <CardContent>
 *     <p>This is the main content of the card.</p>
 *   </CardContent>
 * </Card>
 * ```
 */
export function Card({
  variant = 'default',
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  // Prepare class based on variant
  let cardClasses = '';

  // Base styling for all cards
  cardClasses = 'bg-white rounded-lg';

  // Variant-specific styling
  if (variant === 'default') {
    cardClasses += ' border border-gray-200 shadow-sm';
  } else if (variant === 'interactive') {
    cardClasses += ' border border-[var(--divider-color)] shadow-sm transition-all duration-300';
  } else if (variant === 'outline') {
    cardClasses += ' border border-gray-200';
  } else if (variant === 'raised') {
    cardClasses += ' border border-gray-200 shadow-md';
  }

  // Add hover effects if enabled
  if (hoverable) {
    if (variant === 'default') {
      cardClasses += ' hover:shadow-md hover:border-gray-300';
    } else if (variant === 'interactive') {
      cardClasses += ' hover:shadow-md hover:border-[var(--accent-color)] hover:border-opacity-50';
    } else if (variant === 'outline') {
      cardClasses += ' hover:border-gray-300';
    } else if (variant === 'raised') {
      cardClasses += ' hover:shadow-lg';
    }
  }

  return (
    <div className={cn(cardClasses, className)} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display in the header (component or ReactNode)
   */
  icon?: React.ReactNode;

  /**
   * Actions to display in the header (typically buttons)
   */
  actions?: React.ReactNode;

  /**
   * Content of the header
   */
  children: React.ReactNode;
}

/**
 * Header section for Card
 */
export function CardHeader({
  icon,
  actions,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div 
      className={cn(
        'px-6 py-4 border-b border-gray-200 flex items-center justify-between font-sora',
        className
      )} 
      {...props}
    >
      <div className="flex items-center font-work-sans">
        {icon && (
          <div className="mr-3 flex-shrink-0 font-work-sans">
            {icon}
          </div>
        )}
        <div className="font-work-sans">{children}</div>
      </div>
      
      {actions && (
        <div className="flex items-center space-x-2 ml-4 font-work-sans">
          {actions}
        </div>
      )}
    </div>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to add padding to the content
   * @default true
   */
  withPadding?: boolean;

  /**
   * Content of the card body
   */
  children: React.ReactNode;
}

/**
 * Content section for Card
 */
export function CardContent({
  withPadding = true,
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div 
      className={cn(
        withPadding ? 'px-6 py-4' : '',
        'font-work-sans',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls the alignment of items in the footer
   * @default "right"
   */
  align?: 'left' | 'center' | 'right' | 'between';

  /**
   * Whether to show a border at the top of the footer
   * @default true
   */
  withBorder?: boolean;

  /**
   * Content of the footer
   */
  children: React.ReactNode;
}

/**
 * Footer section for Card
 */
export function CardFooter({
  align = 'right',
  withBorder = true,
  className,
  children,
  ...props
}: CardFooterProps) {
  let alignClass = '';

  if (align === 'left') {
    alignClass = 'justify-start';
  } else if (align === 'center') {
    alignClass = 'justify-center';
  } else if (align === 'right') {
    alignClass = 'justify-end';
  } else if (align === 'between') {
    alignClass = 'justify-between';
  }

  return (
    <div 
      className={cn(
        'px-6 py-4 flex items-center font-work-sans',
        withBorder && 'border-t border-gray-200',
        alignClass,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export interface MetricCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Title of the metric
   */
  title: React.ReactNode;

  /**
   * Primary value to display
   */
  value: React.ReactNode;

  /**
   * Optional secondary/description text
   */
  description?: React.ReactNode;

  /**
   * Optional icon for the card
   */
  icon?: React.ReactNode;

  /**
   * Optional trend indicator (positive or negative)
   */
  trend?: number;
}

/**
 * Specialized card for displaying metrics/KPIs
 */
export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card 
      className={cn('h-full', className)} 
      {...props}
    >
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
            <div className="text-2xl font-semibold">{value}</div>
            
            {description && (
              <div className="mt-1 text-sm text-gray-500">{description}</div>
            )}
            
            {typeof trend === 'number' && (
              <div className={cn(
                "mt-1 text-sm font-medium flex items-center",
                trend > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                <Icon 
                  name={trend > 0 ? 'faArrowUp' : 'faArrowDown'} 
                  className="h-3 w-3 mr-1" 
                  type="static" 
                />
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          
          {icon && (
            <div className="p-2 bg-gray-100 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Card; 