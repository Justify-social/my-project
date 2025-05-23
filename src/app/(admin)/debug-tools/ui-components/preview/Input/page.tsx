'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function InputPreviewPage() {
  const componentMeta = {
    name: 'Input',
    description:
      'A standard text input field with support for various types and states. Built on native HTML input.',
    category: 'atom',
    subcategory: 'input',
    renderType: 'server',
    author: 'Shadcn UI',
    since: '2023-01-01',
    status: 'stable',
  };

  const [searchValue, setSearchValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [emailValue, setEmailValue] = useState('');

  const examples: string[] = [
    `import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Basic usage
<Input placeholder="Enter your name" />

// With label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>

// Different types
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Age" />
<Input type="tel" placeholder="Phone number" />
<Input type="url" placeholder="Website" />

// Disabled state
<Input disabled placeholder="Disabled input" />

// With icon (using relative positioning)
<div className="relative">
  <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" iconId="faSearchLight" />
  <Input className="pl-10" placeholder="Search..." />
</div>

// File input
<Input type="file" />`,
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
          {/* Basic Input */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Basic Usage</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="basic">Basic Input</Label>
                <Input id="basic" placeholder="Type something..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled Input</Label>
                <Input id="disabled" placeholder="Disabled input" disabled />
              </div>
            </div>
          </div>

          {/* Input Types */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Input Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={emailValue}
                  onChange={e => setEmailValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={passwordValue}
                  onChange={e => setPasswordValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Number</Label>
                <Input id="number" type="number" placeholder="Enter a number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel">Phone</Label>
                <Input id="tel" type="tel" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" type="url" placeholder="https://example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
            </div>
          </div>

          {/* With Icons */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">With Icons</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search with Icon</Label>
                <div className="relative">
                  <Icon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    iconId="faSearchLight"
                  />
                  <Input
                    id="search"
                    className="pl-10"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-icon">Email with Icon</Label>
                <div className="relative">
                  <Icon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    iconId="faEnvelopeLight"
                  />
                  <Input
                    id="email-icon"
                    className="pl-10"
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url-icon">URL with Icon</Label>
                <div className="relative">
                  <Icon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    iconId="faGlobeLight"
                  />
                  <Input
                    id="url-icon"
                    className="pl-10"
                    type="url"
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Examples */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Form Integration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself..." />
                <p className="text-sm text-muted-foreground">
                  This will be displayed on your profile.
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Profile</Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* File Input */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">File Upload</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <Input id="file" type="file" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <Input id="image" type="file" accept="image/*" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="multiple">Multiple Files</Label>
                <Input id="multiple" type="file" multiple />
              </div>
            </div>
          </div>

          {/* Input States */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Input States</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valid">Valid Input</Label>
                <Input
                  id="valid"
                  className="border-green-500 focus:ring-green-500"
                  placeholder="Valid input"
                  defaultValue="john@example.com"
                />
                <p className="text-sm text-green-600">Email format is correct</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invalid">Invalid Input</Label>
                <Input
                  id="invalid"
                  className="border-red-500 focus:ring-red-500"
                  placeholder="Invalid input"
                  defaultValue="invalid-email"
                />
                <p className="text-sm text-red-600">Please enter a valid email address</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="readonly">Read-only Input</Label>
                <Input
                  id="readonly"
                  readOnly
                  className="bg-muted"
                  defaultValue="This is read-only"
                />
                <p className="text-sm text-muted-foreground">This field cannot be edited</p>
              </div>
            </div>
          </div>

          {/* Common Patterns */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Common Patterns</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Search Bar with Button</h4>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Icon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      iconId="faSearchLight"
                    />
                    <Input className="pl-10" placeholder="Search products..." />
                  </div>
                  <Button type="submit">Search</Button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-3">Input with Clear Button</h4>
                <div className="relative">
                  <Input
                    placeholder="Type to search..."
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    className="pr-10"
                  />
                  {searchValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setSearchValue('')}
                    >
                      <Icon iconId="faTimesLight" className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
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
                <li>• Always pair inputs with descriptive labels</li>
                <li>• Use appropriate input types for validation</li>
                <li>• Provide clear placeholder text as hints</li>
                <li>• Show validation states clearly</li>
                <li>• Use consistent spacing and sizing</li>
                <li>• Make touch targets at least 44px for mobile</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600 mb-2">❌ Don't</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use placeholder text as labels</li>
                <li>• Make required fields unclear</li>
                <li>• Use generic error messages</li>
                <li>• Hide important formatting requirements</li>
                <li>• Make inputs too narrow for their content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Accessibility</h2>
        <div className="border border-divider rounded-lg p-6">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              • All inputs include proper <code>id</code> and <code>htmlFor</code> associations
            </li>
            <li>• Error states are communicated through ARIA attributes</li>
            <li>• Placeholder text doesn't replace proper labels</li>
            <li>• Focus indicators are clearly visible</li>
            <li>• Input types help with mobile keyboards and validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
