/**
 * UI Component Browser
 * 
 * This page displays key UI components from @/components/ui for visual reference.
 */

'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
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
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import ErrorFallback from '@/components/features/core/error-handling/ErrorFallback';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { iconRegistryData } from '@/lib/generated/icon-registry';
import { IconMetadata } from '@/components/ui/icon/icon-types';
import { Button as UiButton } from '@/components/ui/button';
import { type ComponentRegistry, type ExtendedComponentMetadata, type ComponentCategory, CATEGORIES } from './types';
import { cn } from '@/lib/utils';

const CATEGORIES_DISPLAY: { name: ComponentCategory; icon: string }[] = CATEGORIES.map(cat => {
  switch (cat) {
    case 'atom': return { name: cat, icon: 'faAtomSolid' };
    case 'molecule': return { name: cat, icon: 'faDnaSolid' };
    case 'organism': return { name: cat, icon: 'faBacteriumSolid' };
    case 'template': return { name: cat, icon: 'faObjectGroupSolid' };
    case 'page': return { name: cat, icon: 'faFileSolid' };
    case 'unknown': return { name: cat, icon: 'faQuestionSolid' };
    default: return { name: cat, icon: 'faQuestionSolid' };
  }
}).filter(cat => cat.name !== 'unknown');

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

const FIXED_ICON_CATEGORIES = ['All', 'App', 'Brands', 'Hover', 'KPIs', 'Light', 'Solid'];

const getIconInfo = (id: string): { baseName: string; variant: 'light' | 'solid' | 'brand' | 'other' } | null => {
  if (id.endsWith('Light')) return { baseName: id.slice(0, -5), variant: 'light' };
  if (id.endsWith('Solid')) return { baseName: id.slice(0, -5), variant: 'solid' };
  if (id.startsWith('faBrands')) return { baseName: id, variant: 'brand' };
  const baseName = id.startsWith('fa') ? id.slice(2) : id;
  return { baseName: baseName.toLowerCase(), variant: 'other' };
};

export default function ComponentBrowserPage() {
  const [registry, setRegistry] = useState<ComponentRegistry | null>(null);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);
  const [errorLoadingRegistry, setErrorLoadingRegistry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | null>(null);
  const [allIcons, setAllIcons] = useState<IconMetadata[]>([]);
  const [iconCategories, setIconCategories] = useState<string[]>([]);
  const [selectedIconCategory, setSelectedIconCategory] = useState<string>('All');
  const [hoverPairs, setHoverPairs] = useState<{ lightId: string; solidId: string; name?: string }[]>([]);

  useEffect(() => {
    const fetchRegistry = async () => {
      setIsLoadingRegistry(true);
      setErrorLoadingRegistry(null);
      try {
        const response = await fetch('/api/debug-tools/ui-components');
        if (!response.ok) {
          throw new Error(`Failed to fetch registry: ${response.statusText}`);
        }
        const data: ComponentRegistry = await response.json();
        setRegistry(data);
        if (!selectedCategory && data.allCategories.length > 0) {
          const defaultCategory = data.allCategories.includes('atom') ? 'atom' : data.allCategories[0];
          setSelectedCategory(defaultCategory);
        }
      } catch (err) {
        console.error("Error fetching component registry:", err);
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
      setIconCategories(FIXED_ICON_CATEGORIES);
    } catch (error) {
      console.error("Failed to load icon registry:", error);
    }
  }, []);

  const handleCategoryClick = (category: ComponentCategory) => {
    setSelectedCategory(category);
  };

  const filteredComponents = useMemo(() => {
    if (!registry || !selectedCategory) return [];
    return registry.byCategory[selectedCategory] || [];
  }, [registry, selectedCategory]);

  const getPreviewProps = (componentName: string): any => {
    switch (componentName) {
      case 'Button': return { children: 'Click Me' };
      case 'Icon': return { iconId: 'faCheckSolid' };
      case 'Card': return { children: <CardContent>Card Content</CardContent> };
      case 'Input': return { placeholder: 'Enter text...' };
      case 'SearchBar': return { placeholder: 'Search...' };
      default: return {};
    }
  };

  const getCategoryCount = (category: string): number => {
    if (category === 'All') return allIcons.length;
    if (category === 'Hover') return hoverPairs.length;
    return allIcons.filter(icon => icon.category === category.toLowerCase()).length;
  };

  if (isLoadingRegistry) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="lg" />
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
          <AlertDescription>Could not load the component registry.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">UI Component Browser</h1>

      <Tabs defaultValue="components">
        <TabsList className="mb-6">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="icons">Icon Library</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {(registry.allCategories || []).map((category: ComponentCategory) => {
              const catDisplay = CATEGORIES_DISPLAY.find(cd => cd.name === category);
              const count = registry.byCategory[category]?.length || 0;
              if (count === 0 || category === 'unknown') return null;

              return (
                <Card
                  key={category}
                  className={cn(
                    'cursor-pointer hover:shadow-lg transition-shadow',
                    selectedCategory === category ? 'border-accent ring-2 ring-accent' : 'border-divider'
                  )}
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">{category}</CardTitle>
                    {<Icon iconId={catDisplay?.icon || 'faQuestionSolid'} className="h-4 w-4 text-muted-foreground" />}
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-secondary">
                      {count} component{count !== 1 ? 's' : ''}
                    </div>
                  </CardContent>
                </Card>
              );
            }).filter(Boolean)}
          </div>

          {selectedCategory && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 capitalize text-primary">
                {selectedCategory} Components
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredComponents.length > 0 ? (
                  filteredComponents.map((comp: ExtendedComponentMetadata) => (
                    <Link
                      key={comp.name}
                      href={`/debug-tools/ui-components/preview/${encodeURIComponent(comp.name)}`}
                      className="block border border-divider rounded-lg hover:shadow-md hover:border-Interactive transition-all duration-150 bg-background group"
                      passHref
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
                  ))
                ) : (
                  <p className="text-secondary col-span-full">No components found in the '{selectedCategory}' category.</p>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="icons">
          <h2 className="text-xl font-semibold mb-4">Icon Library</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {FIXED_ICON_CATEGORIES.map(category => {
              const count = getCategoryCount(category);
              return (
                <UiButton
                  key={category}
                  variant={selectedIconCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedIconCategory(category)}
                  disabled={count === 0}
                >
                  {category} ({count})
                </UiButton>
              );
            })}
          </div>
          {allIcons.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {selectedIconCategory === 'Hover' ? (
                hoverPairs.map(pair => (
                  <Card
                    key={pair.lightId}
                    className="group flex flex-col items-center text-center hover:bg-gray-100 aspect-square pt-2 cursor-pointer border-divider"
                  >
                    <Icon
                      iconId={pair.lightId}
                      className="w-[55%] h-[55%] fill-primary group-hover:hidden"
                    />
                    <Icon
                      iconId={pair.solidId}
                      className="w-[55%] h-[55%] hidden group-hover:block"
                      style={{ fill: 'var(--color-accent)' }}
                    />
                    <p className="text-xs text-secondary break-all pt-1 mt-auto">
                      {pair.name || getIconInfo(pair.lightId)?.baseName || pair.lightId}
                    </p>
                  </Card>
                ))
              ) : (
                allIcons
                  .filter(iconMeta => {
                    const isAll = selectedIconCategory === 'All';
                    const categoryToCompare = selectedIconCategory.toLowerCase();
                    const iconCategory = iconMeta.category?.toLowerCase();
                    const categoryMatch = iconCategory === categoryToCompare;
                    if (selectedIconCategory === 'Light' && iconMeta.id.endsWith('Light')) return true;
                    if (selectedIconCategory === 'Solid' && iconMeta.id.endsWith('Solid')) return true;
                    if (selectedIconCategory === 'Brands' && iconMeta.id.startsWith('faBrands')) return true;
                    return isAll || categoryMatch;
                  })
                  .map(iconMeta => (
                    <Card
                      key={iconMeta.id}
                      className="group flex flex-col items-center text-center hover:bg-gray-100 aspect-square pt-2 cursor-pointer border-divider"
                    >
                      <Icon
                        iconId={iconMeta.id}
                        className="w-[55%] h-[55%] fill-primary group-hover:fill-[var(--color-accent)]"
                      />
                      <p className="text-xs text-secondary break-all pt-1 mt-auto">
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