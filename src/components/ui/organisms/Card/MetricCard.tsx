"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import { Icon } from "@/components/ui/atoms/icon";

/**
 * MetricCard Component
 * 
 * A specialized card component for displaying metrics and KPIs.
 * Part of the Card component system, adhering to the SSOT design principles.
 */

export interface MetricCardProps {
  /**
   * Title of the metric
   */
  title: string;
  
  /**
   * Value of the metric to display prominently
   */
  value: string | number;
  
  /**
   * Optional description or context
   */
  description?: string;
  
  /**
   * Trend value (positive or negative)
   */
  trend?: number;
  
  /**
   * Icon to display with the metric
   */
  icon?: React.ReactNode;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Any additional props
   */
  [key: string]: any;
}

export const MetricCard = React.forwardRef<
  HTMLDivElement,
  MetricCardProps
>(({ 
  title, 
  value, 
  description, 
  trend, 
  icon, 
  className,
  ...props 
}, ref) => {
  // Determine trend styling
  const trendColor = trend ? (trend > 0 ? 'text-green-500' : 'text-red-500') : '';
  const trendIcon = trend ? (trend > 0 ? 'arrow-up' : 'arrow-down') : null;

  return (
    <Card
      ref={ref}
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-gray-100 p-2 flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="flex items-center mt-1">
            {trend !== undefined && (
              <span className={cn("flex items-center mr-1", trendColor)}>
                {trendIcon && (
                  <Icon 
                    name={trendIcon} 
                    className="mr-1 h-3 w-3" 
                    variant={trend > 0 ? "solid" : "light"}
                  />
                )}
                {Math.abs(trend)}%
              </span>
            )}
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = "MetricCard";

export default MetricCard; 