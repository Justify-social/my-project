import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '../../../../../../components/ui/textarea';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function TextareaPreviewPage() {
  const componentMeta = {
    name: 'Textarea',
    description: 'A multi-line text input field.',
    category: 'atom',
    subcategory: 'input',
    renderType: 'server',
    author: 'Shadcn',
    since: '2023-01-01',
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

          {/* Example 1: Basic Textarea */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Basic Textarea</h3>
            <Textarea placeholder="Type your message here." />
          </div>

          {/* Example 2: Textarea with Label */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Textarea with Label</h3>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message-2">Your Message</Label>
              <Textarea placeholder="Type your message here." id="message-2" />
              <p className="text-sm text-muted-foreground">
                Your message will be copied to the support team.
              </p>
            </div>
          </div>

          {/* Example 3: Disabled Textarea */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Disabled Textarea</h3>
            <Textarea placeholder="This textarea is disabled." disabled />
          </div>

          {/* Example 4: Textarea with Button (Form Simulation) */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Textarea with Button</h3>
            <div className="grid w-full gap-2">
              <Textarea placeholder="Type your comment here." />
              <Button>Post Comment</Button>
            </div>
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>
    </div>
  );
}
