'use client';

/**
 * UI Components Bridge
 * 
 * This file acts as a bridge between server components and UI components.
 * It re-exports all the UI components needed in the UI Components debug tools
 * to work around Turbopack's issue with server-relative imports.
 */

// Re-export from atoms
export { Button } from '@/components/ui/atoms/button';
export { Badge } from '@/components/ui/atoms/badge';
export { Input } from '@/components/ui/atoms/input';
export { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/atoms/card';

// Remove separator if it doesn't exist
// export { Separator } from '@/components/ui/atoms/separator';

// Re-export from molecules
export { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/molecules/accordion';
export { ScrollArea } from '@/components/ui/molecules/scroll-area';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/molecules/tabs';

// Import types for the component API
import type { ComponentChangeEvent, ComponentsResult, GetComponentsOptions } from '../api/component-api';
export type { ComponentChangeEvent, ComponentsResult, GetComponentsOptions };

// Import the original ComponentApi for server environment
import { ComponentApi } from '../api/component-api';
export { ComponentApi };

// Create a browser-friendly mock of the ComponentApi
const isBrowser = typeof window !== 'undefined';

// Mock component data for browser environment
const mockComponents = [
  {
    path: 'src/components/ui/atoms/button/Button.tsx',
    name: 'Button',
    category: 'atom',
    lastUpdated: new Date(),
    exports: ['Button'],
    props: [
      { name: 'variant', type: 'string', required: false, defaultValue: "'primary'" },
      { name: 'size', type: 'string', required: false, defaultValue: "'md'" },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false' }
    ],
    description: 'UI button component with variants'
  },
  {
    path: 'src/components/ui/atoms/badge/Badge.tsx',
    name: 'Badge',
    category: 'atom',
    lastUpdated: new Date(),
    exports: ['Badge'],
    props: [
      { name: 'variant', type: 'string', required: false, defaultValue: "'primary'" }
    ],
    description: 'UI badge component'
  },
  {
    path: 'src/components/ui/molecules/accordion/Accordion.tsx',
    name: 'Accordion',
    category: 'molecule',
    lastUpdated: new Date(),
    exports: ['Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent'],
    props: [
      { name: 'type', type: 'string', required: false, defaultValue: "'single'" },
      { name: 'collapsible', type: 'boolean', required: false, defaultValue: 'true' }
    ],
    description: 'Accordion component for collapsible content'
  },
  {
    path: 'src/components/ui/organisms/Calendar/Calendar.tsx',
    name: 'Calendar',
    category: 'organism',
    lastUpdated: new Date(),
    exports: ['Calendar', 'DatePicker'],
    props: [
      { name: 'mode', type: 'string', required: false, defaultValue: "'single'" },
      { name: 'selected', type: 'Date', required: false, defaultValue: undefined }
    ],
    description: 'Calendar and date picker component'
  }
];

// Create the componentApi object based on environment
export const componentApi = isBrowser
  ? {
      // Browser-safe implementations
      getComponents: (options?: GetComponentsOptions): Promise<any> => {
        console.info('Using browser mock for getComponents');
        
        // Apply search filter if provided
        let filteredComponents = [...mockComponents];
        if (options?.search) {
          const search = options.search.toLowerCase();
          filteredComponents = filteredComponents.filter(
            comp => comp.name.toLowerCase().includes(search) || 
                   comp.description.toLowerCase().includes(search)
          );
        }
        
        // Apply category filter if provided
        if (options?.category) {
          filteredComponents = filteredComponents.filter(
            comp => comp.category === options.category
          );
        }
        
        // Format response as needed
        const result = {
          items: filteredComponents,
          total: filteredComponents.length,
          hasMore: false
        };
        
        return Promise.resolve(result);
      },
      
      getComponent: (path: string): Promise<any> => {
        const component = mockComponents.find(c => c.path === path);
        return Promise.resolve(component || null);
      },
      
      getDependents: (): Promise<any[]> => {
        return Promise.resolve([]);
      },
      
      getPerformanceMetrics: (): Promise<any[]> => {
        return Promise.resolve([]);
      },
      
      getLatestChanges: (): Promise<any[]> => {
        return Promise.resolve([]);
      },
      
      getPerformanceRegressions: (): Promise<any[]> => {
        return Promise.resolve([]);
      },
      
      rescanComponents: (): Promise<void> => {
        console.info('Component scanning not available in browser environment');
        return Promise.resolve();
      },
      
      addChangeListener: (listener: (event: ComponentChangeEvent) => void): void => {
        console.info('Change listeners not available in browser environment');
      },
      
      removeChangeListener: (listener: (event: ComponentChangeEvent) => void): void => {
        console.info('Change listeners not available in browser environment');
      }
    }
  : new ComponentApi(); // Use the real implementation on the server

// Export a default to satisfy ESM
export default function UiComponentsBridge() {
  return null;
} 