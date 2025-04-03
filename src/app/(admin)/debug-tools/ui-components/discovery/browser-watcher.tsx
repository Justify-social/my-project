'use client';

/**
 * Browser File Watcher
 * 
 * This component provides a UI for the debug tools that simulates a file watcher
 * in browser environments where actual file system watching is not possible.
 * It presents mock data and UI controls for testing the component registry system.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/atoms/button';
import { Card } from '@/components/ui/atoms/card';
import { browserComponentApi } from '../api/component-api-browser';
import type { ComponentMetadata } from '../db/registry';

interface BrowserWatcherProps {
  onComponentFound?: (componentPath: string) => void;
}

/**
 * BrowserFileWatcher provides a UI for simulating file watching in browser environments
 */
export function BrowserFileWatcher({ onComponentFound }: BrowserWatcherProps) {
  const [mockActivityLog, setMockActivityLog] = useState<string[]>([]);
  const [isWatching, setIsWatching] = useState(false);
  const [discoveredComponents, setDiscoveredComponents] = useState<ComponentMetadata[]>([]);
  
  // Simulate initial file discovery
  useEffect(() => {
    if (isWatching) {
      const startTime = Date.now();
      setMockActivityLog(prev => [...prev, 'Starting component discovery...']);
      
      // Fetch components from the registry API
      const discoverComponents = async () => {
        try {
          const components = await browserComponentApi.getComponents();
          
          // Process components with simulated delays for UI feedback
          for (let i = 0; i < components.length; i++) {
            // Simulate varying processing times
            const delay = 200 + Math.random() * 500;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            const component = components[i];
            setMockActivityLog(prev => [
              ...prev, 
              `Discovered component: ${component.name} (${component.category}) at ${component.path}`
            ]);
            
            setDiscoveredComponents(prev => [...prev, component]);
            
            if (onComponentFound) {
              onComponentFound(component.path);
            }
          }
          
          const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
          setMockActivityLog(prev => [
            ...prev, 
            `Component discovery completed in ${totalTime}s. Found ${components.length} components.`
          ]);
        } catch (error) {
          console.error('Error fetching components:', error);
          setMockActivityLog(prev => [
            ...prev,
            `Error discovering components: ${error instanceof Error ? error.message : String(error)}`
          ]);
        }
      };
      
      discoverComponents();
    } else {
      setDiscoveredComponents([]);
    }
  }, [isWatching, onComponentFound]);

  // Simulate random component changes
  useEffect(() => {
    if (!isWatching || discoveredComponents.length === 0) return;
    
    const interval = setInterval(() => {
      // 20% chance of a random component change
      if (Math.random() > 0.8) {
        const randomIndex = Math.floor(Math.random() * discoveredComponents.length);
        const component = discoveredComponents[randomIndex];
        
        setMockActivityLog(prev => [
          ...prev, 
          `Component changed: ${component.name} at ${component.path}`
        ]);
        
        if (onComponentFound) {
          onComponentFound(component.path);
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isWatching, discoveredComponents, onComponentFound]);

  const toggleWatching = () => {
    if (isWatching) {
      setMockActivityLog(prev => [...prev, 'Stopped component watching']);
    } else {
      setMockActivityLog(['Started component watching']);
    }
    setIsWatching(!isWatching);
  };

  const addMockComponent = () => {
    const timestamp = Date.now();
    const mockPath = `/src/components/ui/atoms/mock/MockComponent${timestamp}.tsx`;
    const mockComponent: ComponentMetadata = {
      id: `mock-${timestamp}`,
      path: mockPath,
      name: `MockComponent${timestamp}`,
      category: 'atom',
      description: 'Auto-generated component for testing',
      examples: [],
      props: [],
      dependencies: [],
      tags: ['mock', 'auto-generated']
    };
    
    setMockActivityLog(prev => [
      ...prev, 
      `New component created: ${mockComponent.name} at ${mockComponent.path}`
    ]);
    
    setDiscoveredComponents(prev => [...prev, mockComponent]);
    
    if (onComponentFound) {
      onComponentFound(mockComponent.path);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
          <p className="text-blue-700 text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              <strong>Autoloading Enabled:</strong> Components are now automatically loaded on page initialization. 
              The manual discovery below is still available for testing.
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={toggleWatching}
            variant={isWatching ? "destructive" : "default"}
          >
            {isWatching ? 'Stop Watching' : 'Start Watching'}
          </Button>
          
          {isWatching && (
            <Button onClick={addMockComponent}>
              Simulate New Component
            </Button>
          )}
        </div>
      </div>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Discovered Components ({discoveredComponents.length})</h3>
        <ul className="space-y-1">
          {discoveredComponents.map((component) => (
            <li key={component.path} className="text-sm">
              <span className="font-medium">{component.name}</span>
              <span className="text-gray-500 ml-2">({component.category})</span>
              <span className="text-gray-400 text-xs ml-2">{component.path}</span>
            </li>
          ))}
        </ul>
      </Card>
      
      <Card className="p-4 max-h-80 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
        <ul className="space-y-1 text-sm font-mono">
          {mockActivityLog.map((log, index) => (
            <li key={index} className="text-xs border-l-2 border-gray-300 pl-2">
              {log}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default BrowserFileWatcher; 