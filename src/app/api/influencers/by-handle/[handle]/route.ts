import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { influencerService } from '@/services/influencer'; // Use the service layer

export async function GET(request: NextRequest, { params }: { params: { handle: string } }) {
  const handle = params.handle ? decodeURIComponent(params.handle) : null;

  logger.info(`[API /influencers/by-handle] GET request received for handle: ${handle}`);

  if (!handle) {
    logger.warn('[API /influencers/by-handle] Missing handle in path parameters');
    return NextResponse.json(
      { success: false, error: 'Missing required handle parameter.' },
      { status: 400 }
    );
  }

  try {
    // Call the new service function (to be created)
    const profileData = await influencerService.getAndMapProfileByHandle(handle);

    if (profileData) {
      logger.info(
        `[API /influencers/by-handle] Successfully processed profile for handle: ${handle}`
      );
      return NextResponse.json({ success: true, data: profileData });
    } else {
      logger.warn(
        `[API /influencers/by-handle] Service returned null for handle: ${handle}. Treating as Not Found.`
      );
      return NextResponse.json(
        { success: false, error: 'Influencer profile not found.' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'Unknown internal error';
    logger.error(
      `[API /influencers/by-handle] Error processing profile for handle ${handle}:`,
      message,
      error
    );
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: 'Failed to process influencer profile', details: message },
      { status: statusCode }
    );
  }
}
