import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
// Import Alert and its sub-components
import { Alert, AlertTitle, AlertDescription } from '../../../../../../components/ui/alert';
// Import Icon for examples
import { Icon } from '@/components/ui/icon/icon';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function AlertPreviewPage() {
  // Metadata embedded from build script
  const componentMeta = {
    name: 'Alert',
    description: 'Displays a callout for user attention.',
    category: 'molecule',
    subcategory: 'notification',
    renderType: 'server',
    author: '',
    since: '',
    status: null,
  };
  // Explicit type for examples array
  const examples: string[] = [];

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
          {/* --- Render Examples Added Manually --- */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Default Alert</h3>
            <Alert>
              <Icon iconId="faTriangleExclamationSolid" className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>You can add components to your app using the cli.</AlertDescription>
            </Alert>
          </div>

          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Destructive Alert</h3>
            <Alert variant="destructive">
              <Icon iconId="faTriangleExclamationSolid" className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
            </Alert>
          </div>
          {/* --- END RENDER EXAMPLES --- */}
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
