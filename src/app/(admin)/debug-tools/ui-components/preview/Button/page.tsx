import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon';

import { Button } from '@/components/ui/button';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function ButtonPreviewPage() {
  const componentMeta: {
    name: string;
    description: string;
    category: string;
    subcategory: string | null;
    renderType: string;
    author: string;
    since: string;
    status?: string | null;
  } = {
    name: 'Button',
    description:
      'Displays a button or a component that looks like a button. Built on Radix UI Slot for flexible composition.',
    category: 'atom',
    subcategory: 'input',
    renderType: 'server',
    author: 'Shadcn UI',
    since: '2023-01-01',
    status: 'stable',
  };

  const examples: string[] = [
    `import { Button } from '@/components/ui/button'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With icons
<Button>
  <Icon iconId="faCheckLight" className="mr-2" />
  Confirm
</Button>

// As a link (using asChild)
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>

// Loading state
<Button disabled>
  <Icon iconId="faSpinnerLight" className="mr-2 animate-spin" />
  Loading...
</Button>`,
  ];

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

      {/* Examples Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Examples / Usage</h2>
        <div className="space-y-6">
          {/* Variants */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Variants</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Use appropriate variants to convey different levels of importance and context.
            </p>
          </div>

          {/* Sizes */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Sizes</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" variant="outline">
                <Icon iconId="faHeartLight" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              The <code>icon</code> size creates a square button perfect for single icons.
            </p>
          </div>

          {/* With Icons */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">With Icons</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Icons with text:</h4>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button>
                    <Icon iconId="faCheckLight" className="mr-2" />
                    Confirm
                  </Button>
                  <Button variant="secondary">
                    Download <Icon iconId="faDownloadLight" className="ml-2" />
                  </Button>
                  <Button variant="outline">
                    <Icon iconId="faFloppyDiskLight" className="mr-2" />
                    Save Draft
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Icon-only buttons:</h4>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="icon" variant="outline">
                    <Icon iconId="faSettingsLight" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Icon iconId="faHeartLight" />
                  </Button>
                  <Button size="icon" variant="destructive">
                    <Icon iconId="faTrashLight" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Usage */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Advanced Usage</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">As a Link (using asChild):</h4>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
                      External Link <Icon iconId="faExternalLinkLight" className="ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Loading States:</h4>
                <div className="flex gap-4">
                  <Button disabled>
                    <Icon iconId="faCircleNotchLight" className="mr-2 animate-spin" />
                    Loading...
                  </Button>
                  <Button variant="outline" disabled>
                    <Icon iconId="faCircleNotchLight" className="mr-2 animate-spin" />
                    Saving...
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Disabled State */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Disabled States</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button disabled>Disabled Default</Button>
              <Button variant="secondary" disabled>
                Disabled Secondary
              </Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
              <Button variant="destructive" disabled>
                Disabled Destructive
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Disabled buttons automatically receive reduced opacity and pointer-events-none.
            </p>
          </div>

          {/* Common Patterns */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Common UI Patterns</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Form Actions:</h4>
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Destructive Actions:</h4>
                <div className="flex gap-2">
                  <Button variant="destructive">
                    <Icon iconId="faTrashLight" className="mr-2" />
                    Delete Account
                  </Button>
                  <Button variant="outline">Keep Account</Button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Call-to-Action:</h4>
                <div className="flex gap-2">
                  <Button size="lg">
                    Get Started <Icon iconId="faArrowRightLight" className="ml-2" />
                  </Button>
                  <Button variant="ghost" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippets Section */}
      {examples && examples.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">Code Examples</h2>
          <div className="space-y-4">
            {examples.map((exampleCode: string, index: number) => (
              <div key={index} className="border border-divider rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h4 className="text-sm font-medium">Usage Examples</h4>
                </div>
                <pre className="text-sm p-4 bg-gray-50 text-gray-800 overflow-x-auto">
                  <code>{exampleCode}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Best Practices</h2>
        <div className="border border-divider rounded-lg p-6">
          <div className="grid gap-4">
            <div>
              <h4 className="font-medium text-green-600 mb-2">✅ Do</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use clear, action-oriented labels</li>
                <li>• Choose appropriate variants for context</li>
                <li>• Include loading states for async actions</li>
                <li>
                  • Use <code>asChild</code> for link functionality
                </li>
                <li>• Provide adequate touch targets (min 44px)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600 mb-2">❌ Don't</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use more than one primary button per section</li>
                <li>• Make destructive actions too easy to trigger</li>
                <li>• Use link variant for form submissions</li>
                <li>• Rely solely on color to convey meaning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
