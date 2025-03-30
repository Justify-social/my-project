import React, { useState, useEffect } from 'react';
import { componentRegistryManager } from '../../services/ComponentRegistryManager';

export function ClientOnlyComponentsList() {
  const [isLoading, setIsLoading] = useState(true);
  const [componentsData, setComponentsData] = useState(null);

  useEffect(() => {
    // Initial loading
    componentRegistryManager.getData()
      .then(componentData => {
        if (componentData.success && componentData.data) {
          setComponentsData(componentData.data);
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error('Error loading component registry:', error);
        setIsLoading(false);
      });

    // Subscription for updates
    const subscription = componentRegistryManager.subscribe((newData) => {
      if (newData.success && newData.data) {
        // Only update if we have components to prevent flickering to 0
        if (newData.data.components && newData.data.components.length > 0) {
          setComponentsData(newData.data);
        } else {
          console.warn('Received empty component data, ignoring to prevent UI flicker');
        }
      }
      console.log('Refreshed component data:', newData);
    });

    return () => {
      // ... existing code ...
    };
  }, []);

  // Log component updates but never reset to 0
  useEffect(() => {
    if (componentsData && componentsData.components) {
      // Only log when we have components to prevent confusing logs about "0 components"
      if (componentsData.components.length > 0) {
        console.log('Registry updated:', componentsData.components.length, 'components available');
      }
    }
  }, [componentsData]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-gray-600">Loading component registry...</p>
      </div>
    );
  }

  if (!componentsData || !componentsData.components || componentsData.components.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No components found in the registry. This could be due to a build issue or missing component files.
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            setIsLoading(true);
            componentRegistryManager.refreshData(true)
              .then(() => setIsLoading(false))
              .catch(() => setIsLoading(false));
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry Loading Components
        </button>
      </div>
    );
  }

  // ... existing code ...
} 