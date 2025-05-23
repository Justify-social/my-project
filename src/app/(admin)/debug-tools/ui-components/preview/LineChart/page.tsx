'use client'; // Charts require client component
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'; // Updated imports for chart

// Sample Data for Charts
const chartData = [
  { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function LineChartPreviewPage() {
  const componentMeta = {
    name: 'LineChart (Recharts)', // Updated name
    description:
      'Responsive line chart component based on Recharts with support for multiple data series.', // Kept description
    category: 'organism',
    subcategory: 'chart', // Updated subcategory
    renderType: 'client', // Updated renderType
    status: 'stable', // Added status
    author: 'Recharts / Shadcn UI', // Added author
    since: '2023-07-15', // Added since date (example)
  };
  // const examples: string[] = []; // Removed examples array

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
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
              <span className="text-secondary capitalize">
                ({componentMeta.renderType || 'N/A'})
              </span>
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

            {/* Example 1: Basic Line Chart */}
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Basic Line Chart (Two Series)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="pv"
                      stroke="var(--interactive-color)"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="uv" stroke="var(--secondary-color)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Example 2: Single Series Line Chart */}
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Single Series Line Chart</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    {/* <Legend /> // Legend typically hidden for single series */}
                    <Line
                      type="monotone"
                      dataKey="amt"
                      stroke="var(--accent-color)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ---- END MANUAL EXAMPLES ---- */}
          </div>
        </div>

        {/* Code Snippets Section - Removed */}
        {/* {examples && examples.length > 0 && ( ... )} */}
      </div>
    </React.Suspense>
  );
}
