'use client'; // Add use client for state examples

import React, { useState } from 'react'; // Import hooks
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '../../../../../../components/ui/search-bar';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

// Helper component for controlled SearchBar examples
function ControlledSearchBarExample() {
  const [searchValue, setSearchValue] = useState('');
  const [lastSearch, setLastSearch] = useState('');

  const handleSearch = (term: string) => {
    // Simulate API call or search action
    console.log('Searching for:', term);
    setLastSearch(term);
  };

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchValue}
        onChange={setSearchValue}
        onSearch={handleSearch}
        placeholder="Controlled search..."
        autoSearch // Example with autoSearch
        debounce={500}
        className="max-w-md"
      />
      <p className="text-sm text-muted-foreground">
        Current Value: <span className="font-mono">{searchValue || ''}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Last Searched Term: <span className="font-mono">{lastSearch || 'N/A'}</span>
      </p>
    </div>
  );
}

export default function SearchBarPreviewPage() {
  const componentMeta = {
    name: 'SearchBar',
    description:
      'A search input component using Shadcn Input internally, with icon, optional clear button, loading state, and debouncing.',
    category: 'atom',
    subcategory: 'search',
    renderType: 'client', // Needs client for state/interaction
    author: 'Justify',
    since: '2023-06-01',
    status: 'stable',
  };
  // const examples: string[] = []; // Unused variable

  // State for the basic interactive example
  const [basicValue, setBasicValue] = useState('Initial value');

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
          {/* Example 1: Basic Controlled Usage */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Basic Usage</h3>
            <p className="text-sm text-muted-foreground mb-3">
              SearchBar is a controlled component, requiring `value` and `onChange` props.
            </p>
            <SearchBar
              value={basicValue}
              onChange={setBasicValue}
              placeholder="Search items..."
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground mt-2">Current value: {basicValue}</p>
          </div>
          {/* Example 2: Sizes */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Sizes</h3>
            <div className="flex flex-col gap-4">
              <SearchBar
                value=""
                onChange={() => {}}
                placeholder="Small (sm)"
                size="sm"
                className="max-w-sm"
              />
              <SearchBar
                value=""
                onChange={() => {}}
                placeholder="Medium (md - default)"
                size="md"
                className="max-w-sm"
              />
              <SearchBar
                value=""
                onChange={() => {}}
                placeholder="Large (lg)"
                size="lg"
                className="max-w-sm"
              />
            </div>
          </div>
          {/* Example 3: Features (Loading, No Clear) */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Loading State</p>
                <SearchBar value="Searching..." onChange={() => {}} isLoading={true} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Clear Button Hidden</p>
                <SearchBar value="Cannot clear me" onChange={() => {}} showClear={false} />
              </div>
            </div>
          </div>
          {/* Example 4: AutoSearch & Debounce */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">AutoSearch & Debounce</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Automatically triggers `onSearch` after a debounce period (500ms here). Check console.
            </p>
            <ControlledSearchBarExample />
          </div>
          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>

      {/* Code Snippets Section - REMOVE */}
      {/* {examples && examples.length > 0 && ( ... )} */}
    </div>
  );
}
