import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import { LoadingSpinner } from '../../../../../../components/ui/loading-spinner';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function LoadingSpinnerPreviewPage() {
  const componentMeta = {
    name: 'LoadingSpinner',
    description: 'A customizable loading spinner component for indicating loading states',
    category: 'atom',
    subcategory: 'feedback',
    renderType: 'client',
    author: 'Justify',
    since: '2023-05-15',
    status: 'stable',
  };
  // const examples: string[] = []; // Unused variable

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
        <div className="space-y-8">
          {/* ---- ADD YOUR RENDERING EXAMPLES MANUALLY BELOW ---- */}

          {/* Example 1: Sizes */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Sizes</h3>
            <div className="flex flex-wrap items-center gap-8">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
              <LoadingSpinner size="xl" />
            </div>
          </div>

          {/* Example 2: Colors */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Colors</h3>
            <div className="flex flex-wrap items-center gap-8">
              <LoadingSpinner color="primary" />
              <LoadingSpinner color="secondary" />
              <LoadingSpinner color="success" />
              <LoadingSpinner color="danger" />
              <LoadingSpinner color="warning" />
              <LoadingSpinner color="info" />
            </div>
          </div>

          {/* Example 3: With Label */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">With Label</h3>
            <div className="flex flex-wrap items-center gap-8">
              <LoadingSpinner label="Loading data..." />
              <LoadingSpinner size="lg" color="success" label="Processing payment..." />
            </div>
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>
    </div>
  );
}
