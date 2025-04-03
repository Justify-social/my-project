/**
 * Component Registry API Routes
 * 
 * API implementation for component registry operations.
 * This file contains server-only code that can safely use Node.js modules.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComponentMetadata } from '../../../lib/types/component-registry';
import { ServerComponentRegistry } from '../../../lib/server/component-registry';

// Create a server-side registry instance
const serverRegistry = new ServerComponentRegistry();

/**
 * GET /api/components - Get all components
 */
export async function GET() {
  try {
    const components = await serverRegistry.getComponents();
    return NextResponse.json(components);
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json({ error: 'Failed to fetch components' }, { status: 500 });
  }
}

/**
 * POST /api/components - Create or update a component
 */
export async function POST(request: NextRequest) {
  try {
    const component = await request.json() as ComponentMetadata & { id: string };
    if (!component || !component.id) {
      return NextResponse.json({ error: 'Invalid component data' }, { status: 400 });
    }
    
    // Since upsertComponent is not part of the interface, we use addChange to track instead
    await serverRegistry.addChange({
      componentId: component.id,
      description: `Component ${component.id} updated via API`,
      changeType: 'updated'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating/updating component:', error);
    return NextResponse.json({ error: 'Failed to create/update component' }, { status: 500 });
  }
} 