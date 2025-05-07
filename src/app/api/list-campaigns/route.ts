import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { getAllCampaignsForUser } from '@/lib/data/campaigns'; // Import the new function
import { UnauthenticatedError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    // TODO: Implement parsing of filter query parameters (status, search, etc.)
    // const searchParams = req.nextUrl.searchParams;
    // const statusFilter = searchParams.get('status');
    // ... etc

    // Call the data fetching function (passing filters in the future)
    const campaigns = await getAllCampaignsForUser(userId);

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    logger.error('Error in /api/list-campaigns:', { error: error.message });
    // Use the shared error handler
    return handleApiError(error, req);
  }
}
