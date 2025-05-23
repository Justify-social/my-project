'use client'; // Child components might need client
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MetricsDashboard } from '@/components/ui/metrics-dashboard'; // Import component
import { KpiCard } from '@/components/ui/card-kpi'; // Import KpiCard for example
// Import other potential dashboard components if needed
// import { LineChart } from '@/components/ui/chart-line';

// Helper function for currency formatting
const formatCurrency = (value: string | number, currency = 'USD') => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value); // Return original if not a number
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0, // Adjust as needed
    maximumFractionDigits: 0, // Adjust as needed
  }).format(numValue);
};

// Sample data for KpiCards
const kpiData = [
  {
    title: 'Total Revenue',
    value: 45231.89,
    change: 20.1,
    formatter: (val: string | number) => formatCurrency(val, 'USD'),
    icon: 'faDollarSignLight',
  },
  { title: 'Subscriptions', value: 2350, change: -12.2, icon: 'faUserLight' },
  {
    title: 'Sales',
    value: 12345,
    change: 5.5,
    formatter: (val: string | number) => formatCurrency(val, 'USD'),
  },
  { title: 'Active Users', value: 987, change: 0, icon: 'faUserLight' },
];

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function MetricsDashboardPreviewPage() {
  const componentMeta = {
    name: 'MetricsDashboard',
    description:
      'A responsive dashboard layout for displaying multiple KPIs and metrics in a grid.',
    category: 'organism',
    subcategory: 'layout', // Changed subcategory to layout
    renderType: 'client',
    status: 'stable', // Added status
    author: 'Your Name/Team', // Added author
    since: '2023-07-15',
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

          {/* Example 1: Basic Dashboard with KpiCards */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">KPI Dashboard Example</h3>
            <MetricsDashboard>
              {/* Map over sample data to render KpiCards */}
              {kpiData.map((kpi, index) => (
                <KpiCard
                  key={index}
                  title={kpi.title}
                  value={kpi.value}
                  change={kpi.change}
                  formatter={kpi.formatter}
                  icon={kpi.icon}
                />
              ))}
              {/* You could add other components like charts here */}
              {/* <div className="md:col-span-2 lg:col-span-3"> Add a chart spanning multiple columns </div> */}
            </MetricsDashboard>
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>

      {/* Code Snippets Section - Removed */}
      {/* {examples && examples.length > 0 && ( ... )} */}
    </div>
  );
}
