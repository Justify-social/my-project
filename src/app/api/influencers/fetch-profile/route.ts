import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { influencerService } from '@/services/influencer';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const handle = searchParams.get('handle');
  const platform = searchParams.get('platform'); // Read platform string

  logger.info(`[API /influencers/fetch-profile] GET request received`, { handle, platform });

  if (!handle || !platform) {
    logger.warn('[API /influencers/fetch-profile] Missing handle or platform query parameter');
    return NextResponse.json(
      { success: false, error: 'Missing required handle or platform parameter.' },
      { status: 400 }
    );
  }

  try {
    // Call the new service function
    const profileData = await influencerService.getAndMapProfileByHandleAndPlatform(
      handle,
      platform
    );

    if (profileData) {
      logger.info(
        `[API /influencers/fetch-profile] Successfully processed profile for handle: ${handle}`
      );
      return NextResponse.json({ success: true, data: profileData });
    } else {
      logger.warn(
        `[API /influencers/fetch-profile] Service returned null for handle: ${handle}. Treating as Not Found.`
      );
      return NextResponse.json(
        { success: false, error: 'Influencer profile not found.' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'Unknown internal error';
    logger.error(
      `[API /influencers/fetch-profile] Error processing profile for handle ${handle}:`,
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
