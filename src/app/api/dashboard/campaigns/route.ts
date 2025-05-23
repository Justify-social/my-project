import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Use Clerk auth
import { getUpcomingCampaigns } from '@/lib/data/dashboard';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger'; // Adjust path if needed

// Force dynamic rendering/handling for this route
export const dynamic = 'force-dynamic';

// Removed Edge Runtime export
// export const runtime = 'edge';

export async function GET(_request: NextRequest) {
  try {
    // Get userId and orgId using Clerk's auth() helper
    const { userId, orgId } = await auth();

    if (!userId) {
      // Return a new response for unauthorized access
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!orgId) {
      // Return a new response if no active organization is found
      return NextResponse.json(
        { success: false, error: 'Active organization not found or not selected.' },
        { status: 400 }
      );
    }

    // Fetch campaigns using the Clerk userId and orgId
    const campaigns = await getUpcomingCampaigns(userId, orgId);

    // Return standard NextResponse
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('API Error fetching dashboard campaigns:', error);
    // Assuming logger exists and is configured
    dbLogger?.error(
      DbOperation.FETCH,
      'Error fetching dashboard campaigns',
      { apiRoute: '/api/dashboard/campaigns' },
      error instanceof Error ? error : new Error(String(error))
    );
    // Return a new error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard campaigns',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
