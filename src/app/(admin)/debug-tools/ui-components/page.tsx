/**
 * UI Component Browser
 *
 * This page displays key UI components from @/components/ui for visual reference.
 */

'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui';
import { Icon } from '@/components/ui/icon/icon';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { iconRegistryData } from '@/lib/generated/icon-registry';
import { IconMetadata } from '@/components/ui/icon/icon-types';
import { Button as UiButton } from '@/components/ui/button';
import {
  type ComponentRegistry,
  type ExtendedComponentMetadata,
  type ComponentCategory,
} from './types';
import { cn } from '@/lib/utils';
import PaletteDisplay from './PaletteDisplay';
import FontDisplay from './FontDisplay';

const CATEGORIES_DISPLAY: Record<ComponentCategory, { icon: string }> = {
  atom: { icon: 'faAtomLight' },
  molecule: { icon: 'faDnaLight' },
  organism: { icon: 'faBacteriumLight' },
  template: { icon: 'faObjectGroupLight' },
  page: { icon: 'faFileLight' },
  unknown: { icon: 'faQuestionLight' },
};

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

const FIXED_ICON_CATEGORIES = ['All', 'App', 'Brands', 'Hover', 'KPIs', 'Light', 'Solid'];

const getIconInfo = (
  id: string
): { baseName: string; variant: 'light' | 'solid' | 'brand' | 'other' } | null => {
  if (id.endsWith('Light')) return { baseName: id.slice(0, -5), variant: 'light' };
  if (id.endsWith('Solid')) return { baseName: id.slice(0, -5), variant: 'solid' };
  if (id.startsWith('faBrands')) return { baseName: id, variant: 'brand' };
  const baseName = id.startsWith('fa') ? id.slice(2) : id;
  return { baseName: baseName.toLowerCase(), variant: 'other' };
};

export default function ComponentBrowserPage() {
  const router = useRouter();
  const searchParams = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  }, []);

  const initialTab = searchParams.get('tab') || 'components';
  const initialCategory = (searchParams.get('category') as ComponentCategory | null) || null;

  const [registry, setRegistry] = useState<ComponentRegistry | null>(null);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);
  const [errorLoadingRegistry, setErrorLoadingRegistry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | null>(
    initialCategory
  );
  const [allIcons, setAllIcons] = useState<IconMetadata[]>([]);
  const [iconCategories, setIconCategories] = useState<string[]>([]);
  const [selectedIconCategory, setSelectedIconCategory] = useState<string>('All');
  const [hoverPairs, setHoverPairs] = useState<
    { lightId: string; solidId: string; name?: string }[]
  >([]);
  const [currentTab, setCurrentTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'components';
    const category = searchParams.get('category') as ComponentCategory | null;
    setCurrentTab(tab);

    if (tab === 'components') {
      if (category && registry?.allCategories?.includes(category)) {
        setSelectedCategory(category);
      } else if (!selectedCategory) {
        const defaultCategory = registry?.allCategories?.includes('atom')
          ? 'atom'
          : registry?.allCategories?.[0] || null;
        setSelectedCategory(defaultCategory);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams, registry, selectedCategory]);

  useEffect(() => {
    const fetchRegistry = async () => {
      setIsLoadingRegistry(true);
      setErrorLoadingRegistry(null);
      try {
        const response = await fetch('/static/component-registry.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch registry JSON: ${response.statusText}`);
        }
        const data: ComponentRegistry = await response.json();
        setRegistry(data);
      } catch (err) {
        console.error('Error fetching component registry JSON:', err);
        setErrorLoadingRegistry(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoadingRegistry(false);
      }
    };

    fetchRegistry();
  }, []);

  useEffect(() => {
    try {
      const icons = iconRegistryData.icons;
      setAllIcons(icons);
      const lightIcons = icons.filter(icon => icon.id.endsWith('Light'));
      const solidIconsMap = new Map(
        icons.filter(icon => icon.id.endsWith('Solid')).map(icon => [icon.id, icon])
      );
      const pairs = lightIcons
        .map(lightIcon => {
          const lightInfo = getIconInfo(lightIcon.id);
          if (!lightInfo || lightInfo.variant !== 'light') return null;
          const solidId = lightInfo.baseName + 'Solid';
          if (solidIconsMap.has(solidId)) {
            return { lightId: lightIcon.id, solidId, name: lightIcon.name };
          }
          return null;
        })
        .filter(Boolean) as { lightId: string; solidId: string; name?: string }[];
      setHoverPairs(pairs);
      setIconCategories(FIXED_ICON_CATEGORIES);
    } catch (error) {
      console.error('Failed to load icon registry:', error);
    }
  }, []);

  // Helper function to get icon ID for filter buttons
  const getFilterIconId = (category: string): string => {
    switch (category) {
      case 'All':
        return 'faListLight';
      case 'Hover':
        return 'faHandPointerLight';
      case 'App':
        return 'faTableCellsLight';
      case 'Brands':
        return 'brandsGithub'; // Example Brand
      case 'KPIs':
        return 'faChartLineLight';
      case 'Light':
        return 'faLightbulbLight';
      case 'Solid':
        return 'faLightbulbSolid'; // Assuming exists in solid registry
      default:
        return 'faQuestionLight';
    }
  };

  const handleCategoryClick = (category: ComponentCategory) => {
    setSelectedCategory(category);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('tab', 'components');
    currentParams.set('category', category);
    router.push(`?${currentParams.toString()}`);
  };

  const filteredComponents = useMemo(() => {
    if (!registry || !selectedCategory) return [];
    return registry.byCategory[selectedCategory] || [];
  }, [registry, selectedCategory]);

  const getCategoryCount = (category: string): number => {
    if (category === 'All') return allIcons.length;
    if (category === 'Hover') return hoverPairs.length;
    return allIcons.filter(icon => icon.category?.toLowerCase() === category.toLowerCase()).length;
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('tab', value);
    if (value === 'components') {
      const categoryToSet =
        selectedCategory ||
        (registry?.allCategories?.includes('atom') ? 'atom' : registry?.allCategories?.[0]);
      if (categoryToSet) {
        currentParams.set('category', categoryToSet);
      } else {
        currentParams.delete('category');
      }
    } else {
      currentParams.delete('category');
    }
    router.push(`?${currentParams.toString()}`);
  };

  if (isLoadingRegistry) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <LoadingSkeleton />
      </div>
    );
  }

  if (errorLoadingRegistry) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Components</AlertTitle>
          <AlertDescription>{errorLoadingRegistry}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!registry) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertTitle>No Components Found</AlertTitle>
          <AlertDescription>
            Could not load the component registry from /static/component-registry.json.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
          <LoadingSkeleton />
        </div>
      }
    >
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-primary">UI Component Browser</h1>
        <p className="mb-6 text-secondary">
          Browse and preview the UI components and icons available in the system.
        </p>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full mb-6">
          <TabsList className="grid grid-cols-4 mb-4 w-full sm:w-[500px]">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
            <TabsTrigger value="palette">Colour Palette</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
          </TabsList>
          <TabsContent value="components" className="space-y-6 mt-0">
            {/* Components Content */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 mb-6">
              {registry?.allCategories?.map((category: ComponentCategory) => (
                <UiButton
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="h-auto py-3 px-2 sm:px-4 text-left justify-start"
                  onClick={() => handleCategoryClick(category)}
                >
                  <Icon
                    iconId={CATEGORIES_DISPLAY[category]?.icon || 'faQuestionLight'}
                    className="mr-2 h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="flex-1 capitalize">{category}</span>
                  <span
                    className={cn(
                      'text-xs',
                      selectedCategory === category
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    )}
                  >
                    {registry?.byCategory?.[category]?.length || 0}
                  </span>
                </UiButton>
              ))}
            </div>

            {selectedCategory && filteredComponents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {filteredComponents.map((component: ExtendedComponentMetadata) => (
                  <Card
                    key={component.name}
                    className="hover:shadow-md transition-shadow duration-200 border-divider"
                  >
                    <CardHeader className="p-3 sm:p-4 border-b border-divider">
                      <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                        <span>{component.name}</span>
                        {component.status && (
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full border font-medium',
                              statusStyles[component.status] || statusStyles.development
                            )}
                          >
                            {component.status}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      {component.description && (
                        <p className="text-sm text-secondary mb-3 line-clamp-2 overflow-hidden text-ellipsis h-10">
                          {component.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 flex-wrap gap-2">
                        {component.subcategory && <span>{component.subcategory}</span>}
                        <span className="capitalize">{component.renderType || 'N/A'}</span>
                      </div>
                      <Link
                        href={`/debug-tools/ui-components/preview/${component.name}`}
                        className="text-xs text-Interactive hover:underline"
                      >
                        View Details &rarr;
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : selectedCategory ? (
              <Alert className="border-divider mb-6">
                <AlertTitle>No components in this category</AlertTitle>
                <AlertDescription>
                  There are no components registered under the &quot;{selectedCategory}&quot;
                  category.
                </AlertDescription>
              </Alert>
            ) : null}
          </TabsContent>
          <TabsContent value="icons" className="space-y-6 mt-0">
            {/* Icons Content */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 mb-6">
              {iconCategories.map((category: string) => {
                const iconId = getFilterIconId(category);
                return (
                  <UiButton
                    key={category}
                    variant={selectedIconCategory === category ? 'default' : 'outline'}
                    className="h-auto py-3 px-2 sm:px-4 text-left justify-start"
                    onClick={() => setSelectedIconCategory(category)}
                  >
                    <Icon iconId={iconId} className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="flex-1 capitalize">{category}</span>
                    <span
                      className={cn(
                        'text-xs',
                        selectedIconCategory === category
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground'
                      )}
                    >
                      {getCategoryCount(category)}
                    </span>
                  </UiButton>
                );
              })}
            </div>

            {selectedIconCategory === 'Hover' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6 max-h-[600px] overflow-y-auto p-1">
                {hoverPairs.map(pair => (
                  <div
                    key={pair.lightId}
                    className="border border-divider rounded-md p-2 hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center"
                  >
                    <div className="flex justify-center items-center h-12 w-12 mb-1 flex-shrink-0 relative group cursor-pointer">
                      <Icon
                        iconId={pair.lightId}
                        className="h-6 w-6 text-primary group-hover:hidden"
                      />
                      <Icon
                        iconId={pair.solidId}
                        className="h-6 w-6 hidden group-hover:block text-accent"
                      />
                    </div>
                    <div className="text-[10px] text-center truncate text-secondary w-full">
                      {pair.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6 max-h-[600px] overflow-y-auto p-1">
                {allIcons
                  .filter(
                    icon =>
                      selectedIconCategory === 'All' ||
                      icon.category?.toLowerCase() === selectedIconCategory.toLowerCase()
                  )
                  .map(icon => (
                    <div
                      key={icon.id}
                      className="border border-divider rounded-md p-2 hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center"
                    >
                      <div className="flex justify-center items-center h-12 w-12 mb-1 flex-shrink-0">
                        <Icon
                          iconId={icon.id}
                          className="h-6 w-6 text-primary group-hover:text-[var(--color-accent)]"
                        />
                      </div>
                      <div className="text-[10px] text-center truncate text-secondary w-full">
                        {icon.name}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="palette" className="space-y-6 mt-0">
            {/* Palette Content */}
            <PaletteDisplay />
          </TabsContent>
          <TabsContent value="fonts" className="space-y-6 mt-0">
            {/* Fonts Content */}
            <FontDisplay />
          </TabsContent>
        </Tabs>
      </div>
    </Suspense>
  );
}
