'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { type ExtendedComponentMetadata } from './types';
import { cn } from '@/lib/utils';

// Define the props for the client component
interface ComponentBrowserProps {
  components: ExtendedComponentMetadata[];
}

// Helper to group components by category
const groupComponents = (
  components: ExtendedComponentMetadata[]
): Record<string, ExtendedComponentMetadata[]> => {
  return components.reduce(
    (acc, component) => {
      const category = component.category || 'unknown'; // Use 'unknown' if category missing
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(component);
      return acc;
    },
    {} as Record<string, ExtendedComponentMetadata[]>
  );
};

// Define status badge styling
const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200', // Default/fallback
};

/**
 * Client component to render the UI Component Browser interface.
 * Displays categories and component cards.
 */
export default function ComponentBrowser({ components }: ComponentBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Memoize the grouped components to avoid recalculation on every render
  const groupedComponents = useMemo(() => groupComponents(components), [components]);
  const categories = useMemo(() => Object.keys(groupedComponents).sort(), [groupedComponents]);

  // Set the first category as default if none is selected
  if (!selectedCategory && categories.length > 0) {
    setSelectedCategory(categories[0]);
  }

  const componentsToShow = selectedCategory ? groupedComponents[selectedCategory] : [];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Category Sidebar/List */}
      <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
        <h2 className="text-lg font-semibold mb-3 text-secondary">Categories</h2>
        <nav className="flex flex-col space-y-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-2 text-left rounded-md text-sm transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-Interactive', // Use Interactive color for focus
                selectedCategory === category
                  ? 'bg-accent text-white font-medium' // Use Accent color for selected
                  : 'text-primary hover:bg-gray-100' // Use Primary color for text
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)} (
              {groupedComponents[category]?.length || 0})
            </button>
          ))}
        </nav>
      </aside>
      {/* Component Grid */}
      <main className="flex-grow">
        {selectedCategory && (
          <React.Fragment>
            <h2 className="text-xl font-semibold mb-4 capitalize text-primary">
              {selectedCategory} Components
            </h2>
            {componentsToShow.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {componentsToShow.map((comp: ExtendedComponentMetadata) => (
                  <Link
                    key={comp.name}
                    href={`/debug-tools/ui-components/preview/${comp.name.toLowerCase()}`}
                    className="block border border-divider rounded-lg hover:shadow-md hover:border-Interactive transition-all duration-150 bg-background group"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-md font-semibold text-primary group-hover:text-Interactive truncate">
                          {comp.name}
                        </h3>
                        {comp.status && (
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap',
                              statusStyles[comp.status] || statusStyles.development
                            )}
                          >
                            {comp.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary line-clamp-2">
                        {comp.description || 'No description available.'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-secondary col-span-full">
                No components found in the '{selectedCategory}' category.
              </p>
            )}
          </React.Fragment>
        )}

        {!selectedCategory && (
          <p className="text-secondary">Select a category to view components.</p>
        )}
      </main>
    </div>
  );
}
