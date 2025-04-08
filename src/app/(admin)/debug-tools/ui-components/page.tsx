/**
 * UI Component Browser
 * 
 * This page displays all UI components with filtering, search,
 * and categorization by atomic design principles.
 */

import { Suspense } from 'react';
import { 
  discoverComponents, 
  groupComponentsByCategory,
  ComponentCategory
} from './utils/discovery';
import { SearchBar } from '@/components/ui/search-bar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getIconClasses } from '@/components/ui/utils/icon-integration';
import { Card, ThemeToggle, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import Link from "next/link";

// Component categories in order
const CATEGORIES: readonly ComponentCategory[] = ['atom', 'molecule', 'organism', 'template', 'page'];

// Category icons mapping
const categoryIcons: Record<string, string> = {
  atom: 'atom',
  molecule: 'molecular',
  organism: 'object-group',
  template: 'table-layout',
  page: 'browser'
};

export default async function ComponentBrowserPage({ 
  searchParams,
}: {
  searchParams?: { 
    query?: string;
    category?: string;
    view?: string;
  };
}) {
  // Get search parameters
  const paramsObj = await searchParams;
  const query = paramsObj?.query || '';
  const categoryFilter = paramsObj?.category || 'all';
  const viewMode = paramsObj?.view || 'grid';

  // Discover components
  const components = await discoverComponents();
  
  // Filter components by search query
  const filteredComponents = query 
    ? components.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : components;
  
  // Filter by category if not 'all'
  const categoryFilteredComponents = categoryFilter !== 'all'
    ? filteredComponents.filter(c => c.category === categoryFilter)
    : filteredComponents;
  
  // Group components by category
  const groupedComponents = await groupComponentsByCategory(categoryFilteredComponents);
  
  // Count components by category
  const categoryCounts: Record<string, number> = CATEGORIES.reduce((acc, category) => {
    acc[category] = groupedComponents[category]?.length || 0;
    return acc;
  }, {} as Record<string, number>);
  
  // Total count
  categoryCounts.all = categoryFilteredComponents.length;
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">UI Component Browser</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
      
      <SearchBar />
      
      <div className="mt-4">
        <Tabs defaultValue={categoryFilter === 'all' ? 'all' : categoryFilter} className="w-full">
          <TabsList className="mb-4 flex flex-wrap gap-1">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <span>All</span>
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-gray-600 bg-gray-100 rounded-full">
                {categoryCounts.all}
              </span>
            </TabsTrigger>
            {CATEGORIES.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="flex items-center gap-2"
              >
                <span className="capitalize">{category}</span>
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-gray-600 bg-gray-100 rounded-full">
                  {categoryCounts[category] || 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 gap-8 mt-8">
        {/* Development Tools Section */}
        <div>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <i className={`${getIconClasses('code')} mr-2`}></i>
            Development Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/debug-tools/ui-components/examples">
              <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <i className={`${getIconClasses('code-compare')} text-primary text-lg`}></i>
                  <div>
                    <h3 className="font-medium">Component Examples</h3>
                    <p className="text-sm text-muted-foreground">View UI component examples</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/debug-tools/ui-components/examples/domain-components">
              <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <i className={`${getIconClasses('chart-line')} text-primary text-lg`}></i>
                  <div>
                    <h3 className="font-medium">Domain Components</h3>
                    <p className="text-sm text-muted-foreground">Charts, KPIs and metrics components</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          {categoryFilteredComponents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-4">
                <i className={getIconClasses('search')}></i>
              </div>
              <h2 className="text-xl font-semibold mb-2">No components found</h2>
              <p className="text-muted-foreground max-w-md">
                {query 
                  ? `No components found matching "${query}"${categoryFilter !== 'all' ? ` in category "${categoryFilter}"` : ''}.` 
                  : `No components found in category "${categoryFilter}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {CATEGORIES.map((category) => {
                // Skip categories with no components
                if (!groupedComponents[category] || groupedComponents[category].length === 0) {
                  return null;
                }
                
                return (
                  <div key={category} id={category}>
                    <h2 className="text-xl font-medium mb-4 flex items-center">
                      <i className={`${getIconClasses(categoryIcons[category])} mr-2`}></i>
                      <span className="capitalize">{category} Components</span>
                      <span className="ml-2 text-sm text-muted-foreground">({groupedComponents[category].length})</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedComponents[category].map((component, index) => (
                        <Link 
                          key={`${category}-component-${component.name}-${index}`} 
                          href={component.documentationUrl || '#'}
                          className={!component.documentationUrl ? 'pointer-events-none' : ''}
                        >
                          <Card className={`p-4 h-full transition-colors ${component.documentationUrl ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-70'}`}>
                            <div className="flex flex-col h-full">
                              <div className="font-medium mb-1">{component.name}</div>
                              {component.description && <p className="text-sm text-muted-foreground">{component.description}</p>}
                              
                              {component.tags && 
                                component.tags.length > 0 && 
                                component.tags.filter(tag => tag !== null && tag !== undefined && tag !== "Unknown" && tag !== "").length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {component.tags
                                    .filter(tag => tag !== null && tag !== undefined && tag !== "Unknown" && tag !== "")
                                    .map((tag, index) => (
                                      <span 
                                        key={`${component.name}-tag-${index}`} 
                                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                </div>
                              )}
                              
                              {!component.documentationUrl && (
                                <div className="mt-auto pt-2 text-xs text-muted-foreground">
                                  Documentation coming soon
                                </div>
                              )}
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
} 