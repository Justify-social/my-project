/**
 * @component KpiCard
 * @category organism
 * @renderType server
 * @description A card component for displaying key performance indicators with trend visualization using standard Card components.
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
// Use standard Card sub-components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  // CardFooter // Not used in this layout yet
} from "@/components/ui/card";
// Use standard Icon component
import { Icon } from "@/components/ui/icon/icon";

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

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel = 'vs last period',
  subtitle,
  className, // className applies to the inner content wrapper now
  cardClassName, // cardClassName applies to the main Card element
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
  // Determine trend direction
  const determinedTrend = trend || (
    change === 0 ? 'neutral' :
      change && change > 0 ? 'up' : 'down'
  );

  // Get appropriate trend icon ID
  const trendIconId = determinedTrend === 'up' ? 'faArrowUp' :
    determinedTrend === 'down' ? 'faArrowDown' :
      'faMinus'; // Assuming FontAwesome IDs

  // Get trend color class
  const trendColorClass = determinedTrend === 'up' ? trendColor.up :
    determinedTrend === 'down' ? trendColor.down :
      trendColor.neutral;

  // Format the value
  const formattedValue = formatter(value);

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer',
        cardClassName // Apply card-specific class name here
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn('text-sm font-medium', titleClassName)}>
          {title}
        </CardTitle>
        {icon && (
          // Optional: Consider consistent styling for icon container if reused
          // <div className="p-2 bg-primary/10 rounded-full">
          <Icon iconId={icon} className="h-4 w-4 text-muted-foreground" /> // Adjusted styling
          // </div>
        )}
      </CardHeader>
      <CardContent className={cn("space-y-1", className)}> {/* Apply general className here */}
        <div className={cn("text-2xl font-bold", valueClassName)}>
          {formattedValue}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
        {typeof change !== 'undefined' && (
          <div className="flex items-center space-x-1 pt-1"> {/* Added pt-1 */}
            <Icon iconId={trendIconId} className={cn("h-4 w-4", trendColorClass)} />
            <span className={cn('text-sm font-medium', trendColorClass)}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            {changeLabel && (
              <span className="text-xs text-muted-foreground ml-1">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
      {/* <CardFooter> // Footer could be used if there are actions
        
      </CardFooter> */}
    </Card>
  );
}; 