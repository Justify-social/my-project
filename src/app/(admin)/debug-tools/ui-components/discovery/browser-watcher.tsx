'use client';

/**
 * Browser File Watcher
 * 
 * This component provides a UI for the debug tools that simulates a file watcher
 * in browser environments where actual file system watching is not possible.
 * It presents mock data and UI controls for testing the component registry system.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/atoms/button/Button';
import { Card } from '@/components/ui/atoms/card/Card';
import path from '../utils/path-browser-mock';

interface BrowserWatcherProps {
  onComponentFound?: (componentPath: string) => void;
}

/**
 * Mock component database for browser simulation
 */
const MOCK_COMPONENTS = [
  {
    path: '/src/components/ui/atoms/button/Button.tsx',
    name: 'Button',
    category: 'atom'
  },
  {
    path: '/src/components/ui/atoms/input/Input.tsx',
    name: 'Input',
    category: 'atom'
  },
  {
    path: '/src/components/ui/molecules/card/Card.tsx',
    name: 'Card',
    category: 'molecule'
  },
  {
    path: '/src/components/ui/molecules/select/Select.tsx',
    name: 'Select',
    category: 'molecule'
  },
  {
    path: '/src/components/ui/organisms/calendar/Calendar.tsx',
    name: 'Calendar',
    category: 'organism'
  }
];

/**
 * BrowserFileWatcher provides a UI for simulating file watching in browser environments
 */
export function BrowserFileWatcher({ onComponentFound }: BrowserWatcherProps) {
  const [mockActivityLog, setMockActivityLog] = useState<string[]>([]);
  const [isWatching, setIsWatching] = useState(false);
  const [discoveredComponents, setDiscoveredComponents] = useState<typeof MOCK_COMPONENTS>([]);
  
  // Simulate initial file discovery
  useEffect(() => {
    if (isWatching) {
      const startTime = Date.now();
      setMockActivityLog(prev => [...prev, 'Starting component discovery...']);
      
      // Simulate async discovery of components with delays
      const discoverComponents = async () => {
        for (let i = 0; i < MOCK_COMPONENTS.length; i++) {
          // Simulate varying processing times
          const delay = 200 + Math.random() * 500;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          const component = MOCK_COMPONENTS[i];
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
          `Component discovery completed in ${totalTime}s. Found ${MOCK_COMPONENTS.length} components.`
        ]);
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
    const mockComponent = {
      path: mockPath,
      name: `MockComponent${timestamp}`,
      category: 'atom'
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