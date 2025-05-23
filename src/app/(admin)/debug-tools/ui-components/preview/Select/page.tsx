'use client'; // Select requires client
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select'; // Import Select components
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon/icon';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function SelectPreviewPage() {
  const componentMeta = {
    name: 'Select',
    description:
      'Displays a list of options for the user to pick from—triggered by a button. Built on Radix UI Select.',
    category: 'organism',
    subcategory: 'input',
    renderType: 'client',
    author: 'Shadcn UI',
    since: '2023-01-01',
    status: 'stable',
  };

  const examples: string[] = [
    `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Basic usage
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>

// With Label
<div className="space-y-2">
  <Label htmlFor="framework">Framework</Label>
  <Select>
    <SelectTrigger id="framework">
      <SelectValue placeholder="Select a framework" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="react">React</SelectItem>
      <SelectItem value="vue">Vue</SelectItem>
      <SelectItem value="angular">Angular</SelectItem>
    </SelectContent>
  </Select>
</div>

// With groups and separators
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Vegetables</SelectLabel>
      <SelectItem value="carrot">Carrot</SelectItem>
      <SelectItem value="broccoli">Broccoli</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`,
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
          {/* Basic Select */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Basic Usage</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select>
                  <SelectTrigger id="theme" className="w-[180px]">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled Select</Label>
                <Select disabled>
                  <SelectTrigger id="disabled" className="w-[180px]">
                    <SelectValue placeholder="Disabled" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* With Groups */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Grouped Options</h3>
            <div className="space-y-2">
              <Label htmlFor="food">Food Categories</Label>
              <Select>
                <SelectTrigger id="food" className="w-[200px]">
                  <SelectValue placeholder="Select food" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="apple">
                      <div className="flex items-center">
                        <Icon iconId="faAppleAltLight" className="mr-2 h-4 w-4" />
                        Apple
                      </div>
                    </SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Vegetables</SelectLabel>
                    <SelectItem value="carrot">Carrot</SelectItem>
                    <SelectItem value="broccoli">Broccoli</SelectItem>
                    <SelectItem value="spinach">Spinach</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Meat</SelectLabel>
                    <SelectItem value="chicken">Chicken</SelectItem>
                    <SelectItem value="beef">Beef</SelectItem>
                    <SelectItem value="fish">Fish</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form Integration */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Form Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">🇺🇸 United States</SelectItem>
                    <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                    <SelectItem value="au">🇦🇺 Australia</SelectItem>
                    <SelectItem value="de">🇩🇪 Germany</SelectItem>
                    <SelectItem value="fr">🇫🇷 France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">EST (Eastern)</SelectItem>
                    <SelectItem value="pst">PST (Pacific)</SelectItem>
                    <SelectItem value="cst">CST (Central)</SelectItem>
                    <SelectItem value="mst">MST (Mountain)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select>
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">Extra Small</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Different Widths */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Different Widths</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Small (w-32)</Label>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">SM</SelectItem>
                    <SelectItem value="md">MD</SelectItem>
                    <SelectItem value="lg">LG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Medium (w-48)</Label>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Full Width</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="This select takes full width" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full1">Full width option 1</SelectItem>
                    <SelectItem value="full2">Full width option 2</SelectItem>
                    <SelectItem value="full3">Full width option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Custom Content */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Custom Content</h3>
            <div className="space-y-2">
              <Label htmlFor="custom">Team Members</Label>
              <Select>
                <SelectTrigger id="custom" className="w-[250px]">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        J
                      </div>
                      <div>
                        <div className="font-medium">John Doe</div>
                        <div className="text-xs text-muted-foreground">john@example.com</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="jane">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                        J
                      </div>
                      <div>
                        <div className="font-medium">Jane Smith</div>
                        <div className="text-xs text-muted-foreground">jane@example.com</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="bob">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                        B
                      </div>
                      <div>
                        <div className="font-medium">Bob Johnson</div>
                        <div className="text-xs text-muted-foreground">bob@example.com</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
                <li>• Use clear, descriptive option labels</li>
                <li>• Group related options with SelectGroup</li>
                <li>• Provide meaningful placeholder text</li>
                <li>• Use consistent option ordering (alphabetical, logical, etc.)</li>
                <li>• Include icons or additional context when helpful</li>
                <li>• Use appropriate widths for content</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600 mb-2">❌ Don't</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use select for more than ~15 options without search</li>
                <li>• Make options too similar or confusing</li>
                <li>• Use generic placeholders like "Choose one"</li>
                <li>• Nest groups more than one level deep</li>
                <li>• Make the trigger too narrow for option content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Component API */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Component API</h2>
        <div className="border border-divider rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Core Components</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <code>Select</code> - Root component
                </li>
                <li>
                  • <code>SelectTrigger</code> - Button that opens the select
                </li>
                <li>
                  • <code>SelectValue</code> - Displays the selected value
                </li>
                <li>
                  • <code>SelectContent</code> - Container for the options
                </li>
                <li>
                  • <code>SelectItem</code> - Individual option
                </li>
                <li>
                  • <code>SelectGroup</code> - Groups related options
                </li>
                <li>
                  • <code>SelectLabel</code> - Group label
                </li>
                <li>
                  • <code>SelectSeparator</code> - Visual separator
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
