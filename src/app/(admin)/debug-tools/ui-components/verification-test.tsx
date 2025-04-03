'use client';

import React, { useEffect, useState } from 'react';
import { discoverComponents } from './utils/component-discovery';
import { createComponentMapEntry } from './utils/component-registry-utils';
import dynamic from 'next/dynamic';

/**
 * Component Verification Test
 * 
 * This component attempts to render all discovered UI components to verify they
 * function correctly in the preview system.
 */
export default function ComponentVerificationTest() {
  const [components, setComponents] = useState<any[]>([]);
  const [renderedComponents, setRenderedComponents] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    try {
      // Discover all components
      const discovered = discoverComponents();
      setComponents(discovered);
      
      // Initialize render status for each component
      const initialRenderStatus: Record<string, boolean> = {};
      discovered.forEach(component => {
        initialRenderStatus[component.name] = false;
      });
      setRenderedComponents(initialRenderStatus);
    } catch (error) {
      console.error('Error discovering components:', error);
    }
  }, []);
  
  // Create a component map for rendering
  const componentMap: Record<string, any> = {};
  components.forEach(component => {
    const defaultProps: Record<string, any> = {};
    
    // Provide sensible default props based on component type
    switch (component.name) {
      // Dialog components
      case 'Modal':
      case 'Dialog':
        defaultProps.isOpen = true;
        defaultProps.onClose = () => {};
        defaultProps.title = "Example Title";
        defaultProps.children = "Example content";
        break;
        
      // Button components
      case 'Button':
      case 'IconButton':
      case 'ButtonWithIcon':
      case 'LinkWithIcon':
      case 'EditButton':
      case 'ViewButton':
      case 'CopyButton':
      case 'DeleteButton':
        defaultProps.onClick = () => {};
        defaultProps.children = "Button Text";
        break;
        
      // Form components
      case 'Input':
      case 'Textarea':
        defaultProps.placeholder = "Enter text here...";
        break;
        
      case 'Select':
      case 'ComposableSelect':
        defaultProps.placeholder = "Select an option";
        defaultProps.options = [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ];
        break;
        
      case 'Checkbox':
      case 'Radio':
      case 'Switch':
      case 'Toggle':
        defaultProps.label = "Toggle option";
        break;
        
      // Content display
      case 'Card':
      case 'Alert':
      case 'Badge':
        defaultProps.children = "Content";
        break;
        
      case 'Table':
      case 'DataGrid':
        defaultProps.data = [
          { id: 1, name: 'Item 1', status: 'Active' },
          { id: 2, name: 'Item 2', status: 'Inactive' }
        ];
        defaultProps.columns = [
          { field: 'name', header: 'Name' },
          { field: 'status', header: 'Status' }
        ];
        break;
        
      // Icons and images
      case 'Icon':
      case 'SolidIcon':
      case 'LightIcon':
        defaultProps.name = "check";
        break;
        
      case 'OptimizedImage':
        defaultProps.src = "/placeholder.jpg";
        defaultProps.alt = "Placeholder image";
        defaultProps.width = 200;
        defaultProps.height = 100;
        break;
        
      // Typography
      case 'Heading':
      case 'Text':
      case 'Paragraph':
      case 'Typography':
      case 'Code':
      case 'Blockquote':
        defaultProps.children = "Text content";
        break;
        
      // Default case
      default:
        defaultProps.children = component.name === 'Label' ? 'Label text' : undefined;
        break;
    }
    
    // Create the dynamic component
    try {
      componentMap[component.name] = dynamic(() => 
        import(component.path)
          .then(mod => {
            // Mark the component as successfully loaded
            setRenderedComponents(prev => ({
              ...prev,
              [component.name]: true
            }));
            return mod[component.name] || mod.default;
          })
          .catch(err => {
            console.error(`Error loading ${component.name}:`, err);
            // Record the error
            setErrors(prev => ({
              ...prev,
              [component.name]: err.message
            }));
            // Return a placeholder component
            return () => (
              <div className="p-4 border border-red-500 rounded bg-red-50 text-red-600">
                Failed to load {component.name}
              </div>
            );
          }),
        { ssr: false }
      );
    } catch (error) {
      console.error(`Error creating dynamic component for ${component.name}:`, error);
    }
  });
  
  // Calculate stats
  const totalComponents = components.length;
  const successfullyRendered = Object.values(renderedComponents).filter(Boolean).length;
  const failedComponents = Object.keys(errors).length;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Component Verification Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-100 rounded">
            <div className="text-2xl font-bold">{totalComponents}</div>
            <div className="text-sm text-gray-600">Total Components</div>
          </div>
          <div className="p-3 bg-green-100 rounded">
            <div className="text-2xl font-bold">{successfullyRendered}</div>
            <div className="text-sm text-gray-600">Successfully Rendered</div>
          </div>
          <div className="p-3 bg-red-100 rounded">
            <div className="text-2xl font-bold">{failedComponents}</div>
            <div className="text-sm text-gray-600">Failed Components</div>
          </div>
        </div>
      </div>
      
      {failedComponents > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Failed Components</h2>
          <div className="space-y-2">
            {Object.entries(errors).map(([component, error]) => (
              <div key={component} className="p-2 bg-white rounded border border-red-200">
                <div className="font-semibold">{component}</div>
                <div className="text-sm text-red-600">{error}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map(component => {
          const ComponentToRender = componentMap[component.name];
          const category = component.category || 'unknown';
          const defaultProps = componentMap[`${component.name}DefaultProps`] || {};
          
          return (
            <div 
              key={component.name} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                <h3 className="font-semibold">{component.name}</h3>
                <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">{category}</span>
              </div>
              
              <div className="p-4 flex items-center justify-center min-h-[120px] bg-white">
                <React.Suspense fallback={<div className="text-gray-400">Loading...</div>}>
                  {ComponentToRender ? (
                    <ComponentToRender {...defaultProps} />
                  ) : (
                    <div className="text-gray-400">Component not available</div>
                  )}
                </React.Suspense>
              </div>
              
              <div className="bg-gray-50 px-4 py-2 border-t text-xs flex justify-between">
                <span>{component.path}</span>
                <span className={renderedComponents[component.name] ? "text-green-600" : "text-yellow-600"}>
                  {renderedComponents[component.name] ? "✓ Rendered" : "⟳ Loading"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 