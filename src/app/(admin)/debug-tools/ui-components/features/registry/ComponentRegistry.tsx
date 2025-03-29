'use client';

import React, { useState, useEffect } from 'react';
import { browserComponentApi } from '../../api/component-api-browser';
import { ComponentMetadata } from '../../db/registry';

/**
 * Component Registry
 * Displays all available UI components in the library
 */
const ComponentRegistry: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<ComponentMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        setLoading(true);
        const data = await browserComponentApi.getComponents();
        setComponents(data);
      } catch (err) {
        console.error('Failed to load components:', err);
        setError('Failed to load components. Check the console for more information.');
      } finally {
        setLoading(false);
      }
    };

    loadComponents();
  }, []);

  // Group components by category
  const componentsByCategory: Record<string, ComponentMetadata[]> = {};
  components.forEach(component => {
    if (!componentsByCategory[component.category]) {
      componentsByCategory[component.category] = [];
    }
    componentsByCategory[component.category].push(component);
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="mb-8">
            <div className="animate-pulse h-4 bg-gray-200 rounded w-1/6 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(j => (
                <div key={j} className="border rounded-lg p-4">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="animate-pulse h-3 bg-gray-100 rounded w-3/4 mb-1"></div>
                  <div className="animate-pulse h-3 bg-gray-100 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Component Registry</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-6">Component Registry</h2>
      
      {Object.keys(componentsByCategory).length === 0 ? (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p>No components found in the registry.</p>
        </div>
      ) : (
        Object.entries(componentsByCategory).map(([category, comps]) => (
          <div key={category} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comps.map(component => (
                <div key={component.path} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-bold">{component.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{component.path}</p>
                  <p className="text-sm mb-2">{component.description}</p>
                  <div className="text-xs text-gray-500">Last updated: {new Date(component.lastUpdated).toLocaleDateString()}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {component.exports.map(exp => (
                      <span key={exp} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ComponentRegistry; 