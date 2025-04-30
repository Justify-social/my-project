import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger'; // Assuming logger path
import { createInsightIQUser } from '@/lib/insightiqService'; // Import placeholder
import { InsightIQUserRequest, InsightIQUserResponse } from '@/types/insightiq'; // Import types

/**
 * API Route: POST /api/insightiq/create-user
 * Handles the creation of a user entity within InsightIQ.
 * Needed for the connection flow if InsightIQ requires a user mapping.
 */
export async function POST(req: NextRequest) {
  logger.info('[API /insightiq/create-user] Received POST request');

  try {
    const body = await req.json();
    // Validate required fields based on InsightIQ API Docs (InsightIQUserRequest type)
    const { external_id, name } = body as InsightIQUserRequest;

    if (!external_id || !name) {
      logger.warn('[API /insightiq/create-user] Missing required parameters: external_id or name');
      return NextResponse.json(
        { error: 'Missing required parameters: external_id, name' },
        { status: 400 }
      );
    }

    logger.info(
      `[API /insightiq/create-user] Requesting user creation for external_id: ${external_id}`
    );

    // Call the service function
    const result: InsightIQUserResponse | null = await createInsightIQUser({ name, external_id });

    if (!result) {
      // Refine based on actual service errors
      logger.error('[API /insightiq/create-user] InsightIQ user creation failed.');
      return NextResponse.json(
        { error: 'InsightIQ user creation failed' },
        { status: 500 } // Or appropriate error from service
      );
    }

    // Extract relevant data from the actual InsightIQ response type
    logger.info(`[API /insightiq/create-user] Successfully created user: ${result.id}`);
    return NextResponse.json(result); // Return the actual response
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    logger.error('[API /insightiq/create-user] Failed to process request:', message);
    return NextResponse.json(
      { error: 'Failed to process InsightIQ user creation request', details: message },
      { status: 500 }
    );
  }
}
