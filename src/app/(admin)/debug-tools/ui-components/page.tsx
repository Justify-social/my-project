'use client';

import React, { useEffect, useState } from 'react';
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
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  ListFilter, 
  RefreshCw,
  Component as ComponentIcon,
  Clock,
  Layers,
  History,
  ActivitySquare,
  BarChart3
} from 'lucide-react';
import { 
  componentApi, 
  ComponentChangeEvent, 
  ComponentsResult, 
  GetComponentsOptions 
} from './components/ui-components-bridge';
import { ComponentMetadata } from './db/registry';
import ComponentSection from './components/ComponentSection';
import VersionTracker from './features/VersionTracker';
import PerformanceMonitor from './features/PerformanceMonitor';
import ComponentRegistry from './features/registry/ComponentRegistry';
import DependencyGraph from './features/dependency-graph/DependencyGraph';
import IconLibrary from './features/icon-library/IconLibrary';
import AutomatedDocs from './features/automated-docs/AutomatedDocs';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Conditionally import components based on environment
const BrowserFileWatcher = dynamic(() => import('./discovery/browser-watcher'), { ssr: false });

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
  const [discoveredComponents, setDiscoveredComponents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial loading
  useEffect(() => {
    // Simulate data loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle component discovery events
  const handleComponentFound = (componentPath: string) => {
    console.log(`Component found: ${componentPath}`);
    // In a real implementation, this would update state with component metadata
  };

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
              <span className="w-6 h-6 mr-2 text-[#00BFFF]">
                <ComponentIcon size={24} />
              </span>
              Component Library
            </h2>
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00BFFF]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoveredComponents.length > 0 ? (
                  discoveredComponents.map((component, index) => (
                    <Card key={index} className="p-4">
                      <h3 className="font-medium">{component.name}</h3>
                      <p className="text-sm text-gray-500">{component.path}</p>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 flex flex-col items-center justify-center py-16 text-gray-400">
                    <div className="w-20 h-20 mb-4 text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="w-full h-full">
                        <path d="M339.3 367.1c27.3-3.9 51.9-19.4 67.2-42.9L568.2 74.1c12.6-19.5 9.4-45.3-7.6-61.2S517.7-4.4 499.1 9.6L262.4 187.2c-24 18-38.2 46.1-38.4 76.1L339.3 367.1zm-19.6 25.4l-116-104.4C143.9 290.3 96 339.6 96 400c0 3.9 .2 7.8 .6 11.6C98.4 429.1 86.4 448 68.8 448H64c-17.7 0-32 14.3-32 32s14.3 32 32 32H208c61.9 0 112-50.1 112-112c0-2.5-.1-5-.2-7.5z"/>
                      </svg>
                    </div>
                    <p className="text-lg mb-2">No components discovered yet</p>
                    <p className="mb-6">Use the Discovery tab to scan for components</p>
                    <Button 
                      onClick={() => setActiveTab('discovery')}
                      className="bg-[#00BFFF] hover:bg-[#0077B6] text-white transition-all duration-300 px-6 py-2 rounded-md shadow-sm hover:shadow-md transform hover:-translate-y-1"
                    >
                      Go to Discovery
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="discovery" className="space-y-4">
          <Card className="w-full p-4">
            <h2 className="text-xl font-semibold mb-4 text-[#333333] flex items-center">
              <span className="w-6 h-6 mr-2 text-[#00BFFF]">
                <Search size={24} />
              </span>
              Component Discovery
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              {isBrowser 
                ? 'Browser environment detected. Using simulated component discovery.' 
                : 'Server environment detected. Using filesystem component discovery.'}
            </p>
            
            {isBrowser ? (
              // Browser-only UI for simulating file watching
              <BrowserFileWatcher onComponentFound={handleComponentFound} />
            ) : (
              // Server-side functionality would be rendered here
              <div className="py-4 text-gray-400 text-center">
                Server-side file watching UI would be shown here
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="w-full p-4">
            <h2 className="text-xl font-semibold mb-4 text-[#333333] flex items-center">
              <span className="w-6 h-6 mr-2 text-[#00BFFF]">
                <Filter size={24} />
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
    </div>
  );
} 