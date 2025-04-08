import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getGraphitiTelemetry } from '@/config/middleware/cursor-ai';

// Internal API endpoint to retrieve Graphiti telemetry data
// This is for monitoring and debugging purposes only
export async function GET(req: NextRequest) {
  try {
    // Only allow authenticated admin users to access this endpoint
    const session = await getSession();
    const userRoles = session?.user?.roles || [];
    
    if (!userRoles.includes('admin') && !userRoles.includes('super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Get telemetry data
    const telemetryData = getGraphitiTelemetry();
    
    // Additional stats
    const stats = {
      activeSessions: telemetryData.activeSessions.length,
      checkCount: telemetryData.telemetry.filter(t => t.action === 'check').length,
      blockCount: telemetryData.telemetry.filter(t => t.action === 'block').length,
      completeCount: telemetryData.telemetry.filter(t => t.action === 'complete').length,
      bypassCount: telemetryData.telemetry.filter(t => t.action === 'bypass').length,
      successRate: calculateSuccessRate(telemetryData.telemetry)
    };
    
    return NextResponse.json({
      telemetry: telemetryData,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving Graphiti telemetry:', error);
    return NextResponse.json(
      { error: 'Error retrieving telemetry data' },
      { status: 500 }
    );
  }
}

// Calculate success rate from telemetry records
function calculateSuccessRate(telemetry: any[]) {
  if (telemetry.length === 0) return 100;
  
  const successCount = telemetry.filter(t => t.success).length;
  return Math.round((successCount / telemetry.length) * 100);
} 