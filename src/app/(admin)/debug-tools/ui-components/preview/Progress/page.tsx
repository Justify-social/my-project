'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '../../../../../../components/ui/progress';
// import { Button } from '../../../../../../components/ui/button'; // Unused

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function ProgressPreviewPage() {
  const componentMeta = {
    name: 'Progress',
    description: 'Displays an indicator showing the completion progress of a task.',
    category: 'atom',
    subcategory: 'feedback',
    renderType: 'client',
    author: 'Shadcn',
    since: '2023-01-01',
    status: 'stable',
  };
  // const examples: string[] = []; // Unused

  const [progressValue, setProgressValue] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(prev => (prev >= 90 ? 10 : prev + 10)), 800);
    return () => clearTimeout(timer);
  }, [progressValue]);

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

          {/* Example 1: Different Values */}
          <div className="border border-divider rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium mb-4">Progress Values</h3>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Progress: 0%</p>
              <Progress value={0} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Progress: 33%</p>
              <Progress value={33} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Progress: 66%</p>
              <Progress value={66} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Progress: 100%</p>
              <Progress value={100} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Progress: Indeterminate (value omitted)
              </p>
              <Progress />
            </div>
          </div>

          {/* Example 2: Dynamic Update */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Dynamic Progress Update</h3>
            <p className="text-sm text-muted-foreground mb-3">Progress updates every second.</p>
            <Progress value={progressValue} className="w-[60%] mb-4" />
            <div className="text-center text-sm">Current value: {progressValue}%</div>
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>
    </div>
  );
}
