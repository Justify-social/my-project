/**
 * Component Registry API Routes: Change History
 * 
 * API implementation for component change history operations.
 * This file contains server-only code that can safely use Node.js modules.
 */

import { NextRequest, NextResponse } from 'next/server';
import { DBChange } from '@/lib/types/component-registry';
import { ServerComponentRegistry } from '@/lib/server/component-registry';

// Create a server-side registry instance
const serverRegistry = new ServerComponentRegistry();

/**
 * GET /api/components/changes - Get component change history
 */
export async function GET(request: NextRequest) {
  try {
    // Get componentId from query parameter if present
    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get('componentId') || undefined;
    
    const changes = await serverRegistry.getChangeHistory(componentId);
    return NextResponse.json(changes);
  } catch (error) {
    console.error('Error fetching change history:', error);
    return NextResponse.json({ error: 'Failed to fetch change history' }, { status: 500 });
  }
} 