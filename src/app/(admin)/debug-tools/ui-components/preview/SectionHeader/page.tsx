import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '../../../../../../components/ui/section-header';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function SectionHeaderPreviewPage() {
  const componentMeta = {
    name: 'SectionHeader',
    description:
      'A section header component for displaying a title, optional description, and optional icon.',
    category: 'atom',
    subcategory: null,
    renderType: 'client',
    author: 'Justify',
    since: '2023-07-01',
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

          {/* Example 1: Title Only */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Title Only</h3>
            <SectionHeader title="Account Settings" />
          </div>

          {/* Example 2: Title and Description */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Title & Description</h3>
            <SectionHeader
              title="Notifications"
              description="Manage how you receive notifications."
            />
          </div>

          {/* Example 3: Title, Description, and Icon */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">With Icon</h3>
            <SectionHeader
              title="Billing Information"
              description="Update your payment methods and view invoices."
              iconId="faCreditCardLight"
            />
          </div>

          {/* Example 4: Custom Styling */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Custom Styling</h3>
            <SectionHeader
              title="Advanced Options"
              description="Configure expert settings."
              iconId="faCogLight"
              className="bg-blue-50 p-4 rounded-md"
              titleClassName="text-blue-800 !text-2xl"
              descriptionClassName="italic text-blue-600"
              iconClassName="text-blue-700 !h-8 !w-8"
            />
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>
    </div>
  );
}
