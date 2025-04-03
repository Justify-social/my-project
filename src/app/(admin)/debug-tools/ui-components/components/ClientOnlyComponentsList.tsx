'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/molecules/skeleton/Skeleton';

/**
 * Component metadata interface
 */
interface ComponentMeta {
  name: string;
  path: string;
  category: string;
  exports: string[];
}

/**
 * Client-only component list that fetches components from the API
 * This solves the "glob is not defined" error by not using glob directly in client code
 */
export default function ClientOnlyComponentsList() {
  const [components, setComponents] = useState<ComponentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCache, setHasCache] = useState<boolean>(false);

  // Fetch components function - extracted for reusability
  const fetchComponents = useCallback(async (force = false) => {
    try {
      setLoading(true);
      
      // Add a cache busting parameter if force refresh is requested
      const url = force 
        ? `/api/components/discover?force=true&t=${Date.now()}` 
        : '/api/components/discover';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch components: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.components)) {
        // Check if data came from cache
        setHasCache(data.source === 'cache');
        
        // Filter out any invalid components
        const validComponents = data.components.filter(
          (c: any) => c && c.name && c.path
        );
        
        if (validComponents.length > 0) {
          setComponents(validComponents);
          // Store components in sessionStorage as a backup
          try {
            sessionStorage.setItem('ui-components-cache', JSON.stringify(validComponents));
          } catch (e) {
            console.warn('Failed to cache components in sessionStorage:', e);
          }
        } else {
          throw new Error('No valid components found in API response');
        }
      } else {
        throw new Error('Invalid component data received from API');
      }
    } catch (err) {
      console.error('Error fetching components:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Try to load from sessionStorage cache as fallback
      try {
        const cachedData = sessionStorage.getItem('ui-components-cache');
        if (cachedData) {
          const cachedComponents = JSON.parse(cachedData);
          if (Array.isArray(cachedComponents) && cachedComponents.length > 0) {
            console.log('Using cached components from sessionStorage');
            setComponents(cachedComponents);
            setHasCache(true);
            return; // Exit if we successfully used cache
          }
        }
      } catch (cacheErr) {
        console.warn('Failed to load cached components:', cacheErr);
      }
      
      // Ultimate fallback: hardcoded essential components
      setComponents([
        {
          name: 'Button',
          path: '@/components/ui/atoms/button/Button',
          category: 'atom',
          exports: ['Button']
        },
        {
          name: 'Alert',
          path: '@/components/ui/atoms/alert/Alert',
          category: 'atom',
          exports: ['Alert']
        },
        {
          name: 'Typography',
          path: '@/components/ui/atoms/typography/Typography',
          category: 'atom',
          exports: ['Typography']
        },
        {
          name: 'Paragraph',
          path: '@/components/ui/atoms/typography/Paragraph',
          category: 'atom', 
          exports: ['Paragraph']
        },
        {
          name: 'Text',
          path: '@/components/ui/atoms/typography/Text',
          category: 'atom',
          exports: ['Text']
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial loading
    fetchComponents()
      .catch(error => {
        console.error('Unhandled error in fetchComponents:', error);
        setLoading(false);
      });
  }, [fetchComponents]);

  // Group components by category
  const componentsByCategory = React.useMemo(() => {
    return components.reduce((acc, component) => {
      const category = component.category || 'unknown';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(component);
      return acc;
    }, {} as Record<string, ComponentMeta[]>);
  }, [components]);

  // Get sorted categories
  const categories = Object.keys(componentsByCategory).sort();

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Loading Components...</h2>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && components.length === 0) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Error Loading Components</h2>
        <p className="mb-3">{error}</p>
        <button 
          onClick={() => fetchComponents(true)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry Component Loading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Components ({components.length})</h2>
        {(error || hasCache) && (
          <button 
            onClick={() => fetchComponents(true)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        )}
      </div>
      
      {error && (
        <div className="p-3 border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800">
          <p className="text-sm">
            Warning: Using fallback or cached components due to an error. Some components may be missing.
          </p>
        </div>
      )}
      
      {categories.map(category => {
        const categoryComponents = componentsByCategory[category];
        const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1) + 's';
        
        return (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-medium">{capitalizedCategory} ({categoryComponents.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryComponents.map((component, index) => (
                <Link
                  key={`${category}-${component.name}-${index}`}
                  href={`/debug-tools/ui-components?component=${encodeURIComponent(component.path)}`}
                  className="px-4 py-3 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium">{component.name}</div>
                  <div className="text-xs text-gray-500 truncate">{component.path}</div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
      
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm">
        <p>
          Click on any component tile to see its preview. All components follow the standardized UI component
          architecture patterns and are automatically discovered from the codebase.
        </p>
      </div>
    </div>
  );
} 