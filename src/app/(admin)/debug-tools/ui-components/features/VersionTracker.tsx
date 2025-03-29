'use client';

import React, { useState, useEffect } from 'react';
import { browserComponentApi } from '../api/component-api-browser';
import { ComponentMetadata, Change } from '../db/registry';

// A simplified version tracker component
export default function VersionTracker() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentMetadata[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);

  // Load components on mount
  useEffect(() => {
    async function loadComponents() {
      try {
        setLoading(true);
        const data = await browserComponentApi.getComponents();
        setComponents(data);
        if (data.length > 0 && !selectedComponent) {
          setSelectedComponent(data[0].path);
        }
      } catch (error) {
        console.error('Failed to load components:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadComponents();
  }, []);

  // Load component changes when a component is selected
  useEffect(() => {
    async function loadChanges() {
      if (!selectedComponent) return;
      
      try {
        setLoading(true);
        const changeHistory = await browserComponentApi.getComponentChanges(selectedComponent);
        setChanges(changeHistory);
      } catch (error) {
        console.error('Failed to load change history:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadChanges();
  }, [selectedComponent]);

  // Format date for display
  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <span className="text-xl font-semibold">Version Tracker</span>
        </div>
        <div className="text-gray-600 mb-6">
          Track changes across all UI components
        </div>

        <div className="mb-6">
          <label htmlFor="component-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Component
          </label>
          <select
            id="component-select"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedComponent || ''}
            onChange={(e) => setSelectedComponent(e.target.value)}
            disabled={loading}
          >
            {components.map((component) => (
              <option key={component.path} value={component.path}>
                {component.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading change history...</div>
        ) : (
          <div className="space-y-4">
            {changes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No change history available for this component.
              </div>
            ) : (
              <div className="space-y-4">
                {changes.map((change, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{change.description}</h3>
                            <p className="text-sm text-gray-600 mt-1">v{change.version}</p>
                          </div>
                          <div className="px-2 py-1 text-xs rounded bg-gray-100">
                            {change.isBreaking ? 'Breaking' : 'Minor'}
                          </div>
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <div className="flex items-center mr-4">
                            {formatDate(change.date)}
                          </div>
                          <div className="flex items-center">
                            <span className="font-mono">{change.author}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 