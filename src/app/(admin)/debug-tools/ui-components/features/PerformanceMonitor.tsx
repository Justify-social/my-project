'use client';

import React, { useState, useEffect } from 'react';
import { browserComponentApi } from '../api/component-api-browser';
import { ComponentMetadata } from '../db/registry';

// A simplified performance monitor component to show metrics
export default function PerformanceMonitor() {
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<ComponentMetadata[]>([]);

  // Load component data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await browserComponentApi.getComponents();
        setComponents(data);
      } catch (error) {
        console.error('Failed to load component data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <span className="text-xl font-semibold">Performance Monitor</span>
        </div>
        <div className="text-gray-600 mb-6">
          Monitor and optimize component performance metrics
        </div>

        {loading ? (
          <div className="text-center py-8">Loading performance data...</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <div className="flex items-start">
                <div className="mr-2">⚠️</div>
                <div>
                  <div className="font-medium">Performance Issues Detected</div>
                  <div className="text-sm">
                    Some components have higher than expected render times. Consider optimizing.
                  </div>
                </div>
              </div>
            </div>
            
            {components.map((component) => (
              <div key={component.path} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{component.name}</h3>
                    <p className="text-sm text-gray-500">{component.path}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">⏱️</span>
                    <span>{component.performanceMetrics?.renderTime}ms</span>
                    <span className="ml-2 px-2 py-1 text-xs rounded bg-gray-100">
                      {component.performanceMetrics?.renderTime < 1 ? 'Fast' : 'Slow'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 