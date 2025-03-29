'use client';

import React, { useEffect, useState, useRef } from 'react';
import { browserComponentApi } from '../../api/component-api-browser';
import { ComponentMetadata, Dependency } from '../../db/registry';

// A simplified dependency graph component
export default function DependencyGraph() {
  const [componentNodes, setComponentNodes] = useState<ComponentMetadata[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all components on initial load
  useEffect(() => {
    async function fetchComponents() {
      try {
        setLoading(true);
        const data = await browserComponentApi.getComponents();
        setComponentNodes(data);
        if (data.length > 0) {
          setSelectedComponent(data[0].path);
        }
      } catch (err) {
        setError(`Failed to load components: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchComponents();
  }, []);
  
  // Fetch dependencies when a component is selected
  useEffect(() => {
    if (!selectedComponent) return;
    
    async function fetchDependencies() {
      try {
        setLoading(true);
        // Make sure selectedComponent is not null before passing to API
        const componentPath = selectedComponent;
        if (componentPath) {
          const data = await browserComponentApi.getComponentDependencies(componentPath);
          setDependencies(data);
        }
      } catch (err) {
        setError(`Failed to load dependencies: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDependencies();
  }, [selectedComponent]);
  
  // Render the dependency graph
  const renderDependencyGraph = () => {
    if (!selectedComponent) return null;
    
    const currentComponent = componentNodes.find(c => c.path === selectedComponent);
    if (!currentComponent) return null;
    
    return (
      <div className="p-4 border rounded bg-gray-50 font-mono text-sm">
        <div className="mb-4">
          <div className="font-bold">{currentComponent.name}</div>
          <div className="text-xs text-gray-500">{currentComponent.path}</div>
        </div>
        
        {dependencies.length > 0 ? (
          <>
            <div className="mb-2 font-bold">Dependencies:</div>
            <div className="space-y-2">
              {dependencies.map((dep, index) => (
                <div key={index} className="ml-4">
                  ├─ {dep.target.split('/').pop()} 
                  <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-200">
                    {dep.type}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-gray-500">No dependencies found</div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <span className="text-xl font-semibold">Dependency Graph</span>
        </div>
        <div className="text-gray-600 mb-6">
          Visualize component relationships and dependencies
        </div>
        
        <div className="mb-4">
          <label htmlFor="component-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Component
          </label>
          <div className="flex space-x-2">
            <input
              id="component-search"
              placeholder="Search for a component..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              list="component-options"
              onChange={(e) => {
                const value = e.target.value;
                const component = componentNodes.find(c => 
                  c.name.toLowerCase() === value.toLowerCase() || 
                  c.path.toLowerCase() === value.toLowerCase()
                );
                if (component) {
                  setSelectedComponent(component.path);
                }
              }}
            />
            <datalist id="component-options">
              {componentNodes.map((component) => (
                <option key={component.path} value={component.name}>
                  {component.path}
                </option>
              ))}
            </datalist>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">Loading dependency data...</div>
        ) : error ? (
          <div className="text-red-500 py-4">{error}</div>
        ) : (
          <div className="min-h-[400px]">
            {renderDependencyGraph()}
            <div className="mt-4 text-sm text-gray-500 text-center">
              Note: This is a simplified view. In a complete implementation, 
              an interactive graph visualization would be rendered here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 