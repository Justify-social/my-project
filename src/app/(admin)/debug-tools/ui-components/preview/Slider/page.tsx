'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Slider } from '../../../../../../components/ui/slider';
// import { Label } from '@/components/ui/label'; // Unused import

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function SliderPreviewPage() {
  const componentMeta = {
    name: 'Slider',
    description: 'An input where the user selects a value from within a given range.',
    category: 'atom',
    subcategory: 'input',
    renderType: 'client',
    author: 'Shadcn',
    since: '2023-01-01',
    status: 'stable',
  };
  // const examples: string[] = []; // Unused variable

  // State for controlled slider example
  const [sliderValue, setSliderValue] = useState([50]); // Default to 50

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

          {/* Example 1: Basic Slider */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Basic Slider</h3>
            <p className="text-sm text-muted-foreground mb-3">Default range is 0-100, step is 1.</p>
            <Slider defaultValue={[33]} max={100} step={1} className={cn('w-[60%]')} />
          </div>

          {/* Example 2: Controlled Slider */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Controlled Slider with Value Display</h3>
            <p className="text-sm text-muted-foreground mb-3">
              The slider value is controlled by component state.
            </p>
            <Slider
              value={sliderValue} // Controlled value
              onValueChange={setSliderValue} // Update state on change
              max={100}
              step={1}
              className={cn('w-[60%]')}
            />
            <div className="mt-4 text-center text-sm">
              Current Value: <span className="font-semibold">{sliderValue[0]}</span>
            </div>
          </div>

          {/* Example 3: Disabled Slider */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Disabled Slider</h3>
            <Slider defaultValue={[75]} max={100} step={1} disabled className={cn('w-[60%]')} />
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>

      {/* Code Snippets Section */}
      {/* {examples && examples.length > 0 && ( ... )} */}
    </div>
  );
}
