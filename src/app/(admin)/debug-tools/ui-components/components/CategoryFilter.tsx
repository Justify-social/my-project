import React from 'react';
import { ComponentMetadata } from '../db/registry';

interface CategoryFilterProps {
  components: ComponentMetadata[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  components,
  selectedCategory,
  onSelectCategory
}) => {
  // Extract unique categories from components
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    
    // Add "All" as the first category
    uniqueCategories.add('');
    
    // Add all component categories
    components.forEach(component => {
      if (component.category) {
        uniqueCategories.add(component.category);
      }
    });
    
    return Array.from(uniqueCategories);
  }, [components]);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          const displayName = category || 'All';
          
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                isSelected
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter; 