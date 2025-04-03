'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ComponentMetadata } from '../db/registry';

interface ComponentsGridProps {
  components: ComponentMetadata[];
  onSelectComponent?: (component: ComponentMetadata) => void;
  filter?: string;
  category?: string;
}

export const ComponentsGrid: React.FC<ComponentsGridProps> = ({
  components,
  onSelectComponent,
  filter = '',
  category = ''
}) => {
  const filteredComponents = useMemo(() => {
    return components.filter((component) => {
      const matchesFilter = filter
        ? component.name.toLowerCase().includes(filter.toLowerCase()) ||
          component.description?.toLowerCase().includes(filter.toLowerCase()) ||
          component.tags?.some((tag) => tag.toLowerCase().includes(filter.toLowerCase()))
        : true;

      const matchesCategory = category ? component.category === category : true;

      return matchesFilter && matchesCategory;
    });
  }, [components, filter, category]);

  if (filteredComponents.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        No components found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredComponents.map((component) => (
        <Card
          key={component.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelectComponent?.(component)}
        >
          <h3 className="text-lg font-medium text-gray-900">{component.name}</h3>
          {component.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {component.description}
            </p>
          )}
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {component.category}
            </span>
            {component.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ComponentsGrid; 