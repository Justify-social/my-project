import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { getAllCampaignsForOrg } from '@/lib/data/campaigns'; // Updated import
import { UnauthenticatedError, BadRequestError } from '@/lib/errors'; // Added BadRequestError

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

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    logger.error('Error in /api/list-campaigns:', { error: error.message });
    return handleApiError(error, req);
  }
}
