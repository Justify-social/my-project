import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Use Clerk auth
import { logError } from '@/lib/error-logging';
import { getGraphitiTelemetry } from '@/lib/middleware/cursor-ai';

// Define expected structure for sessionClaims metadata
interface SessionClaimsMetadata {
  role?: string;
}

interface CustomSessionClaims {
  metadata?: SessionClaimsMetadata;
}

// Internal API endpoint to retrieve Graphiti telemetry data
// This is for monitoring and debugging purposes only
export async function GET(req: NextRequest) {
  try {
    // Check authentication and authorization using Clerk
    const { userId, sessionClaims } = await auth();
    const metadata = (sessionClaims as CustomSessionClaims | null)?.metadata;
    const userRole = metadata?.role;

    if (!userId || (!userRole?.includes('admin') && !userRole?.includes('super_admin'))) {
      console.warn(`Unauthorized access attempt to Graphiti telemetry by user ${userId || 'unknown'}`);
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Get telemetry data
    const telemetryData = getGraphitiTelemetry();

    // Additional stats
    const stats = {
      activeSessions: telemetryData.activeSessions.length,
      checkCount: telemetryData.telemetry.filter((t: { action: string }) => t.action === 'check').length,
      blockCount: telemetryData.telemetry.filter((t: { action: string }) => t.action === 'block').length,
      completeCount: telemetryData.telemetry.filter((t: { action: string }) => t.action === 'complete').length,
      bypassCount: telemetryData.telemetry.filter((t: { action: string }) => t.action === 'bypass').length,
      successRate: calculateSuccessRate(telemetryData.telemetry),
    };

    return NextResponse.json({
      telemetry: telemetryData,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error retrieving Graphiti telemetry:', error);
    return NextResponse.json({ error: 'Error retrieving telemetry data' }, { status: 500 });
  }
}

// Calculate success rate from telemetry records
function calculateSuccessRate(telemetry: { success: boolean }[]) {
  if (telemetry.length === 0) return 100;

  const successCount = telemetry.filter(t => t.success).length;
  return Math.round((successCount / telemetry.length) * 100);
}
