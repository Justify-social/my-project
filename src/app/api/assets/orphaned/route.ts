import { NextResponse } from 'next/server';

// Simple in-memory storage for orphaned assets (would be DB in production)
const orphanedAssets: { url: string; assetId: string; timestamp: number }[] = [];

/**
 * POST handler for logging orphaned assets that need cleanup
 */
export async function POST(request: Request) {
  try {
    const { url, assetId } = await request.json();
    
    if (!url || !assetId) {
      return NextResponse.json(
        { error: 'Missing required fields: url and assetId' },
        { status: 400 }
      );
    }
    
    // Store orphaned asset info
    orphanedAssets.push({
      url,
      assetId,
      timestamp: Date.now()
    });
    
    console.log(`Logged orphaned asset: ${assetId} at ${url}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging orphaned asset:', error);
    return NextResponse.json(
      { error: 'Failed to log orphaned asset' },
      { status: 500 }
    );
  }
}

/**
 * GET handler to retrieve orphaned assets for admin cleanup
 */
export async function GET() {
  try {
    // In a production environment, this would be access-controlled
    return NextResponse.json({
      orphanedAssets,
      count: orphanedAssets.length
    });
  } catch (error) {
    console.error('Error retrieving orphaned assets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orphaned assets' },
      { status: 500 }
    );
  }
} 