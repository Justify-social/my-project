'use client';

import { Icon } from '@/components/ui/atoms/icon';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/string/utils';
import { 
  componentApi,
  type ComponentChangeEvent
} from './ui-components-bridge';
import { IconAdapter } from "@/components/ui/utils/font-awesome-adapter";
import { ComponentMetadata } from '../db/registry';

/**
 * DynamicStyledSidebar component that combines the styling from Sidebar-ui-components.tsx
 * with the dynamic functionality of DynamicSidebar.tsx
 */
export default function DynamicStyledSidebar() {
  // Search and component state from DynamicSidebar
  const [searchQuery, setSearchQuery] = useState('');
  const [components, setComponents] = useState<ComponentMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  // Sidebar UI state from Sidebar-ui-components
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    atom: true, // default expanded
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({});

  // Load components on initial render
  useEffect(() => {
    loadComponents();
    
    // Set up component change listener for real-time updates
    const handleComponentChange = (event: ComponentChangeEvent) => {
      // Refresh component list when components change
      loadComponents();
    };
    
    try {
      if (typeof componentApi.addChangeListener === 'function') {
        componentApi.addChangeListener(handleComponentChange);
        
        return () => {
          if (typeof componentApi.removeChangeListener === 'function') {
            componentApi.removeChangeListener(handleComponentChange);
          }
        };
      }
    } catch (error) {
      console.warn('Component change listener not available:', error);
    }
  }, []);

  // Load components when search query changes
  useEffect(() => {
    loadComponents();
  }, [searchQuery]);

  // Load components with current search query
  const loadComponents = async () => {
    setLoading(true);
    
    try {
      let result;
      const options: any = {
        sortBy: 'name' as const,
        sortDirection: 'asc' as const
      };
      
      if (searchQuery) {
        options.search = searchQuery;
      }
      
      // Handle both API versions
      try {
        result = await componentApi.getComponents(options);
        
        // Check if the result is an array or an object with items
        const componentsList = Array.isArray(result) ? result : result.items;
        setComponents(componentsList || []);
        
        // If searching, expand all categories that have results
        if (searchQuery && componentsList?.length > 0) {
          try {
            const categoriesToExpand = Array.from(
              new Set(componentsList.map((component: any) => component.category))
            ).filter(Boolean) as string[];
            
            if (categoriesToExpand.length > 0) {
              const newExpandedSections = { ...expandedSections };
              categoriesToExpand.forEach(category => {
                newExpandedSections[category] = true;
              });
              setExpandedSections(newExpandedSections);
            }
          } catch (err) {
            console.warn('Error expanding categories:', err);
          }
        }
      } catch (error) {
        console.warn('Error using getComponents with options, falling back:', error);
        result = await componentApi.getComponents();
        setComponents(Array.isArray(result) ? result : (result?.items || []));
      }
    } catch (error) {
      console.error('Failed to load components:', error);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  // Group components by category
  const componentsByCategory = components.reduce((acc, component) => {
    const category = component.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {} as Record<string, ComponentMetadata[]>);

  // Toggle a section's expanded state
  const toggleSection = (category: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
    
    // Set this as the selected section
    setSelectedItemId(category);
    setSelectedChildId(null);
    
    // Update URL hash without scroll
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', `#${category}`);
    }
  };

  // Set hover state for an item
  const setHover = (id: string, isHovered: boolean) => {
    setHoverStates(prev => ({
      ...prev,
      [id]: isHovered
    }));
  };

  // Check if an item is active
  const isItemActive = (id: string) => {
    return id === selectedItemId || id === selectedChildId || expandedSections[id] === true;
  };

  // Function to determine the correct variant based on icon name and state
  const getIconVariant = (iconName: string | undefined, isActive: boolean, isHovered: boolean): 'solid' | 'light' => {
    return (isActive || isHovered) ? 'solid' : 'light';
  };

  const renderIcon = (iconId: string, isActive: boolean, isHovered: boolean) => {
    // Extract base icon name and apply correct variant suffix
    let finalIconId = iconId;
    
    // If the icon already has a variant suffix, replace it with the correct one
    if (iconId.endsWith('Light') || iconId.endsWith('Solid')) {
      finalIconId = iconId.slice(0, -5) + ((isActive || isHovered) ? 'Solid' : 'Light');
    } else {
      // Otherwise, append the correct variant suffix
      finalIconId = iconId + ((isActive || isHovered) ? 'Solid' : 'Light');
    }
    
    return (
      <Icon 
        iconId={finalIconId}
        className="w-5 h-5" 
        style={{ 
          filter: (isActive || isHovered) ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 'none', 
          transition: 'filter 0.15s ease-in-out' 
        }}
      />
    );
  };

  // Get appropriate icon for category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'atom': return 'faAtom';
      case 'molecule': return 'faDna';
      case 'organism': return 'faBacterium';
      default: return 'faCode';
    }
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1) + 's';
  };

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 flex flex-col bg-[#f5f5f5] transition-all w-64 md:translate-x-0">
      {/* Header */}
      <div className="flex items-center h-14 px-3 border-b border-[#D1D5DB]">
        <Icon iconId="faPaletteLight" className="h-5 w-5 mr-2 text-[#00BFFF]" variant="light"/>
        <h2 className="font-medium text-[#333333]">UI Component Library</h2>
      </div>
      
      {/* Search Box */}
      <div className="px-3 py-2 border-b border-[#D1D5DB]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-md border border-[#D1D5DB] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
          />
          <Icon iconId="faMagnifyingGlassLight" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4" variant="light" style={{ color: "#4A5568" }}/>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="list-none space-y-0.5">
          {/* Category Headers */}
          <li className="pt-2 pb-1">
            <div className="px-4 text-xs uppercase font-medium text-[#4A5568]">
              Components
            </div>
          </li>
          
          {/* Component Categories */}
          {['atom', 'molecule', 'organism'].map(category => {
            const isActive = isItemActive(category);
            const isHovered = hoverStates[category] || false;
            const componentsInCategory = componentsByCategory[category] || [];
            const isExpanded = expandedSections[category] || false;
            const iconName = getCategoryIcon(category);
            
            return (
              <li key={category} className="w-full">
                {/* Category Header */}
                <button
                  onClick={() => toggleSection(category)}
                  onMouseEnter={() => setHover(category, true)}
                  onMouseLeave={() => setHover(category, false)}
                  className={cn(
                    'flex items-center justify-between py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
                    isActive 
                      ? 'text-[#00BFFF] bg-[#fafafa] font-medium' 
                      : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
                  )}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0">
                      {iconName && renderIcon(iconName, isActive, isHovered)}
                    </div>
                    <span className={`text-base font-sora font-medium ${(isActive || isHovered) ? 'text-[#00BFFF]' : 'text-[#333333]'}`}>
                      {formatCategoryName(category)}
                    </span>
                  </div>
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 text-xs font-medium rounded-full bg-[#00BFFF]/20 text-[#00BFFF]">
                    {componentsInCategory.length}
                  </span>
                </button>
                
                {/* Components List */}
                <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                  <ul className="pl-10 mt-0.5 space-y-0">
                    {componentsInCategory.length === 0 && (
                      <li className="py-1.5 text-sm italic text-[#4A5568]">
                        No components
                      </li>
                    )}
                    
                    {componentsInCategory.map((component, index) => {
                      const componentId = `${category}-${component.name}-${index}`;
                      const isComponentActive = selectedChildId === componentId;
                      const isComponentHovered = hoverStates[componentId] || false;
                      
                      return (
                        <li key={componentId} className="w-full">
                          <Link
                            href={`/debug-tools/ui-components?component=${encodeURIComponent(component.path)}`}
                            onClick={() => {
                              setSelectedChildId(componentId);
                              setSelectedItemId(null);
                            }}
                            onMouseEnter={() => setHover(componentId, true)}
                            onMouseLeave={() => setHover(componentId, false)}
                            className={cn(
                              'flex items-center py-1.5 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
                              isComponentActive
                                ? 'text-[#00BFFF] bg-[#fafafa] font-medium' 
                                : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
                            )}
                          >
                            <span className={`flex-grow text-xs font-sora font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis ${(isComponentActive || isComponentHovered) ? 'text-[#00BFFF]' : 'text-[#333333]'}`}>
                              {component.name}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          })}
          
          {/* Tools Section */}
          <li className="pt-4 pb-1">
            <div className="px-4 text-xs uppercase font-medium text-[#4A5568]">
              Tools
            </div>
          </li>
          
          <li className="w-full">
            <button
              onClick={() => {
                try {
                  if (typeof componentApi.rescanComponents === 'function') {
                    componentApi.rescanComponents();
                  }
                } catch (error) {
                  console.warn('Rescan components not available:', error);
                }
              }}
              onMouseEnter={() => setHover('scan', true)}
              onMouseLeave={() => setHover('scan', false)}
              className={cn(
                'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full',
                hoverStates['scan'] 
                  ? 'text-[#00BFFF] bg-[#fafafa] font-medium' 
                  : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
              )}
            >
              <div className="flex items-center">
                <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0">
                  <Icon iconId={hoverStates['scan'] ? "faMagnifyingGlassPlusSolid" : "faMagnifyingGlassPlusLight"} className="w-5 h-5" style={{ filter: hoverStates['scan'] ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 'none', transition: 'filter 0.15s ease-in-out' }}/>
                </div>
                <span className={`text-base font-sora font-medium ${hoverStates['scan'] ? 'text-[#00BFFF]' : 'text-[#333333]'}`}>
                  Scan for Components
                </span>
              </div>
            </button>
          </li>
          
          {/* GitHub Button */}
          <li className="w-full">
            <a
              href="https://github.com/Justify-social/my-project"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHover('github', true)}
              onMouseLeave={() => setHover('github', false)}
              className={cn(
                'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full',
                hoverStates['github'] 
                  ? 'text-[#00BFFF] bg-[#fafafa] font-medium' 
                  : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
              )}
            >
              <div className="flex items-center">
                <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0">
                  <Icon 
                    iconId="brandsGithub"
                    className="w-5 h-5"
                    style={{ 
                      filter: (hoverStates['github'] || selectedItemId === 'github') 
                        ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' 
                        : 'none',
                      transition: 'filter 0.15s ease-in-out'
                    }}
                  />
                </div>
                <span className={`text-base font-sora font-medium ${hoverStates['github'] ? 'text-[#00BFFF]' : 'text-[#333333]'}`}>
                  View Source
                </span>
              </div>
            </a>
          </li>
          
          {/* Settings Button */}
          <li className="w-full">
            <Link
              href="/debug-tools/ui-components/settings"
              onMouseEnter={() => setHover('settings', true)}
              onMouseLeave={() => setHover('settings', false)}
              className={cn(
                'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full',
                hoverStates['settings'] 
                  ? 'text-[#00BFFF] bg-[#fafafa] font-medium' 
                  : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
              )}
            >
              <div className="flex items-center">
                <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0">
                  <Icon iconId={hoverStates['settings'] ? "faGearSolid" : "faGearLight"} className="w-5 h-5" style={{ filter: hoverStates['settings'] ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 'none', transition: 'filter 0.15s ease-in-out' }}/>
                </div>
                <span className={`text-base font-sora font-medium ${hoverStates['settings'] ? 'text-[#00BFFF]' : 'text-[#333333]'}`}>
                  Settings
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* Add the Back to Debug Tools link just above the footer */}
      <div className="border-t border-[#D1D5DB] p-2">
        <Link
          href="/debug-tools"
          className={cn(
            'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full',
            hoverStates['back'] 
              ? 'text-[#00BFFF] bg-[#fafafa] font-medium' 
              : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
          )}
          onMouseEnter={() => setHover('back', true)}
          onMouseLeave={() => setHover('back', false)}
        >
          <div className="flex items-center">
            <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0">
              <Icon iconId={hoverStates['back'] ? "faArrowLeftSolid" : "faArrowLeftLight"} className="w-5 h-5" style={{ filter: hoverStates['back'] ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 'none', transition: 'filter 0.15s ease-in-out' }}/>
            </div>
            <span className={`text-base font-sora font-medium ${hoverStates['back'] ? 'text-[#00BFFF]' : 'text-[#333333]'}`}>
              Back to Debug Tools
            </span>
          </div>
        </Link>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-[#D1D5DB] text-xs text-center text-[#4A5568]">
        UI Component Library v1.0.0
      </div>
    </aside>
  );
}