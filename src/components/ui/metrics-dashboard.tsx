/**
 * @component MetricsDashboard
 * @category organism
 * @subcategory visualization
 * @description A responsive dashboard layout for displaying multiple KPIs and metrics in a grid.
 * @status 10th April
 * @since 2023-07-15
 * @param {MetricsDashboardProps} props - The props for the MetricsDashboard component.
 * @param {string} [props.title] - Optional title displayed above the grid.
 * @param {string} [props.description] - Optional description displayed below the title.
 * @param {KpiCardProps[]} [props.metrics=[]] - An array of KpiCardProps objects to display in the grid.
 * @param {string} [props.className] - Additional CSS classes for the main container div.
 * @param {1 | 2 | 3 | 4} [props.columns=3] - The number of columns for the grid layout (responsive).
 * @param {React.ReactNode} [props.children] - Optional additional content to render below the grid.
 * @returns {React.ReactElement} The rendered metrics dashboard layout.
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
// Use named imports now
import { KpiCard, KpiCardProps } from './card-kpi';
// import { MetricsDashboardProps } from './types'; // Removed import

// Define MetricsDashboardProps locally using imported KpiCardProps
export interface MetricsDashboardProps {
  title?: string;
  description?: string;
  metrics?: KpiCardProps[]; // Use the imported KpiCardProps
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  children?: React.ReactNode;
}

/**
 * Component for displaying multiple KPI metrics in a responsive dashboard layout
 */
export function MetricsDashboard({
  // Changed export default to export
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
        // Default to 3 columns if invalid number provided
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header section */}
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2> // Use theme color
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p> // Use theme color
          )}
        </div>
      )}
      {/* Metrics grid */}
      {Array.isArray(metrics) && metrics.length > 0 ? (
        <div className={cn('grid gap-4', getGridClass())}>
          {metrics.map((metric, index) => (
            <KpiCard key={index} {...metric} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No metrics to display.</p> // Handle empty state
      )}
      {/* Additional content */}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

// Removed export default MetricsDashboard;
