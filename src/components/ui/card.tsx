import React from 'react';
import { cn } from '@/lib/utils';

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

  // Add user's custom className
  if (className) {
    cardClasses += ` ${className}`;
  }

  return (
    <div className={`${cardClasses} font-work-sans`} {...props}>
      {children}
    </div>);

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
  let headerClasses = 'px-6 py-4 border-b border-gray-200 flex items-center justify-between';

  if (className) {
    headerClasses += ` ${className}`;
  }

  return (
    <div className={`${headerClasses} font-sora`} {...props}>
      <div className="flex items-center font-work-sans">
        {icon &&
        <div className="mr-3 flex-shrink-0 font-work-sans">
            {icon}
          </div>
        }
        <div className="font-work-sans">{children}</div>
      </div>
      
      {actions &&
      <div className="flex items-center space-x-2 ml-4 font-work-sans">
          {actions}
        </div>
      }
    </div>);

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
  let contentClasses = withPadding ? 'px-6 py-4' : '';

  if (className) {
    contentClasses += ` ${className}`;
  }

  return (
    <div className={`${contentClasses} font-work-sans`} {...props}>
      {children}
    </div>);

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
  // Build classes
  let footerClasses = 'px-6 py-4 flex items-center';

  // Add border if enabled
  if (withBorder) {
    footerClasses += ' border-t border-gray-200';
  }

  // Add alignment class
  if (align === 'left') {
    footerClasses += ' justify-start';
  } else if (align === 'center') {
    footerClasses += ' justify-center';
  } else if (align === 'right') {
    footerClasses += ' justify-end';
  } else if (align === 'between') {
    footerClasses += ' justify-between';
  }

  // Add user's custom className
  if (className) {
    footerClasses += ` ${className}`;
  }

  return (
    <div className={`${footerClasses} font-work-sans`} {...props}>
      {children}
    </div>);

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
 * Specialized card for displaying metrics or statistics
 * 
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total Users"
 *   value={1234}
 *   description="+12% from last month"
 *   icon={<Icon name="user" className="w-5 h-5" />}
 *   trend={12}
 * />
 * ```
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
  const trendColor = trend === undefined ?
  '' :
  trend >= 0 ?
  'text-green-600' :
  'text-red-600';

  const metricCardClasses = `bg-white rounded-lg border border-gray-200 overflow-hidden ${className || ''}`;

  return (
    <div className={`${metricCardClasses} font-work-sans`} {...props}>
      <div className="px-6 py-4 font-work-sans">
        <div className="flex items-start justify-between font-work-sans">
          <div className="font-work-sans">
            <h3 className="text-sm font-medium text-gray-500 mb-1 font-sora">{title}</h3>
            <div className="text-2xl font-semibold font-work-sans">{value}</div>
            
            {description &&
            <div className={`text-sm mt-1 ${trendColor} font-work-sans`}>
                {description}
              </div>
            }
          </div>
          
          {icon &&
          <div className="p-2 bg-[var(--accent-color)] bg-opacity-10 rounded-lg font-work-sans">
              {icon}
            </div>
          }
        </div>
      </div>
    </div>);

}

export default Card;