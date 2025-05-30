import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '../../../../../../components/ui/loading-skeleton';
import { Card, CardContent } from '@/components/ui/card';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function LoadingSkeletonPreviewPage() {
  const componentMeta = {
    name: 'LoadingSkeleton',
    description:
      'A placeholder loading component that displays animated skeleton shapes using the base Skeleton primitive.',
    category: 'atom',
    subcategory: 'loading',
    renderType: 'client',
    author: 'Shadcn (adapted)',
    since: '2023-03-01',
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

          {/* Example 1: Variants */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Variants</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Text (Default)</p>
                <LoadingSkeleton />
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <p className="text-sm font-medium text-muted-foreground">Circle</p>
                <LoadingSkeleton variant="circle" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Rectangle</p>
                <LoadingSkeleton variant="rect" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Card</p>
                <LoadingSkeleton variant="card" />
              </div>
            </div>
          </div>

          {/* Example 2: Count and Gap */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Multiple Items (Count & Gap)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Use `count` to render multiple skeletons vertically, spaced by `gap`.
            </p>
            <LoadingSkeleton variant="text" count={3} gap="0.75rem" />
          </div>

          {/* Example 3: Custom Dimensions and Radius */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Custom Dimensions & Radius</h3>
            <div className="flex flex-wrap gap-6 items-center">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Custom W/H</p>
                <LoadingSkeleton width={100} height={50} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Tailwind Width</p>
                <LoadingSkeleton width="w-64" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Custom Radius</p>
                <LoadingSkeleton variant="rect" radius="rounded-xl" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Full Width</p>
                <LoadingSkeleton variant="text" fullWidth={true} />
              </div>
            </div>
          </div>

          {/* Example 4: Use Case - Profile Card Loading */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Use Case: Profile Card</h3>
            <Card className="w-[300px]">
              <CardContent className="p-4 flex items-center space-x-4">
                <LoadingSkeleton variant="circle" height={48} width={48} />
                <div className="space-y-2 flex-grow">
                  <LoadingSkeleton variant="text" width="w-3/4" />
                  <LoadingSkeleton variant="text" width="w-1/2" height={12} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>
    </div>
  );
}
