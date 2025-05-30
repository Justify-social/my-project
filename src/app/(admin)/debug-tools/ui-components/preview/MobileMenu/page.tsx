'use client'; // Sheet component requires client
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MobileMenu, MenuItem } from '@/components/ui/navigation/mobile-menu'; // Import component and MenuItem type
import { Button } from '@/components/ui/button'; // Import Button for trigger example
import { Icon } from '@/components/ui/icon/icon';

// Updated Sample navigation items using MenuItem structure (iconId is mapped internally)
const sampleNavItems: Omit<MenuItem, 'iconId'>[] = [
  { id: 'home', href: '#', label: 'Home' },
  { id: 'camp', href: '#', label: 'Campaigns' },
  { id: 'blift', href: '#', label: 'Brand Lift' },
  { id: 'ctest', href: '#', label: 'Creative Testing' },
  { id: 'bhealth', href: '#', label: 'Brand Health' },
  { id: 'influ', href: '#', label: 'Influencers' },
  { id: 'mmm', href: '#', label: 'MMM' },
  { id: 'help', href: '#', label: 'Help' },
  { id: 'bill', href: '#', label: 'Billing' },
  // Note: "Settings" is handled by the settingsItem prop below
];

// Updated Example Settings Item (UNUSED)
// const settingsItem: Omit<MenuItem, 'iconId'> = {
//   id: 'settings',
//   label: 'Settings', // Use the label the component expects for mapping
//   href: '#settings',
// };

// Example User Data
const sampleUser = {
  name: 'Ed Adams',
  email: 'ed@example.com',
  picture: '/images/influencers/rachel.jpg', // Replace with actual user image path if available
};

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function MobileMenuPreviewPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false); // State for menu visibility

  const componentMeta = {
    name: 'MobileMenu',
    description: 'Mobile navigation menu using Shadcn Sheet component.',
    category: 'organism',
    subcategory: 'navigation', // Updated subcategory
    renderType: 'client',
    status: 'stable', // Added status
    author: 'Your Name/Team', // Added author
    since: '2024-01-15', // Added since date (example)
  };
  // const examples: string[] = []; // Removed examples array

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
          {/* ---- ADD YOUR RENDERING EXAMPLES MANUALLY BELOW ---- */}

          {/* Example 1: Trigger Button */}
          <div className="border border-divider rounded-lg p-6 flex items-center space-x-4">
            <Button variant="outline" onClick={() => setIsMenuOpen(true)}>
              <Icon iconId="faBarsLight" className="mr-2 h-4 w-4" /> Open Mobile Menu
            </Button>
            <p className="text-sm text-muted-foreground">(Click button to open the menu sheet)</p>
          </div>

          {/* The MobileMenu Component (Sheet) controlled by state */}
          <MobileMenu
            isOpen={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            menuItems={sampleNavItems as MenuItem[]}
            remainingCredits={145}
            notificationsCount={3}
            companyName="Justify"
            // @ts-ignore: Temporary bypass for type mismatch in preview
            user={sampleUser}
          />

          {/* Notes Section */}
          <div className="border border-divider rounded-lg p-6 bg-muted">
            <h3 className="text-lg font-medium mb-3">Implementation Notes</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                The trigger button (like the one above) is separate from the `MobileMenu` component.
              </li>
              <li>State (`isOpen`, `onOpenChange`) must be managed in the parent component.</li>
              <li>Pass navigation structure via `menuItems` prop (using `MenuItem` type).</li>
              <li>Footer data (credits, notifications, user) is passed via props.</li>
            </ul>
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>

      {/* Code Snippets Section - Removed */}
      {/* {examples && examples.length > 0 && ( ... )} */}
    </div>
  );
}
