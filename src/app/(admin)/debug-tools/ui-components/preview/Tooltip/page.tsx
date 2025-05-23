import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function TooltipPreviewPage() {
  const componentMeta = {
    name: 'Tooltip',
    description:
      'A popup that displays information related to an element when focused or hovered. Requires TooltipProvider wrapping application or relevant part.',
    category: 'molecule',
    subcategory: 'overlay',
    renderType: 'client',
    status: 'stable',
    author: 'Shadcn UI',
    since: '2023-01-01',
  };

  return (
    <TooltipProvider>
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
            {/* ---- Replace placeholder section below ---- */}
            {/* Example 1: Basic Usage Placeholder
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Basic Usage</h3>
              
              <p className="text-sm text-muted-foreground">(Manually add rendering example for <Tooltip /> here)</p>
            </div>
             Example 2: Add more placeholders or examples as needed 
             ---- END MANUAL EXAMPLES ---- */}

            {/* ---- START NEW EXAMPLES ---- */}
            <p className="text-sm text-muted-foreground mb-4">
              Note: The `TooltipProvider` wraps this entire page for demonstration. Usually, it
              wraps your root layout.
            </p>

            {/* Example 1: Basic Usage */}
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Basic Tooltip</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover Me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to library</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Example 2: Tooltip on Icon Button */}
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Icon Button Tooltip</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Icon iconId="faPlusLight" className="h-4 w-4" />
                    <span className="sr-only">Add</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Item</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Example 3: Different Side */}
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Positioning (side="left")</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary">Hover (Side Left)</Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Tooltip positioned to the left.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Example 4: Custom Delay */}
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Custom Delay (delayDuration=0)</h3>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover (Instant)</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This tooltip appears instantly.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {/* ---- END NEW EXAMPLES ---- */}
          </div>
        </div>

        {/* Remove Code Snippets Section */}
        {/* {examples && examples.length > 0 && ( ... )} */}
      </div>
    </TooltipProvider>
  );
}
