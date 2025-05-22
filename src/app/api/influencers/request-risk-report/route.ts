import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { submitSocialProfileScreeningRequest } from '@/lib/insightiqService'; // Import the new service function
import { getInsightIQWorkPlatformId, getPlatformUrlPrefix } from '@/lib/insightiqUtils'; // Import utils
import { findPlatformEnumByValue } from '@/services/influencer'; // Import helper from influencer service (or move to utils)

const RequestBodySchema = z.object({
  identifier: z.string().min(1, 'Identifier cannot be empty'),
  platform: z.string().min(1, 'Platform cannot be empty'),
});

export async function POST(request: NextRequest) {
  logger.info('[API /request-risk-report] POST request received');
  const { userId } = await auth();

  if (!userId) {
    logger.warn('[API /request-risk-report] Unauthorized attempt');
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = RequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn(
        '[API /request-risk-report] Invalid request body:',
        validationResult.error.flatten()
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { identifier, platform } = validationResult.data;

    // Map platform string to PlatformEnum
    const platformEnum = findPlatformEnumByValue(platform);
    if (!platformEnum) {
      logger.error(`[API /request-risk-report] Could not map platform string: ${platform}`);
      return NextResponse.json(
        { success: false, error: 'Invalid platform provided' },
        { status: 400 }
      );
    }

    // Get InsightIQ work_platform_id
    const workPlatformId = getInsightIQWorkPlatformId(platformEnum);
    if (!workPlatformId) {
      logger.error(
        `[API /request-risk-report] Could not get InsightIQ work_platform_id for: ${platformEnum}`
      );
      return NextResponse.json(
        { success: false, error: 'Internal platform mapping error' },
        { status: 500 }
      );
    }

    // Construct the profile URL (assuming identifier is handle)
    // Might need adjustment if identifier is external_id or full URL
    const platformPrefix = getPlatformUrlPrefix(platformEnum);
    if (!platformPrefix) {
      logger.error(`[API /request-risk-report] Could not get URL prefix for: ${platformEnum}`);
      return NextResponse.json(
        { success: false, error: 'Internal platform URL error' },
        { status: 500 }
      );
    }
    const profileUrl = `${platformPrefix}${identifier}`;
    logger.info(`[API /request-risk-report] Constructed profile URL: ${profileUrl}`);

    // Call the InsightIQ service function
    const { jobId, error } = await submitSocialProfileScreeningRequest(profileUrl, workPlatformId);

    if (error || !jobId) {
      logger.error('[API /request-risk-report] Failed to submit screening request to InsightIQ:', {
        error,
      });
      return NextResponse.json(
        { success: false, error: error || 'Failed to initiate screening request' },
        { status: 500 }
      );
    }

    logger.info(
      `[API /request-risk-report] Successfully submitted screening request. Job ID: ${jobId}`
    );
    // TODO: Store the jobId associated with the user/influencer for later lookup/webhook processing

    // Return 202 Accepted to indicate the async job started
    return NextResponse.json({ success: true, jobId: jobId }, { status: 202 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    // Check if the error object has a status code, default to 500 if not
    let status = 500;
    if (typeof error === 'object' && error !== null) {
      if (
        'response' in error &&
        typeof (error as any).response === 'object' &&
        (error as any).response !== null &&
        'status' in (error as any).response &&
        typeof (error as any).response.status === 'number'
      ) {
        status = (error as any).response.status;
      } else if ('status' in error && typeof (error as any).status === 'number') {
        status = (error as any).status;
      }
    }
    logger.error('[API /request-risk-report] Unexpected error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: status });
  }
}
