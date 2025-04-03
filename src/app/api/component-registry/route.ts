import { NextResponse } from 'next/server';
import { discoverComponents } from '@/app/(admin)/debug-tools/ui-components/utils/component-discovery';
import type { ComponentMetadata } from '@/app/(admin)/debug-tools/ui-components/types';

/**
 * API endpoint that serves as the Single Source of Truth for component registry data
 * This provides detailed metadata about all UI components for the preview system
 */

// Cache variables
let registryCache: ComponentMetadata[] | null = null;
let lastRefreshTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached data if available and fresh
    if (registryCache && now - lastRefreshTime < CACHE_TTL) {
      console.log('Using cached component registry');
      return NextResponse.json({
        components: registryCache,
        timestamp: now,
        source: 'cache'
      });
    }
    
    // Discover components fresh
    console.log('Building component registry...');
    const startTime = Date.now();
    
    // Get all components
    const components = await discoverComponents();
    
    // Enhanced components with additional metadata
    const enhancedComponents = components.map((component: ComponentMetadata) => {
      // Extract component category and name
      const pathParts = component.path.split('/');
      const category = component.category || 'unknown';
      const name = component.name || pathParts[pathParts.length - 1];
      
      // Add additional metadata for previewing
      return {
        ...component,
        name,
        category,
        displayName: name.replace(/([A-Z])/g, ' $1').trim(),
        group: component.path.includes('/atoms/') ? 'atoms' : 
               component.path.includes('/molecules/') ? 'molecules' : 
               component.path.includes('/organisms/') ? 'organisms' : 'other',
        timestamp: now
      } as ComponentMetadata;
    });
    
    // Cache the registry
    registryCache = enhancedComponents;
    lastRefreshTime = now;
    
    const discoveryTime = Date.now() - startTime;
    console.log(`Registry built in ${discoveryTime}ms with ${enhancedComponents.length} components`);
    
    return NextResponse.json({
      components: enhancedComponents,
      timestamp: now,
      discoveryTime
    });
    
  } catch (error) {
    console.error('Error building component registry:', error);
    return NextResponse.json(
      { 
        error: 'Failed to build component registry',
        message: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      }, 
      { status: 500 }
    );
  }
} 