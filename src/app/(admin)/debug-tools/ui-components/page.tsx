// Updated import paths via tree-shake script - 2025-04-01T17:13:32.203Z
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Badge,
  Button
} from './components/ui-components-bridge';
import { Icon } from '@/components/ui/atoms/icon';
import { ComponentMetadata, ComponentRegistryData, STATIC_REGISTRY_PATH } from './db/registry';
import { ComponentRegistryManager } from './registry/ComponentRegistryManager';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import ComponentsLoadingSkeleton from './components/ComponentsLoadingSkeleton';
import SelectedComponentView from './components/SelectedComponentView';
import { ComponentsGrid } from './components/ComponentsGrid';
import { Palette } from './features/design-system';
import { IconLibrary } from './features/icon-library/IconLibrary';
import IconDemo from './features/icon-demo/IconDemo';
import { CategoryFilter } from './components/CategoryFilter';
import { ComponentDetail } from './components/ComponentDetail';

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-md">
    <h3 className="text-lg font-semibold text-red-700 mb-2">Error loading component browser</h3>
    <p className="text-red-600 mb-4">{error.message}</p>
    <p className="text-sm text-red-500">
      This could be due to a chunk loading error or a problem with the component registry.
      Try refreshing the page or clearing your browser cache.
    </p>
    <button 
      onClick={() => window.location.reload()}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
    >
      Reload Page
    </button>
  </div>
);

// Safely load client-only components with error handling
const ClientOnlyComponentsList = dynamic(
  () => import('./components/ClientOnlyComponentsList')
    .then(mod => mod.default)
    .catch(err => {
      console.error('Failed to load ClientOnlyComponentsList:', err);
      return () => (
        <ErrorFallback error={new Error('Failed to load component browser. Please try refreshing the page.')} />
      );
    }),
  { 
    ssr: false,
    loading: () => <ComponentsLoadingSkeleton />
  }
);

// Conditionally import components based on environment
const BrowserFileWatcher = dynamic(
  () => import('./discovery/browser-watcher')
    .then(mod => mod.default)
    .catch(err => {
      console.error('Failed to load BrowserFileWatcher:', err);
      return () => (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h3 className="font-semibold">File watcher could not be loaded</h3>
          <p className="text-sm mt-2">Error: {err.message}</p>
        </div>
      );
    }),
  { 
    ssr: false,
    loading: () => (
      <div className="p-4 border border-gray-200 rounded-md animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }
);

// Use dynamic import for IconLibrary to handle possible import errors
const IconLibraryComponent = dynamic(
  () => import('./features/icon-library/IconLibrary')
    .then(mod => mod.default)
    .catch(err => {
      console.error('Failed to load IconLibrary:', err);
      return () => (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md my-8">
          <h3 className="font-semibold">Icon Library could not be loaded</h3>
          <p>There was an error loading the Icon Library component.</p>
          <p className="text-sm mt-2">Error: {err.message}</p>
        </div>
      );
    }), 
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading Icon Library...</span>
      </div>
    )
  }
);

// Environment detection
const isServer = typeof window === 'undefined';
const isBrowser = !isServer;

/**
 * UI Component Library Dashboard
 * 
 * This page displays a dashboard with information about all registered UI components.
 * It allows filtering, searching, and exploring component details.
 */
export default function UIComponentsPage() {
  const [components, setComponents] = useState<ComponentMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<ComponentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadComponents() {
      try {
        const response = await fetch(STATIC_REGISTRY_PATH);
        if (!response.ok) {
          throw new Error(`Failed to fetch component registry: ${response.status}`);
        }
        const data: ComponentRegistryData = await response.json();
        setComponents(data.components);
      } catch (error) {
        console.error('Error loading component registry:', error);
        // Set mock data for development
        setComponents([
          {
            id: 'button',
            name: 'Button',
            path: '@/components/ui/atoms/button',
            category: 'Atoms',
            description: 'A versatile button component with multiple variants and sizes',
            type: 'Component',
            tags: ['interaction', 'form', 'ui']
          },
          {
            id: 'card',
            name: 'Card',
            path: '@/components/ui/atoms/card',
            category: 'Atoms',
            description: 'Container component for grouping related content',
            type: 'Component',
            tags: ['layout', 'container', 'ui']
          },
          {
            id: 'icon',
            name: 'Icon',
            path: '@/components/ui/atoms/icon',
            category: 'Atoms',
            description: 'SVG icon component with different variants',
            type: 'Component',
            tags: ['visual', 'ui']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadComponents();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleComponentSelect = (component: ComponentMetadata) => {
    setSelectedComponent(component);
  };

  const handleBackToList = () => {
    setSelectedComponent(null);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Loading components...</div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">UI Components</h1>
        {!selectedComponent && (
          <div className="w-1/3 flex justify-end">
            <CategoryFilter
              components={components}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          </div>
        )}
      </div>

      {selectedComponent ? (
        <div>
          <button
            onClick={handleBackToList}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to all components
          </button>
          <ComponentDetail component={selectedComponent} />
        </div>
      ) : (
        <>
          <ComponentsGrid
            components={components}
            filter={searchTerm}
            category={selectedCategory}
            onSelectComponent={handleComponentSelect}
          />
        </>
      )}
    </div>
  );
} 