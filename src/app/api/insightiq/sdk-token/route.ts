// 'use client'; // This directive is not needed for API routes

import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client'; // Keep commented until needed for user lookup
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { getInsightIQSdkConfig } from '@/lib/insightiqService'; // Import implemented service function
import { InsightIQSDKTokenRequest, InsightIQSDKTokenResponse } from '@/types/insightiq'; // Import types

// const prisma = new PrismaClient(); // Keep commented for now

// Define required products based on InsightIQ API Docs / MVP needs
// TODO: Verify exact product names required from InsightIQ Docs
const REQUIRED_PRODUCTS = [
  'IDENTITY',
  'ENGAGEMENT',
  // "ENGAGEMENT.AUDIENCE", // Might get audience via /v1/audience endpoint instead?
  // Add others as needed based on InsightIQ capabilities & MVP scope
];

// --- Zod Schema for Request Body ---
// Requires the InsightIQ User ID (UUID) to generate the token
const RequestBodySchema = z.object({
  userId: z.string().uuid({ message: 'Valid InsightIQ User ID (UUID) is required' }),
  // Omitting marketplaceInfluencerId as token is likely tied to InsightIQ user ID
});

/**
 * API Route: POST /api/insightiq/sdk-token
 * Handles generating the necessary configuration or token to initialize the InsightIQ Connect SDK/Flow.
 */
export async function POST(req: NextRequest) {
  logger.info('[API /insightiq/sdk-token] Request received');

  try {
    // --- Validate Request Body ---
    const body = await req.json();
    const validationResult = RequestBodySchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn(
        '[API /insightiq/sdk-token] Invalid request body:',
        validationResult.error.flatten()
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body: Missing or invalid userId (UUID)',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Extract the InsightIQ User ID
    const { userId } = validationResult.data;

    logger.info(
      `[API /insightiq/sdk-token] Requesting SDK config for InsightIQ User ID: ${userId}`
    );
    // Note: Logic to find/create the InsightIQ user ID based on Justify ID
    // should happen *before* this endpoint is called (e.g., in frontend or another API).

    // --- Generate SDK Token/Config ---
    const tokenRequestData: InsightIQSDKTokenRequest = {
      user_id: userId,
      products: REQUIRED_PRODUCTS,
    };

    const result: InsightIQSDKTokenResponse | null = await getInsightIQSdkConfig(tokenRequestData);

    if (!result) {
      // Refine error handling based on actual service errors
      logger.error('[API /insightiq/sdk-token] Failed to get SDK config.');
      return NextResponse.json(
        { error: 'Failed to get InsightIQ SDK configuration' },
        { status: 500 } // Or appropriate error from service
      );
    }

    logger.info(
      `[API /insightiq/sdk-token] Successfully generated SDK token config for InsightIQ User ID: ${userId}`
    );
    return NextResponse.json(result); // Return actual response
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    logger.error('[API /insightiq/sdk-token] General error:', message);
    return NextResponse.json(
      { error: 'Failed to process SDK token/config request', details: message },
      { status: 500 }
    );
  }
}
