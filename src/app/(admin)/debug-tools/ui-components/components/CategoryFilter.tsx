import React, { useState } from 'react';
import { ComponentMetadata } from '../db/registry';
import { Tabs, TabsList, TabsTrigger } from '../components/ui-components-bridge';

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

  // Get the appropriate light icon for each category
  const getLightIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'atom':
      case 'atoms': return 'faAtomLight';
      case 'molecule':
      case 'molecules': return 'faDnaLight';
      case 'organism':
      case 'organisms': return 'faBacteriumLight';
      default: return 'faTableCellsLight'; // "All" category
    }
  };

  // Get the appropriate solid icon for each category
  const getSolidIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'atom':
      case 'atoms': return 'faAtomSolid';
      case 'molecule':
      case 'molecules': return 'faDnaSolid';
      case 'organism':
      case 'organisms': return 'faBacteriumSolid';
      default: return 'faTableCellsSolid'; // "All" category
    }
  };

  // Function to get direct path to the icon SVG
  const getIconPath = (iconId: string) => {
    const variant = iconId.endsWith('Solid') ? 'solid' : 'light';
    return `/icons/${variant}/${iconId}.svg`;
  };

  // Get a friendly name for each category tab
  const getCategoryLabel = (category: string) => {
    if (!category) return 'All';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Track hover state for each tab
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <Tabs defaultValue={selectedCategory} onValueChange={onSelectCategory} className="w-full flex justify-end">
      <TabsList className="bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
        {categories.map((category) => {
          const isActive = category === selectedCategory;
          const isHovered = category === hoveredCategory;
          
          // Use the appropriate icon based on state
          const iconId = (isActive || isHovered) ? getSolidIcon(category) : getLightIcon(category);
          const iconPath = getIconPath(iconId);
          const label = getCategoryLabel(category);
          
          return (
            <TabsTrigger
              key={category}
              value={category}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`px-4 py-2 rounded-md transition-all ${
                isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              title={label}
            >
              <span className="flex items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 relative">
                  <img 
                    src={iconPath}
                    alt={`${label} category`}
                    className="w-5 h-5"
                    style={{ 
                      filter: (isActive || isHovered) ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 'none',
                      transition: 'filter 0.15s ease-in-out'
                    }}
                  />
                </div>
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default CategoryFilter; 