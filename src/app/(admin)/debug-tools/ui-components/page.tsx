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
import { Icon } from '@/components/ui/atoms/icon/Icon';
import { ComponentMetadata } from './db/registry';
import { ComponentRegistryManager } from './registry/ComponentRegistryManager';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import ComponentsLoadingSkeleton from './components/ComponentsLoadingSkeleton';
import SelectedComponentView from './components/SelectedComponentView';
import { ComponentsGrid } from './components/ComponentsGrid';
import { Palette } from './features/design-system/Palette';
import { IconLibrary } from './features/icon-library/IconLibrary';
import IconDemo from './features/icon-demo/IconDemo';

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
  const searchParams = useSearchParams();
  const defaultTab = searchParams?.get('tab') ?? 'components';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after component mounts
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded w-full mt-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 w-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1">UI Component Debug Tools</h1>
        <p className="text-gray-500">
          Discover, document, and visualize UI components in the codebase
          {isBrowser && ' (Browser Mode)'}
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="components" 
            className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-[#00BFFF] data-[state=active]:shadow-sm transition-all duration-200"
          >
            Components
          </TabsTrigger>
          <TabsTrigger 
            value="icons" 
            className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-[#00BFFF] data-[state=active]:shadow-sm transition-all duration-200"
          >
            Icons
          </TabsTrigger>
          <TabsTrigger 
            value="discovery" 
            className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-[#00BFFF] data-[state=active]:shadow-sm transition-all duration-200"
          >
            Discovery
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-[#00BFFF] data-[state=active]:shadow-sm transition-all duration-200"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-4">
          <Card className="w-full p-4">
            <h2 className="text-xl font-semibold mb-4 text-[#333333] flex items-center">
              <span className="w-6 h-6 mr-2 text-[#00BFFF] flex items-center justify-center">
                <Icon iconId="faPaletteLight"
                  variant="light"
                  className="w-5 h-5"
                />
              </span>
              Component Library
            </h2>

            {/* Use client-only component list to avoid server-side Node.js imports */}
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ClientOnlyComponentsList />
            </ErrorBoundary>
            
            {/* Display selected component */}
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <SelectedComponentView />
            </ErrorBoundary>
          </Card>
        </TabsContent>

        <TabsContent value="icons" className="space-y-4">
          <Card className="w-full p-4">
            <h2 className="text-xl font-semibold mb-4 text-[#333333] flex items-center">
              <span className="w-6 h-6 mr-2 text-[#00BFFF] flex items-center justify-center">
                <Icon iconId="faIconsLight"
                  variant="light"
                  className="w-5 h-5"
                />
              </span>
              Icon Library
            </h2>
            
            {/* Icon Library Component */}
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <IconLibraryComponent />
            </ErrorBoundary>
            
            {/* New Icon System Demo */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-[#333333] flex items-center">
                <span className="w-6 h-6 mr-2 text-[#00BFFF] flex items-center justify-center">
                  <Icon iconId="faWandMagicLight"
                    variant="light"
                    className="w-5 h-5"
                  />
                </span>
                New Icon System
              </h3>
              
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <IconDemo />
              </ErrorBoundary>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="discovery" className="space-y-4">
          <Card className="w-full p-4">
            <h2 className="text-xl font-semibold mb-4 text-[#333333] flex items-center">
              <span className="w-6 h-6 mr-2 text-[#00BFFF]">
                <Icon iconId="faQuestionLight"  size={24} />
              </span>
              Component Discovery
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              {isBrowser 
                ? 'Browser environment detected. Using simulated component discovery.' 
                : 'Server environment detected. Using filesystem component discovery.'}
            </p>
            
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {isBrowser ? (
                // Browser-only UI for simulating file watching
                <BrowserFileWatcher onComponentFound={(path: string) => console.log(`Component found: ${path}`)} />
              ) : (
                // Server-side functionality would be rendered here
                <div className="py-4 text-gray-400 text-center">
                  Server-side file watching UI would be shown here
                </div>
              )}
            </ErrorBoundary>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="w-full p-4">
            <h2 className="text-xl font-semibold mb-4 text-[#333333] flex items-center">
              <span className="w-6 h-6 mr-2 text-[#00BFFF]">
                <Icon iconId="faQuestionLight"  size={24} />
              </span>
              Settings
            </h2>
            <div className="grid gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Component Paths</label>
                <input 
                  type="text" 
                  placeholder="/src/components/ui"
                  className="border rounded p-2 text-sm"
                  disabled={isBrowser}
                />
                {isBrowser && (
                  <p className="text-xs text-amber-500">
                    Path configuration is only available in server environments
                  </p>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Auto-Discovery</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="auto-discovery"
                    disabled={isBrowser}
                  />
                  <label htmlFor="auto-discovery" className="text-sm">
                    Enable automatic component discovery
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Icon Library</h2>
          <IconLibrary />
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Color Palette</h2>
          <Palette />
        </div>
      </div>
    </div>
  );
} 