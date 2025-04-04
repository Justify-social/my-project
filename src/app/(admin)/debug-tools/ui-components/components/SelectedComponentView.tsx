'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ComponentMetadata } from '../db/registry';
import { browserComponentApi } from '../api/component-api-browser';
import ComponentPreview from './ComponentPreview';
import { Card, CardContent } from './ui-components-bridge';
import { Icon } from '@/components/ui/atoms/icon';

/**
 * SelectedComponentView
 * 
 * Handles loading and displaying a component selected via URL query parameter
 */
export default function SelectedComponentView() {
  const searchParams = useSearchParams();
  const [selectedComponent, setSelectedComponent] = useState<ComponentMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the component path from the URL query parameter
  const componentPath = searchParams?.get('component');
  
  // Load the selected component when the componentPath changes
  useEffect(() => {
    if (!componentPath) {
      setSelectedComponent(null);
      return;
    }
    
    const loadSelectedComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch component metadata from the API
        const component = await browserComponentApi.getComponentMetadata(componentPath);
        
        if (component) {
          setSelectedComponent(component);
        } else {
          setError(`Component not found: ${componentPath}`);
        }
      } catch (err) {
        console.error('Error loading component:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading the component');
      } finally {
        setLoading(false);
      }
    };
    
    loadSelectedComponent();
  }, [componentPath]);
  
  // If no component is selected, show a placeholder
  if (!componentPath) {
    return (
      <Card className="mt-8 p-6">
        <div className="flex flex-col items-center justify-center text-center p-8">
          <Icon iconId="faCubesLight" className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Component Selected</h3>
          <p className="text-gray-500 max-w-md">
            Select a component from the list to preview it here. You'll be able to view the component,
            inspect its props, and see example code.
          </p>
        </div>
      </Card>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <Card className="mt-8">
        <CardContent className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-gray-600">Loading component...</span>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h3 className="font-medium mb-2">Error Loading Component</h3>
            <p>{error}</p>
            <p className="text-sm mt-4">
              This might be because the component no longer exists or there was an issue with the server.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render the component preview if we have a selected component
  if (selectedComponent) {
    return (
      <div className="mt-8">
        <ComponentPreview 
          component={selectedComponent}
          onClose={() => {
            // Clear the component parameter from the URL
            const url = new URL(window.location.href);
            url.searchParams.delete('component');
            window.history.pushState({}, '', url);
            setSelectedComponent(null);
          }}
        />
      </div>
    );
  }
  
  // Fallback if selectedComponent is null but componentPath exists (shouldn't normally happen)
  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
          <h3 className="font-medium mb-2">Component Not Found</h3>
          <p>Could not find component: {componentPath}</p>
        </div>
      </CardContent>
    </Card>
  );
} 