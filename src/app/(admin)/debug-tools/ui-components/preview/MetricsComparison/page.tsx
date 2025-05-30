'use client'; // Tabs and Charts need client
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MetricsComparison, MetricData } from '@/components/ui/metrics-comparison'; // Import component and type

// Sample Data for Metrics Comparison
const generateMetricData = (factor: number) => {
  const data = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(2023, i, 1);
    // Add multiple value keys for multi-line chart example
    data.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      current: Math.floor(Math.random() * factor * 100 + 50 * factor),
      previous: Math.floor(Math.random() * factor * 80 + 40 * factor), // Example previous period data
      average: Math.floor(Math.random() * factor * 90 + 45 * factor), // Example average data
    });
  }
  return data;
};

// Structure data as an array of MetricData objects
const metrics: MetricData[] = [
  {
    id: 'impressions',
    name: 'Impressions',
    data: generateMetricData(5),
    xField: 'date',
    yField: ['current', 'previous', 'average'], // Multiple lines
    dateFormat: 'MMM yyyy',
    footnote: 'Comparison of impression data over the last year.',
  },
  {
    id: 'clicks',
    name: 'Clicks',
    data: generateMetricData(1),
    xField: 'date',
    yField: 'current', // Single line
    dateFormat: 'MMM yyyy',
  },
  {
    id: 'ctr',
    name: 'CTR',
    data: generateMetricData(0.2),
    xField: 'date',
    yField: ['current', 'average'], // Two lines
    dateFormat: 'MMM yyyy',
    footnote: 'Click-Through Rate comparison.',
  },
];

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function MetricsComparisonPreviewPage() {
  const componentMeta = {
    name: 'MetricsComparison',
    description: 'Displays a comparison between multiple metrics using tabs and line charts.',
    category: 'organism',
    subcategory: 'visualization',
    renderType: 'client',
    status: 'stable', // Added status
    author: 'Your Name/Team', // Added author
    since: '2024-03-01', // Added since date (example)
  };
  // const examples: string[] = []; // Removed examples array

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-secondary">
        <ol className="list-none p-0 inline-flex space-x-2">
          <li className="flex items-center">
            <Link href="/debug-tools/ui-components" className="hover:text-Interactive">
              UI Components
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="capitalize">{componentMeta.category}</span>
          </li>
          {componentMeta.subcategory && (
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="capitalize">{componentMeta.subcategory}</span>
            </li>
          )}
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="font-medium text-primary">{componentMeta.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="mb-8 border-b border-divider pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-primary mb-2 sm:mb-0">{componentMeta.name}</h1>
          <div className="flex items-center space-x-3 text-sm">
            {componentMeta.status && (
              <Badge
                variant="outline"
                className={cn(
                  'font-medium',
                  statusStyles[componentMeta.status] || statusStyles.development
                )}
              >
                {componentMeta.status}
              </Badge>
            )}
            <span className="text-secondary capitalize">({componentMeta.renderType || 'N/A'})</span>
          </div>
        </div>
        {componentMeta.description && (
          <p className="mt-2 text-secondary max-w-3xl">{componentMeta.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          {componentMeta.author && <span>Author: {componentMeta.author}</span>}
          {componentMeta.since && <span>Since: {componentMeta.since}</span>}
        </div>
      </div>

      {/* Examples Section (Rendering the actual component) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Examples / Usage</h2>
        <div className="space-y-6">
          {/* ---- ADD YOUR RENDERING EXAMPLES MANUALLY BELOW ---- */}

          {/* Example 1: Basic Metrics Comparison */}
          <div className="border border-divider rounded-lg p-0">
            {' '}
            {/* Remove padding */}
            <MetricsComparison
              title="Campaign Performance Overview" // Optional title
              description="Comparing key metrics for the selected period."
              metrics={metrics} // Pass the structured array
              defaultTab="clicks" // Optionally set a default tab
            />
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>

      {/* Code Snippets Section - Removed */}
      {/* {examples && examples.length > 0 && ( ... )} */}
    </div>
  );
}
