/**
 * @component MetricsComparison
 * @category organism
 * @subcategory visualization
 * @description Displays a comparison between multiple metrics using tabs and line charts.
 * @status 10th April
 * @param {MetricComparisonProps} props - The props for the MetricsComparison component.
 * @param {string} [props.title] - Optional title displayed at the top of the card.
 * @param {string} [props.description] - Optional description displayed below the title.
 * @param {MetricData[]} props.metrics - An array of metric objects to display.
 * @param {string} [props.defaultTab] - The ID of the metric to display by default.
 * @param {string} [props.className] - Additional CSS classes for the Card container.
 * @returns {React.ReactElement} The rendered metrics comparison component.
 */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { LineChart } from './chart-line';

// Define types directly in the file as a workaround

// Add this interface definition
export interface LineData {
  dataKey: string;
  name?: string;
  stroke?: string;
}

// Define a more specific type for chart data points
interface DataPoint {
  [key: string]: string | number;
}

export interface MetricData {
  id: string;
  name: string;
  data: DataPoint[]; // Changed any[] to DataPoint[]
  xField?: string; // Key for x-axis data
  yField: string | string[]; // Key(s) for y-axis data
  dateFormat?: string; // Date format for LineChart
  footnote?: string;
}

export interface MetricComparisonProps {
  title?: string;
  description?: string;
  metrics: MetricData[];
  defaultTab?: string;
  className?: string;
}

/**
 * Component for visualizing and comparing multiple metrics using tabs and line charts.
 */
export function MetricsComparison({
  title,
  description,
  metrics,
  defaultTab,
  className,
}: MetricComparisonProps) {
  // Ensure metrics is an array before accessing index 0
  const initialTab =
    defaultTab || (Array.isArray(metrics) && metrics.length > 0 ? metrics[0].id : '');
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Ensure metrics is always an array to prevent runtime errors on map
  const validMetrics = Array.isArray(metrics) ? metrics : [];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-4 sm:p-6">
        {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}

        {validMetrics.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-4">
            <TabsList>
              {validMetrics.map(metric => (
                <TabsTrigger key={metric.id} value={metric.id}>
                  {metric.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {validMetrics.map(metric => {
              // Create lines config based on whether yField is string or array
              const chartLines: LineData[] = Array.isArray(metric.yField)
                ? metric.yField.map(key => ({ dataKey: key }))
                : [{ dataKey: metric.yField }];

              return (
                <TabsContent key={metric.id} value={metric.id} className="pt-2">
                  <LineChart
                    data={metric.data}
                    xField={metric.xField || 'date'}
                    lines={chartLines}
                    height={300}
                    dateFormat={metric.dateFormat || 'MMM dd'}
                  />
                  {metric.footnote && (
                    <p className="mt-2 text-xs text-muted-foreground">{metric.footnote}</p>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">No metrics data available.</p>
        )}
      </div>
    </Card>
  );
}
