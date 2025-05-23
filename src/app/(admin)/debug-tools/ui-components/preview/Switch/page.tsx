'use client'; // Required for state

import React, { useState } from 'react'; // Import useState
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label'; // Import Label
import { Switch } from '../../../../../../components/ui/switch';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function SwitchPreviewPage() {
  const componentMeta = {
    name: 'Switch',
    description: 'A control that allows the user to toggle between checked and unchecked states.',
    category: 'atom',
    subcategory: 'input',
    renderType: 'client',
    author: 'Shadcn', // Update author
    since: '2023-01-01', // Update since
    status: 'stable', // Add status
  };
  const examples: string[] = [];

  // State for controlled switch
  const [isChecked, setIsChecked] = useState(false);

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
          {' '}
          {/* Increased spacing */}
          {/* ---- ADD YOUR RENDERING EXAMPLES MANUALLY BELOW ---- */}
          {/* Example 1: Basic Switch */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Basic Switch</h3>
            <div className="flex items-center space-x-2">
              <Switch id="basic-switch" />
              <Label htmlFor="basic-switch">Toggle me</Label>
            </div>
          </div>
          {/* Example 2: Controlled Switch */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Controlled Switch</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Switch state controlled by component state.
            </p>
            <div className="flex items-center space-x-2">
              <Switch id="controlled-switch" checked={isChecked} onCheckedChange={setIsChecked} />
              <Label htmlFor="controlled-switch">Airplane Mode</Label>
            </div>
            <p className="text-sm mt-2">Current state: {isChecked ? 'On' : 'Off'}</p>
          </div>
          {/* Example 3: Disabled Switch */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Disabled Switch</h3>
            <div className="flex items-center space-x-2">
              <Switch id="disabled-switch" disabled />
              <Label htmlFor="disabled-switch">Cannot toggle (disabled)</Label>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Switch id="disabled-checked-switch" disabled checked />
              <Label htmlFor="disabled-checked-switch">Cannot toggle (disabled & checked)</Label>
            </div>
          </div>
          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>

      {/* Code Snippets Section */}
      {examples && examples.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">Code Snippets</h2>
          <div className="space-y-4">
            {examples.map((exampleCode: string, index: number) => (
              <div key={index} className="border border-divider rounded-lg overflow-hidden">
                <pre className="text-sm p-4 bg-gray-50 text-gray-800 overflow-x-auto">
                  <code>{`${exampleCode}`}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
