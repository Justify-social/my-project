'use client'; // Charts require client component
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  // Import our wrapper component, not direct Recharts
  PieChart as WrappedPieChart,
  PieDataPoint,
} from '@/components/ui/chart-pie';

// Sample Data for Pie Chart
const pieData: PieDataPoint[] = [
  { name: 'Facebook', value: 400 },
  { name: 'Instagram', value: 300 },
  { name: 'TikTok', value: 300 },
  { name: 'YouTube', value: 200 },
  { name: 'Other', value: 150 },
];

// Use brand colors or a compatible palette
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--secondary))',
  'hsl(var(--secondary) / 0.7)',
  'hsl(var(--muted-foreground))',
];

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function PieChartPreviewPage() {
  const componentMeta = {
    name: 'PieChart', // Use Component Name
    description: 'A responsive pie chart component for visualizing proportional data.',
    category: 'organism',
    subcategory: 'chart', // Updated subcategory
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

          {/* Example 1: Basic Pie Chart using Wrapper */}
          <div className="border border-divider rounded-lg p-6 bg-card shadow-sm">
            <h3 className="text-lg font-medium mb-3">Platform Spend Distribution (Pie)</h3>
            <div className="h-[350px]">
              <WrappedPieChart
                data={pieData}
                nameKey="name"
                dataKey="value"
                colors={COLORS} // Pass custom colors
                title="Spend Overview"
              />
            </div>
          </div>

          {/* Example 2: Donut Chart using Wrapper */}
          <div className="border border-divider rounded-lg p-6 bg-card shadow-sm">
            <h3 className="text-lg font-medium mb-3">User Sources (Donut)</h3>
            <div className="h-[350px]">
              <WrappedPieChart
                data={pieData.map(d => ({ ...d, value: Number(d.value) * 2.5 }))} // Ensure value is number before multiplying
                nameKey="name"
                dataKey="value"
                innerRadius="60%" // Use percentage for better responsiveness
                colors={COLORS.slice().reverse()} // Reverse colors
              />
            </div>
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>

      {/* Code Snippets Section - Removed */}
      {/* {examples && examples.length > 0 && ( ... )} */}
    </div>
  );
}
