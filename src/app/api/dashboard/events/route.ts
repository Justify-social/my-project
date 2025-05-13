import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Ensure Clerk auth is imported
import { getUpcomingEvents } from '@/lib/data/dashboard';
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
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: 'Active organization not found or not selected.' },
        { status: 400 }
      );
    }

    // Fetch events using the Clerk userId and orgId
    const events = await getUpcomingEvents(userId, orgId);

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('API Error fetching dashboard events:', error);
    dbLogger?.error(
      DbOperation.FETCH,
      'Error fetching dashboard events',
      { apiRoute: '/api/dashboard/events' },
      error instanceof Error ? error : new Error(String(error))
    );
    // Return a new error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard events',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
