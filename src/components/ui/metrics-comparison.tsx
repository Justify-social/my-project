/**
 * @component MetricsComparison
 * @category data
 * @subcategory visualization
 * @description Displays a comparison between metrics with visualization
 */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import LineChart from './chart-line';
import { MetricComparisonProps, MetricData } from './types';

/**
 * Component for visualizing and comparing multiple metrics
 */
export function MetricsComparison({
  title,
  description,
  metrics,
  defaultTab,
  className,
}: MetricComparisonProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || metrics[0]?.id || '');

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4 sm:p-6">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-4">
          <TabsList>
            {metrics.map(metric => (
              <TabsTrigger key={metric.id} value={metric.id}>
                {metric.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {metrics.map(metric => (
            <TabsContent key={metric.id} value={metric.id} className="pt-2">
              <LineChart
                data={metric.data}
                xKey={metric.xField || 'date'}
                yKey={metric.yField}
                height={300}
                dateFormat={metric.dateFormat || 'MMM dd'}
              />
              {metric.footnote && (
                <p className="mt-2 text-xs text-gray-500">{metric.footnote}</p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Card>
  );
}

export default MetricsComparison; 