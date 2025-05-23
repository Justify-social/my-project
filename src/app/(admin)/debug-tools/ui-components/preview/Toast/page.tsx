'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';

import { showSuccessToast, showErrorToast } from '@/components/ui/toast';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function ToastPreviewPage() {
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
    name: 'Toast',
    description:
      'Standardized toast notification functions for success and error messages with customizable icons.',
    category: 'atom',
    subcategory: 'feedback',
    renderType: 'client',
    author: '',
    since: '',
    status: 'stable',
  };

  const examples: string[] = [
    `import { showSuccessToast, showErrorToast } from '@/components/ui/toast'

// Basic success toast
showSuccessToast('Data saved successfully!')

// Success toast with custom icon
showSuccessToast('File uploaded!', 'faUploadLight')

// Basic error toast
showErrorToast('Failed to save data')

// Error toast with custom icon
showErrorToast('Upload failed', 'faUploadLight')`,
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
          {componentMeta.subcategory && <span>Subcategory: {componentMeta.subcategory}</span>}
        </div>
      </div>

      {/* Examples Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Examples / Usage</h2>
        <div className="space-y-6">
          {/* Success Toasts */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Success Toasts</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Basic success toast (3s duration):
                </p>
                <Button
                  onClick={() => showSuccessToast('Data saved successfully!')}
                  className="mr-4"
                >
                  <Icon iconId="faCheckLight" className="mr-2" />
                  Show Success Toast
                </Button>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Success toast with custom icon:
                </p>
                <Button
                  onClick={() => showSuccessToast('File uploaded successfully!', 'faUploadLight')}
                  variant="secondary"
                >
                  <Icon iconId="faUploadLight" className="mr-2" />
                  Upload Success
                </Button>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Settings saved:</p>
                <Button
                  onClick={() => showSuccessToast('Settings saved!', 'faFloppyDiskLight')}
                  variant="secondary"
                >
                  <Icon iconId="faFloppyDiskLight" className="mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Error Toasts */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Error Toasts</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Basic error toast (5s duration):
                </p>
                <Button
                  onClick={() => showErrorToast('Failed to save data. Please try again.')}
                  variant="destructive"
                  className="mr-4"
                >
                  <Icon iconId="faTriangleExclamationLight" className="mr-2" />
                  Show Error Toast
                </Button>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Network error:</p>
                <Button
                  onClick={() => showErrorToast('Network connection failed', 'faWifiLight')}
                  variant="destructive"
                >
                  <Icon iconId="faWifiLight" className="mr-2" />
                  Network Error
                </Button>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Validation error:</p>
                <Button
                  onClick={() =>
                    showErrorToast('Please fill in all required fields', 'faCircleXmarkLight')
                  }
                  variant="destructive"
                >
                  <Icon iconId="faCircleXmarkLight" className="mr-2" />
                  Validation Error
                </Button>
              </div>
            </div>
          </div>

          {/* Toast Features */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Toast Features</h3>
            <div className="grid gap-4">
              <div>
                <h4 className="font-medium mb-2">Duration</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Success toasts: 3 seconds (standard)</li>
                  <li>• Error toasts: 5 seconds (longer for important messages)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Styling</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Success: Custom success styling defined in globals.css</li>
                  <li>• Error: Custom error styling defined in globals.css</li>
                  <li>• Icons: FontAwesome icons with appropriate colors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Default Icons</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Success: faFloppyDiskLight (save icon)</li>
                  <li>• Error: faTriangleExclamationLight (warning icon)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Multiple Toasts */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Multiple Toasts</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test showing multiple toasts at once to see stacking behavior:
              </p>
              <Button
                onClick={() => {
                  showSuccessToast('First success message!');
                  setTimeout(() => showSuccessToast('Second success message!'), 500);
                  setTimeout(() => showErrorToast('An error occurred!'), 1000);
                }}
                variant="outline"
              >
                <Icon iconId="faListLight" className="mr-2" />
                Show Multiple Toasts
              </Button>
            </div>
          </div>

          {/* Common Use Cases */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Common Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Success Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Data saved/updated</li>
                  <li>• File uploaded</li>
                  <li>• Settings changed</li>
                  <li>• Action completed</li>
                  <li>• Email sent</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Error Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Network errors</li>
                  <li>• Validation failures</li>
                  <li>• Permission denied</li>
                  <li>• File upload errors</li>
                  <li>• Server errors</li>
                </ul>
              </div>
            </div>
          </div>
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

      {/* Note */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 flex items-start">
          <Icon
            iconId="faCircleInfoLight"
            className="w-4 h-4 min-w-[1rem] min-h-[1rem] max-w-[1rem] max-h-[1rem] mr-2 mt-0.5 flex-shrink-0"
          />
          <span>
            <strong>Note:</strong> Toast notifications use react-hot-toast under the hood and
            require a Toaster component to be rendered in your app root. The styling is defined in
            globals.css with custom classes.
          </span>
        </p>
      </div>
    </div>
  );
}
