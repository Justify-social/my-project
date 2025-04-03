import { NextRequest, NextResponse } from 'next/server';
import { discoverComponents } from '@/app/(admin)/debug-tools/ui-components/utils/component-discovery';

// Define component types
interface ComponentInfo {
  name: string;
  path: string;
  category?: string;
  exports?: string[];
  isDefaultExport?: boolean;
  [key: string]: any; // Allow additional properties
}

export async function GET(req: NextRequest) {
  try {
    console.log('Starting component validation...');
    
    // Try to discover components
    const startTime = Date.now();
    const components = await discoverComponents() as ComponentInfo[];
    const duration = Date.now() - startTime;
    
    // Validate that we got an array of components
    if (!Array.isArray(components)) {
      console.error('Component discovery did not return an array:', typeof components);
      return NextResponse.json({
        status: 'error',
        message: 'Component discovery did not return an array',
        type: typeof components
      }, { status: 500 });
    }
    
    // Count components by category
    const categories: Record<string, number> = {};
    components.forEach(component => {
      const category = component.category || 'unknown';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    // Check if some important components exist
    const criticalComponents = ['Button', 'Alert', 'Modal', 'Skeleton'];
    const foundCritical = criticalComponents.map(name => ({
      name,
      found: components.some(c => c.name === name)
    }));
    
    // Build validation result
    const result = {
      status: 'success',
      timestamp: new Date().toISOString(),
      validation: {
        totalComponents: components.length,
        discoveryDurationMs: duration,
        categoryCounts: categories,
        criticalComponents: foundCritical,
        allCriticalFound: foundCritical.every(c => c.found)
      },
      // Include first 10 components as a sample
      componentSample: components.slice(0, 10).map(c => ({
        name: c.name,
        path: c.path,
        category: c.category || 'unknown'
      }))
    };
    
    console.log(`Validation completed, found ${components.length} components`);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error during component validation:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error during validation',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 