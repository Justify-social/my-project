'use client';

/**
 * Browser-compatible component API
 * This version is compatible with client-side usage and does not rely on server-only dependencies
 */

import { ComponentMetadata, Change, Dependency } from '../db/registry';
// Import browser mocks instead of Node.js modules
import fsPromises from '../utils/fs-browser-mock';
import path from '../utils/path-browser-mock';

// Browser-compatible implementation
export const browserComponentApi = {
  /**
   * Get all components in the library
   */
  getComponents: async (): Promise<ComponentMetadata[]> => {
    console.log('Browser: Fetching components with mock data');
    
    // Return mock data for browser context
    return [
      {
        path: '/components/ui/button.tsx',
        name: 'Button',
        category: 'UI',
        lastUpdated: new Date().toISOString(),
        exports: ['Button'],
        props: [
          { name: 'variant', type: 'string', defaultValue: 'default', description: 'Visual style of the button' },
          { name: 'size', type: 'string', defaultValue: 'md', description: 'Size of the button' }
        ],
        description: 'A button component with various styles and sizes',
        examples: ['<Button>Click me</Button>'],
        dependencies: [],
        version: '1.0.0',
        changeHistory: [],
        performanceMetrics: {
          renderTime: '0.5ms',
          memoryUsage: '35kb',
          bundleSize: '2.4kb',
          lastBenchmark: new Date().toISOString()
        }
      },
      {
        path: '/components/ui/card.tsx',
        name: 'Card',
        category: 'UI',
        lastUpdated: new Date().toISOString(),
        exports: ['Card', 'CardHeader', 'CardContent', 'CardFooter'],
        props: [
          { name: 'className', type: 'string', description: 'Additional CSS classes' }
        ],
        description: 'A card container component with header, content, and footer sections',
        examples: ['<Card><CardContent>Content here</CardContent></Card>'],
        dependencies: [],
        version: '1.0.0',
        changeHistory: [],
        performanceMetrics: {
          renderTime: '0.8ms',
          memoryUsage: '40kb',
          bundleSize: '3.1kb',
          lastBenchmark: new Date().toISOString()
        }
      },
      {
        path: '/components/ui/table.tsx',
        name: 'Table',
        category: 'UI',
        lastUpdated: new Date().toISOString(),
        exports: ['Table', 'TableHeader', 'TableRow', 'TableCell'],
        props: [
          { name: 'className', type: 'string', description: 'Additional CSS classes' }
        ],
        description: 'A table component for displaying data in rows and columns',
        examples: ['<Table><TableHeader>...</TableHeader><TableRow>...</TableRow></Table>'],
        dependencies: [],
        version: '1.0.0',
        changeHistory: [],
        performanceMetrics: {
          renderTime: '1.2ms',
          memoryUsage: '45kb',
          bundleSize: '3.8kb',
          lastBenchmark: new Date().toISOString()
        }
      }
    ];
  },

  /**
   * Get metadata for a specific component
   */
  getComponentMetadata: async (componentPath: string): Promise<ComponentMetadata | null> => {
    console.log(`Browser: Fetching component metadata for ${componentPath} with mock data`);
    
    // Mock implementation for browser context
    const components = await browserComponentApi.getComponents();
    return components.find(comp => comp.path === componentPath) || null;
  },

  /**
   * Get change history for a component
   */
  getComponentChanges: async (componentPath: string): Promise<Change[]> => {
    console.log(`Browser: Fetching change history for ${componentPath} with mock data`);
    
    // Mock data for browser context
    return [
      {
        date: new Date().toISOString(),
        author: 'Developer',
        description: 'Initial component creation',
        version: '1.0.0'
      },
      {
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        author: 'Designer',
        description: 'Updated styles to match design system',
        version: '1.1.0'
      }
    ];
  },

  /**
   * Get dependencies for a component
   */
  getComponentDependencies: async (componentPath: string): Promise<Dependency[]> => {
    console.log(`Browser: Fetching dependencies for ${componentPath} with mock data`);
    
    // Mock data for browser context
    return [
      {
        name: 'React',
        version: '18.x',
        path: 'react',
        isExternal: true
      },
      {
        name: 'clsx',
        version: '1.x',
        path: 'clsx',
        isExternal: true
      },
      {
        name: 'tailwind-merge',
        version: '1.x',
        path: 'tailwind-merge',
        isExternal: true
      }
    ];
  }
}; 