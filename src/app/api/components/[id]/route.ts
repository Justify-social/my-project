/**
 * Component Registry API Routes: Individual Components
 * 
 * API implementation for operations on individual components.
 * This file contains server-only code that can safely use Node.js modules.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ServerComponentRegistry } from '@/lib/server/component-registry';

// Create a server-side registry instance
const serverRegistry = new ServerComponentRegistry();

/**
 * GET /api/components/:id - Get component by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const component = await serverRegistry.getComponent(params.id);
    
    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    
    return NextResponse.json(component);
  } catch (error) {
    console.error(`Error fetching component with ID ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch component' }, { status: 500 });
  }
}

/**
 * DELETE /api/components/:id - Delete component by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await serverRegistry.deleteComponent(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting component with ID ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete component' }, { status: 500 });
  }
} 