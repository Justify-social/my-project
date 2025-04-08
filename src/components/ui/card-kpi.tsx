/**
 * @component KpiCard
 * @category organism
 * @renderType server
 * @description A card component for displaying key performance indicators with trend visualization
 * @since 2023-07-15
 * 
 * @example
 * <KpiCard 
 *   title="Total Revenue"
 *   value="$12,345"
 *   change={15}
 *   changeLabel="vs last period"
 *   icon="dollar-sign"
 * />
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { getIconClasses } from './utils/icon-integration';

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: string;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
  className?: string;
  cardClassName?: string;
  valueClassName?: string;
  titleClassName?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendColor?: {
    up: string;
    down: string;
    neutral: string;
  };
  formatter?: (value: string | number) => string;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel = 'vs last period',
  subtitle,
  className,
  cardClassName,
  valueClassName,
  titleClassName,
  trend,
  trendColor = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  },
  formatter = (val) => String(val),
  onClick
}) => {
  // Determine trend direction if not explicitly provided
  const determinedTrend = trend || (
    change === 0 ? 'neutral' : 
    change && change > 0 ? 'up' : 'down'
  );
  
  // Get appropriate trend icon
  const trendIcon = determinedTrend === 'up' ? 'arrow-up' : 
                    determinedTrend === 'down' ? 'arrow-down' : 
                    'minus';
  
  // Get trend color based on direction
  const trendColorClass = determinedTrend === 'up' ? trendColor.up : 
                          determinedTrend === 'down' ? trendColor.down : 
                          trendColor.neutral;
  
  // Format the value
  const formattedValue = formatter(value);
  
  return (
    <Card 
      className={cn('p-4 transition-all hover:shadow-md', 
        onClick && 'cursor-pointer', 
        cardClassName
      )}
      onClick={onClick}
    >
      <div className={cn('flex flex-col space-y-2', className)}>
        <div className="flex justify-between items-start">
          <h3 className={cn('text-sm font-medium text-gray-500 dark:text-gray-400', titleClassName)}>
            {title}
          </h3>
          {icon && (
            <div className="p-2 bg-primary/10 rounded-full">
              <i className={cn(getIconClasses(icon), 'text-primary')}></i>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-1">
          <span className={cn('text-2xl font-bold', valueClassName)}>
            {formattedValue}
          </span>
          
          {subtitle && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </span>
          )}
        </div>
        
        {typeof change !== 'undefined' && (
          <div className="flex items-center space-x-1 mt-2">
            <i className={cn(getIconClasses(trendIcon), trendColorClass)}></i>
            <span className={cn('text-sm font-medium', trendColorClass)}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            {changeLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default KpiCard; 