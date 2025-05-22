import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { getAllCampaignsForOrg } from '@/lib/data/campaigns'; // Updated import
import { UnauthenticatedError } from '@/lib/errors'; // Removed BadRequestError

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId, orgId } = await auth(); // Fetch orgId

    if (!clerkUserId) {
      // clerkUserId is used for potential "created by me" filter
      throw new UnauthenticatedError('Authentication required.');
    }

    if (!orgId) {
      logger.info('[GET /api/list-campaigns] No active organization found for user.', {
        clerkUserId,
      });
      // As per plan: return empty list or appropriate error/message.
      // Returning empty list with success true, frontend can display a message.
      return NextResponse.json({
        success: true,
        data: [],
        message:
          'No active organization selected. Please select or create an organization to view campaigns.',
      });
    }

    const searchParams = req.nextUrl.searchParams;
    const filterByCreator = searchParams.get('filterByCreator') === 'true';

    const campaigns = await getAllCampaignsForOrg(orgId, filterByCreator ? clerkUserId : undefined);

    logger.info('Successfully fetched campaigns for list', {
      userId: clerkUserId,
      count: campaigns.length,
    });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: unknown) {
    logger.error('Error in /api/list-campaigns:', {
      error: error instanceof Error ? error.message : error,
    });
    return handleApiError(error, req);
  }
}
