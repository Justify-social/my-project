import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getUpcomingCampaigns } from '@/lib/data/dashboard';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger'; // Adjust path if needed

// Force dynamic rendering/handling for this route
export const dynamic = 'force-dynamic';

// Removed Edge Runtime export
// export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const response = new NextResponse();
  try {
    // Pass request and response to getSession
    const session = await getSession(request, response);
    const user = session?.user;

    if (!user?.sub) {
      // Return a new response for unauthorized access
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.sub;
    const campaigns = await getUpcomingCampaigns(userId);

    // Return standard NextResponse, passing the response object
    return NextResponse.json({ success: true, data: campaigns }, response);
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
