'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, Input } from '../components/ui-components-bridge';
import { Icon } from '@/components/ui/atoms/icons'
import { ComponentMetadata, ComponentCategory, UIComponent } from '../types';
import { ComponentRegistryManager } from '../registry/ComponentRegistryManager';
import { RefreshCw, Search, Filter, ArrowRight, Eye, X } from 'lucide-react';
import ComponentPreview from './ComponentPreview';

/**
 * Client-only component list
 * This component handles loading and displaying components using the registry manager
 * It's loaded dynamically to avoid server-side Node.js imports
 */
export default function ClientOnlyComponentsList() {
  const [discoveredComponents, setDiscoveredComponents] = useState<ComponentMetadata[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<ComponentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentMetadata | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');

  // Handle search and filtering
  useEffect(() => {
    if (!discoveredComponents.length) {
      setFilteredComponents([]);
      return;
    }

    let results = [...discoveredComponents];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(component => 
        component.name.toLowerCase().includes(term) || 
        component.path.toLowerCase().includes(term) || 
        (component.description?.toLowerCase() || '').includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(component => component.category === selectedCategory);
    }

    setFilteredComponents(results);
  }, [searchTerm, selectedCategory, discoveredComponents]);

  // Initial loading
  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the registry manager singleton
      const registryManager = ComponentRegistryManager.getInstance();
      
      // Add a listener for registry changes
      const handleRegistryUpdate = () => {
        const components = registryManager.getAllComponents();
        console.info(`Registry updated: ${components.length} components available`);
        setDiscoveredComponents(components);
      };
      
      registryManager.addListener(handleRegistryUpdate);
      
      // Initialize the registry (will load from appropriate sources)
      await registryManager.initialize();
      
      // Initial fetch of components
      handleRegistryUpdate();
      
      setIsLoading(false);
      
      // Cleanup listener on unmount
      return () => registryManager.removeListener(handleRegistryUpdate);
    } catch (error) {
      console.error('Failed to initialize component registry:', error);
      setError('Failed to load components. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Force refresh from API
      const response = await fetch('/api/component-registry?refresh=true');
      if (!response.ok) {
        throw new Error('Failed to refresh components');
      }
      
      // Wait for the response
      const data = await response.json();
      console.log('Refreshed component data:', data);
      
      // Re-initialize the registry
      const registryManager = ComponentRegistryManager.getInstance();
      
      // Reset and re-initialize
      registryManager.reset();
      await registryManager.initialize();
      
      // Components will update through the listener
    } catch (error) {
      console.error('Error refreshing components:', error);
      setError('Failed to refresh components. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleComponentSelect = (component: ComponentMetadata) => {
    setSelectedComponent(component);
    // Switch to split view when selecting a component
    setViewMode('split');
  };

  const handleClosePreview = () => {
    setSelectedComponent(null);
    setViewMode('grid');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00BFFF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
        <h3 className="font-semibold text-lg mb-2">Error loading components</h3>
        <div className="flex flex-col gap-4">
          <p>{error}</p>
          <p className="text-sm">This may be due to a chunk loading error or a problem with the component registry.</p>
          <button 
            onClick={handleRetry}
            className="self-start px-4 py-2 bg-white border border-red-300 rounded-md flex items-center hover:bg-red-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (discoveredComponents.length === 0) {
    return (
      <div className="col-span-3 flex flex-col items-center justify-center py-16 text-gray-400">
        <div className="w-12 h-12 mb-3 text-[#00BFFF]">
          <Icon 
            name="faPaintbrush"
            variant="solid"
            className="w-full h-full"
          />
        </div>
        <p className="text-lg mb-2">No components discovered yet</p>
        <p className="mb-6">Components will appear here when discovered</p>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-[#00BFFF] hover:bg-[#0077B6] text-white flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Components'}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Search Field */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search components..."
            className="pl-8 pr-4 py-2 bg-white rounded-md border shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Category Filter */}
        <div className="relative">
          <select
            className="bg-white rounded-md border shadow-sm px-4 py-2 appearance-none pr-8"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="atom">Atoms</option>
            <option value="molecule">Molecules</option>
            <option value="organism">Organisms</option>
          </select>
          <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center bg-white border rounded-md shadow-sm">
          <button
            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-500'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`px-3 py-2 ${viewMode === 'split' ? 'bg-gray-100 text-gray-800' : 'text-gray-500'}`}
            onClick={() => setViewMode('split')}
          >
            Split
          </button>
        </div>
        
        {/* Refresh Button */}
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="ml-auto bg-white hover:bg-gray-50 border shadow-sm text-gray-700 flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {/* Statistics */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredComponents.length} of {discoveredComponents.length} components
      </div>
      
      {filteredComponents.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No components match your search criteria</p>
        </div>
      ) : viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Components List */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="overflow-y-auto max-h-[70vh] pr-4">
              {filteredComponents.map((component, index) => (
                <div 
                  key={index} 
                  className={`mb-3 border rounded-md p-3 cursor-pointer transition-colors 
                    ${selectedComponent?.name === component.name 
                      ? 'border-[#00BFFF] bg-blue-50'
                      : 'hover:border-gray-300'}`}
                  onClick={() => handleComponentSelect(component)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{component.name}</h3>
                    <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded">
                      {component.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate" title={component.path}>{component.path}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Component Preview */}
          <div className="md:col-span-7 lg:col-span-8">
            {selectedComponent ? (
              <ComponentPreview 
                component={selectedComponent} 
                onClose={handleClosePreview}
              />
            ) : (
              <div className="border rounded-md p-8 flex flex-col items-center justify-center h-64 bg-gray-50 text-gray-400">
                <Eye className="w-8 h-8 mb-3" />
                <p>Select a component to preview</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((component, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{component.name}</h3>
                <Button
                  onClick={() => handleComponentSelect(component)}
                  className="text-xs bg-white border hover:bg-gray-50 text-gray-700 flex items-center py-1 px-2 h-auto"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              </div>
              <p className="text-sm text-gray-500 truncate" title={component.path}>{component.path}</p>
              <div className="mt-2 flex gap-2">
                <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded">
                  {component.category}
                </span>
                {component.exports && component.exports.length > 0 && (
                  <span className="inline-block bg-blue-50 text-xs px-2 py-1 rounded text-blue-700">
                    {component.exports.length} exports
                  </span>
                )}
              </div>
              {component.description && (
                <p className="mt-2 text-sm text-gray-600">{component.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Bottom Preview Panel for Selected Component */}
      {selectedComponent && viewMode === 'grid' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <button 
            onClick={handleClosePreview}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{selectedComponent.name}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComponentPreview component={selectedComponent} />
          </div>
        </div>
      )}
    </div>
  );
} 