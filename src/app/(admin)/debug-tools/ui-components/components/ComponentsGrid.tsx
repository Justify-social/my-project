'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
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
  // Get the appropriate icon for a category
  const getCategoryIcon = (category: string) => {
    const normalized = category?.toLowerCase() || '';
    
    switch(normalized) {
      case 'atom':
      case 'atoms': return '/icons/light/faAtomLight.svg';
      case 'molecule':
      case 'molecules': return '/icons/light/faDnaLight.svg';
      case 'organism':
      case 'organisms': return '/icons/light/faBacteriumLight.svg';
      default: return '/icons/light/faTableCellsLight.svg';
    }
  };

  const filteredComponents = useMemo(() => {
    // First filter to only show Shadcn components
    let filtered = components.filter(component => component.library === 'shadcn');
    
    // Then apply other filters
    return filtered.filter((component) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {filteredComponents.map((component) => (
        <Card
          key={`${component.name}-${component.path || ''}`}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelectComponent?.(component)}
        >
          <h3 className="text-lg font-medium text-gray-900">
            {component.isNamespaced ? component.originalName : component.name}
            {component.isNamespaced && (
              <span className="ml-1 text-xs font-medium text-blue-600">(Shadcn)</span>
            )}
          </h3>
          {component.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {component.description}
            </p>
          )}
          <div className="mt-2 flex items-center flex-wrap gap-1">
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              title={component.category}
            >
              <img 
                src={getCategoryIcon(component.category)}
                alt={component.category}
                className="w-4 h-4 mr-1"
              />
            </span>
            
            {/* Library tag */}
            {component.library && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  component.library === 'shadcn' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {component.library === 'shadcn' ? 'Shadcn' : 'Atomic'}
              </span>
            )}
            
            {component.tags?.slice(0, 2).map((tag) => (
              <span
                key={`${component.name}-${tag}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
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