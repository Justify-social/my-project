/**
 * Component Registry API Route
 * 
 * This API route provides component registry data to client-side code.
 * It acts as a backend bridge for the server-only component registry.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDevRegistry, getDevelopmentRegistry } from '@/app/(admin)/debug-tools/ui-components/api/development-registry';

/**
 * GET /api/components/registry
 * Returns the component registry data
 */
export async function GET(request: NextRequest) {
  try {
    const registry = await getDevelopmentRegistry();
    
    return NextResponse.json(registry);
  } catch (error) {
    console.error('Error serving component registry:', error);
    return NextResponse.json(
      { error: 'Failed to get component registry', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/components/registry/rescan
 * Rescans components and returns the updated registry
 * Only available in development mode
 */
export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }
  
  // Check if this is the rescan endpoint
  const { pathname } = new URL(request.url);
  const isRescan = pathname.endsWith('/rescan');
  
  if (isRescan) {
    try {
      // Force a fresh registry generation
      const registry = await generateDevRegistry();
      
      return NextResponse.json({
        success: true,
        message: `Registry regenerated with ${registry.components.length} components`,
        registry
      });
    } catch (error) {
      console.error('Error rescanning components:', error);
      return NextResponse.json(
        { error: 'Failed to rescan components', details: String(error) },
        { status: 500 }
      );
    }
  }
  
  // For any other POST requests to this endpoint
  return NextResponse.json(
    { error: 'Unknown action' },
    { status: 400 }
  );
} 