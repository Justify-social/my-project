/**
 * UI Component Browser
 * 
 * This page displays key UI components from @/components/ui for visual reference.
 */

'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Button, ButtonProps,
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Badge,
  Input,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Avatar, AvatarImage, AvatarFallback,
  Alert, AlertTitle, AlertDescription,
  Table,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui";
import { LightIcon, SolidIcon, Icon } from '@/components/ui/icon';
import { uiComponentMap, UIComponentMapEntry, ComponentCategory } from '@/lib/ui-component-map';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import ErrorFallback from '@/components/features/core/error-handling/ErrorFallback';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { iconRegistryData } from '@/lib/generated/icon-registry';
import { IconMetadata } from '@/components/ui/icon/icon-types';
import { Button as UiButton } from '@/components/ui/button';

const CATEGORIES: { name: ComponentCategory; icon: string }[] = [
  { name: 'Atom', icon: 'faAtomSolid' },
  { name: 'Molecule', icon: 'faDnaSolid' },
  { name: 'Organism', icon: 'faBacteriumSolid' },
];

// Define fixed category order and names
const FIXED_ICON_CATEGORIES = ['All', 'App', 'Brands', 'Hover', 'KPIs', 'Light', 'Solid'];

// Helper function to get base name and variant from icon ID
const getIconInfo = (id: string): { baseName: string; variant: 'light' | 'solid' | 'brand' | 'other' } | null => {
  if (id.endsWith('Light')) return { baseName: id.slice(0, -5), variant: 'light' };
  if (id.endsWith('Solid')) return { baseName: id.slice(0, -5), variant: 'solid' };
  if (id.startsWith('faBrands')) return { baseName: id, variant: 'brand' }; // Treat brands separately
  // Add more specific checks if needed for App/KPIs if they have patterns
  // Simple fallback for baseName if no clear pattern
  const baseName = id.startsWith('fa') ? id.slice(2) : id;
  return { baseName: baseName.toLowerCase(), variant: 'other' };
};

// Simple Error fallback for component preview
const PreviewErrorFallback = ({ error }: { error: Error }) => (
  <div className="border border-red-300 bg-red-50 p-4 rounded text-red-700">
    <h3 className="font-bold">Component Preview Error</h3>
    <pre className="text-xs mt-2">{error.message}</pre>
  </div>
);

export default function ComponentBrowserPage() {
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<UIComponentMapEntry | null>(null);
  const [PreviewComponent, setPreviewComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [allIcons, setAllIcons] = useState<IconMetadata[]>([]);
  const [iconCategories, setIconCategories] = useState<string[]>([]);
  const [selectedIconCategory, setSelectedIconCategory] = useState<string>('All'); // Default to All
  const [hoverPairs, setHoverPairs] = useState<{ lightId: string; solidId: string; name?: string }[]>([]);

  useEffect(() => {
    try {
      const icons = iconRegistryData.icons;
      setAllIcons(icons);

      // Find light/solid pairs for Hover category
      const lightIcons = icons.filter(icon => icon.id.endsWith('Light'));
      const solidIconsMap = new Map(icons.filter(icon => icon.id.endsWith('Solid')).map(icon => [icon.id, icon]));
      const pairs = lightIcons.map(lightIcon => {
        const lightInfo = getIconInfo(lightIcon.id);
        if (!lightInfo || lightInfo.variant !== 'light') return null;
        const solidId = lightInfo.baseName + 'Solid';
        if (solidIconsMap.has(solidId)) {
          return { lightId: lightIcon.id, solidId, name: lightIcon.name };
        }
        return null;
      }).filter(Boolean) as { lightId: string; solidId: string; name?: string }[];
      setHoverPairs(pairs);

      // Generate category counts based on FIXED_ICON_CATEGORIES
      const categoryCounts: Record<string, number> = {};
      FIXED_ICON_CATEGORIES.forEach(cat => { categoryCounts[cat] = 0 });
      categoryCounts['All'] = icons.length;
      categoryCounts['Hover'] = pairs.length;

      icons.forEach(icon => {
        const category = icon.category;
        if (category && FIXED_ICON_CATEGORIES.includes(category)) {
          categoryCounts[category]++;
        }
        // Also count Light/Solid explicitly based on ID suffix
        if (icon.id.endsWith('Light')) categoryCounts['Light']++;
        if (icon.id.endsWith('Solid')) categoryCounts['Solid']++;
        if (icon.id.startsWith('faBrands')) categoryCounts['Brands']++;
        // Add logic for App/KPIs if they have specific patterns or use the category field
        if (category === 'App') categoryCounts['App']++;
        if (category === 'KPIs') categoryCounts['KPIs']++;
      });

      // Store counts for rendering buttons (can refine this structure)
      const categoryButtonsData = FIXED_ICON_CATEGORIES.map(cat => ({
        name: cat,
        count: categoryCounts[cat] || 0
      }));
      // For simplicity, we'll just use FIXED_ICON_CATEGORIES for button rendering
      // and calculate counts dynamically or pass categoryCounts
      setIconCategories(FIXED_ICON_CATEGORIES); // Use fixed list for rendering order

    } catch (error) {
      console.error("Failed to load icon registry:", error);
    }
  }, []);

  // Effect to load component for preview
  useEffect(() => {
    if (!selectedComponent) {
      setPreviewComponent(null);
      return;
    }

    let isMounted = true;
    setIsLoadingPreview(true);
    setPreviewComponent(null); // Clear previous preview

    const loadComponent = async () => {
      try {
        // Construct the full dynamic import path
        // Add Webpack comment to exclude non-code files
        const componentModule = await import(
          /* webpackExclude: /\.md$/ */
          `@/components/ui/${selectedComponent.path}`
        );
        const Component = componentModule[selectedComponent.componentName];

        if (Component && isMounted) {
          setPreviewComponent(() => Component); // Use functional update for safety
        } else if (isMounted) {
          throw new Error(`Component '${selectedComponent.componentName}' not found in module '@/components/ui/${selectedComponent.path}'`);
        }
      } catch (error) {
        console.error("Error loading component preview:", error);
        if (isMounted) {
          setPreviewComponent(null); // Ensure preview is cleared on error
          // Optionally set an error state to display to the user
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [selectedComponent]);

  const handleCategoryClick = (category: ComponentCategory) => {
    setSelectedCategory(category);
    setSelectedComponent(null); // Reset component selection when category changes
    setPreviewComponent(null);
  };

  const handleComponentClick = (component: UIComponentMapEntry) => {
    setSelectedComponent(component);
  };

  const filteredComponents = selectedCategory
    ? uiComponentMap.filter(comp => comp.category === selectedCategory)
    : [];

  // Basic props for preview components (customize as needed)
  const getPreviewProps = (componentName: string): any => {
    switch (componentName) {
      case 'Button': return { children: 'Click Me' };
      case 'Icon': return { iconId: 'faCheckSolid' };
      case 'Card': return { children: <CardContent>Card Content</CardContent> };
      case 'Input': return { placeholder: 'Enter text...' };
      case 'SearchBar': return { placeholder: 'Search...' };
      // Add more default props for other components
      default: return {};
    }
  };

  // Function to get counts based purely on the category field
  const getCategoryCount = (category: string): number => {
    if (category === 'All') return allIcons.length;
    if (category === 'Hover') return hoverPairs.length;
    // Count all other categories based on the 'category' property in the data
    return allIcons.filter(icon => icon.category === category.toLowerCase()).length;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">UI Component Browser</h1>

      <Tabs defaultValue="components">
        <TabsList className="mb-6">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="icons">Icon Library</TabsTrigger>
        </TabsList>

        {/* Components Tab */}
        <TabsContent value="components">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {CATEGORIES.map(cat => (
              <Card
                key={cat.name}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedCategory === cat.name ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{cat.name}</CardTitle>
                  <Icon iconId={cat.icon} className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {cat.name === 'Atom' ? 'Basic building blocks' :
                      cat.name === 'Molecule' ? 'Combinations of atoms' :
                        'Complex UI structures'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCategory && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{selectedCategory} Components</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredComponents.length > 0 ? (
                  filteredComponents.map(comp => (
                    <Card
                      key={comp.name}
                      className={`cursor-pointer p-4 text-center hover:bg-gray-50 ${selectedComponent?.name === comp.name ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                      onClick={() => handleComponentClick(comp)}
                    >
                      <p className="text-sm font-medium truncate">{comp.name}</p>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full">No components found in this category.</p>
                )}
              </div>
            </div>
          )}

          {selectedComponent && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Preview: {selectedComponent.name}</h2>
              <Card className="p-6 min-h-[200px] flex items-center justify-center">
                <ErrorBoundary fallback={<PreviewErrorFallback error={new Error('Failed to render component')} />}>
                  <Suspense fallback={<LoadingSpinner />}>
                    {isLoadingPreview && <LoadingSpinner />}
                    {!isLoadingPreview && PreviewComponent && (
                      <PreviewComponent {...getPreviewProps(selectedComponent.componentName)} />
                    )}
                    {!isLoadingPreview && !PreviewComponent && (
                      <p className="text-red-500">Could not load component preview.</p>
                    )}
                  </Suspense>
                </ErrorBoundary>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Icon Library Tab */}
        <TabsContent value="icons">
          <h2 className="text-xl font-semibold mb-4">Icon Library</h2>

          {/* Category Filters - Use fixed order */}
          <div className="flex flex-wrap gap-2 mb-6">
            {FIXED_ICON_CATEGORIES.map(category => {
              const count = getCategoryCount(category);
              // Always render the button, even if count is 0
              return (
                <UiButton
                  key={category}
                  variant={selectedIconCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedIconCategory(category)}
                >
                  {category} ({count})
                </UiButton>
              );
            })}
          </div>

          {allIcons.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {/* Conditional Rendering based on selected category */}
              {selectedIconCategory === 'Hover' ? (
                hoverPairs.map(pair => (
                  <Card
                    key={pair.lightId}
                    // Add group class for hover effects
                    className="group flex flex-col items-center text-center hover:bg-gray-50 aspect-square pt-2 cursor-pointer"
                  >
                    {/* Render both, control visibility/display with group-hover */}
                    <Icon
                      iconId={pair.lightId}
                      // Default: show light, use foreground fill. Hover: hide
                      className="w-[55%] h-[55%] fill-foreground group-hover:hidden"
                    />
                    <Icon
                      iconId={pair.solidId}
                      // Default: hide. Hover: show solid, use accent fill via inline style for specificity
                      className="w-[55%] h-[55%] hidden group-hover:block"
                      style={{ fill: '#00BFFF' }} // Apply accent color directly
                    />
                    <p className="text-xs break-all pt-1 mt-auto">
                      {/* Display base name derived from ID if name is missing */}
                      {pair.name || getIconInfo(pair.lightId)?.baseName || pair.lightId}
                    </p>
                  </Card>
                ))
              ) : (
                allIcons
                  // Filter based purely on the category field (or show all)
                  .filter(iconMeta => {
                    const isAll = selectedIconCategory === 'All';
                    const categoryToCompare = selectedIconCategory.toLowerCase();
                    const iconCategory = iconMeta.category;
                    const categoryMatch = iconCategory === categoryToCompare;
                    return isAll || categoryMatch;
                  })
                  .map(iconMeta => (
                    <Card
                      key={iconMeta.id}
                      // Add group class for hover effects
                      className="group flex flex-col items-center text-center hover:bg-gray-50 aspect-square pt-2 cursor-pointer"
                    >
                      {/* Use fill-foreground for default color */}
                      <Icon
                        iconId={iconMeta.id}
                        // Default: use foreground fill. Hover: use accent fill
                        className="w-[55%] h-[55%] fill-foreground group-hover:fill-[#00BFFF]"
                      />
                      <p className="text-xs break-all pt-1 mt-auto">
                        {/* Display base name derived from ID if name is missing */}
                        {iconMeta.name || getIconInfo(iconMeta.id)?.baseName || iconMeta.id}
                      </p>
                    </Card>
                  ))
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Icon registry could not be loaded.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 