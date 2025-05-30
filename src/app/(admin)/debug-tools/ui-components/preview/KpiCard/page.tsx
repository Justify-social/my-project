import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/ui/card-kpi';

// Sample data for chart within KpiCard (UNUSED)
// const sampleTrendData = [
//   { value: 10 },
//   { value: 20 },
//   { value: 15 },
//   { value: 25 },
//   { value: 30 },
//   { value: 28 },
//   { value: 40 },
// ];
// const negativeTrendData = [
//   { value: 50 },
//   { value: 45 },
//   { value: 48 },
//   { value: 40 },
//   { value: 35 },
//   { value: 38 },
//   { value: 30 },
// ];
// const flatTrendData = [
//   { value: 100 },
//   { value: 100 },
//   { value: 100 },
//   { value: 100 },
//   { value: 100 },
//   { value: 100 },
//   { value: 100 },
// ];

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

// Helper function for currency formatting
const formatCurrency = (value: number | string, currencyCode: string = 'USD') => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(numericValue);
};

export default function KpiCardPreviewPage() {
  const componentMeta = {
    name: 'KpiCard',
    description:
      'A card component for displaying key performance indicators with trend visualization.',
    category: 'organism',
    subcategory: 'card',
    renderType: 'server',
    status: 'stable',
    author: 'Your Name/Team',
    since: '2023-07-15',
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ---- ADD YOUR RENDERING EXAMPLES MANUALLY BELOW ---- */}

          {/* Example 1: Positive Trend */}
          <div className="border border-divider rounded-lg p-0">
            <KpiCard
              title="Total Revenue"
              value={45231.89}
              change={20.1}
              changeLabel="from last month"
              formatter={val => formatCurrency(val, 'USD')}
            />
          </div>

          {/* Example 2: Negative Trend */}
          <div className="border border-divider rounded-lg p-0">
            <KpiCard
              title="Subscriptions"
              value={2350}
              change={-12.2}
              changeLabel="from last month"
            />
          </div>

          {/* Example 3: Flat Trend / No Change */}
          <div className="border border-divider rounded-lg p-0">
            <KpiCard title="Active Users" value={9876} change={0} changeLabel="since last hour" />
          </div>

          {/* Example 4: Without Trend Chart */}
          <div className="border border-divider rounded-lg p-0">
            <KpiCard title="Pending Orders" value={102} change={-5} changeLabel="since yesterday" />
          </div>

          {/* Example 5: Currency Formatting */}
          <div className="border border-divider rounded-lg p-0">
            <KpiCard
              title="Average Order Value"
              value={125.5}
              change={5.2}
              changeLabel="from last week"
              formatter={val => formatCurrency(val, 'EUR')}
            />
          </div>

          {/* Example 6: Custom Icon */}
          <div className="border border-divider rounded-lg p-0">
            <KpiCard
              title="Support Tickets"
              value={85}
              change={10}
              changeLabel="today"
              icon="faHeadsetLight"
            />
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>
    </div>
  );
}
