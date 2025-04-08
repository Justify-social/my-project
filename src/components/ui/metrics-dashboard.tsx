/**
 * @component MetricsDashboard
 * @category data
 * @subcategory visualization
 * @description A responsive dashboard layout for displaying multiple KPIs and metrics in a grid
 * @since 2023-07-15
 * 
 * @example
 * <MetricsDashboard
 *   title="Sales Overview"
 *   metrics={[
 *     { title: "Total Revenue", value: "$12,345", change: 15, icon: "dollar-sign" },
 *     { title: "Orders", value: 148, change: -5, icon: "shopping-cart" },
 *     { title: "Customers", value: 1024, change: 8, icon: "users" }
 *   ]}
 * />
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import CardKpi from './card-kpi';
import { MetricsDashboardProps } from './types';

/**
 * Component for displaying multiple KPI metrics in a responsive dashboard layout
 */
export function MetricsDashboard({
  title,
  description,
  metrics = [],
  className,
  columns = 3,
  children,
}: MetricsDashboardProps) {
  // Get grid columns class based on columns prop
  const getGridClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header section */}
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}
      
      {/* Metrics grid */}
      <div className={cn('grid gap-4', getGridClass())}>
        {metrics.map((metric, index) => (
          <CardKpi
            key={index}
            {...metric}
          />
        ))}
      </div>
      
      {/* Additional content */}
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
}

export default MetricsDashboard; 