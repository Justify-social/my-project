'use client'; // This directive might not be needed for API routes, review if causing issues

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '@/utils/logger';
// Assuming makePhylloRequest can be imported or is available
// If not, we need to define it or import from phylloService
// For now, assume it's available or define basic fetch logic

const PHYLLO_BASE_URL = process.env.PHYLLO_BASE_URL;
const PHYLLO_CLIENT_ID = process.env.PHYLLO_CLIENT_ID;
const PHYLLO_CLIENT_SECRET = process.env.PHYLLO_CLIENT_SECRET;

const prisma = new PrismaClient();

/**
 * Generates the Basic Auth header value.
 * Centralized function for consistency.
 */
function getBasicAuthHeader(): string {
  if (!PHYLLO_CLIENT_ID || !PHYLLO_CLIENT_SECRET) {
    logger.error('[API Phyllo SdkToken] Missing Phyllo Client ID or Secret.');
    throw new Error('Phyllo Client ID or Secret is missing.');
  }
  const credentials = `${PHYLLO_CLIENT_ID}:${PHYLLO_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

// Define the products needed for the Influencer Marketplace MVP
// Reference: https://docs.getphyllo.com/docs/api-reference/reference/products
const REQUIRED_PRODUCTS = [
  'IDENTITY', // For user verification status (isPhylloVerified)
  'IDENTITY.PROFILE', // Basic profile info like name, handle, bio, avatar (confirm if needed or use ANALYTICS)
  // 'PROFILE.ANALYTICS', // Consider using this instead of IDENTITY.PROFILE for richer data like followers? Verify overlap.
  'ENGAGEMENT', // For engagement metrics like likes, comments (if not in ANALYTICS)
  'ENGAGEMENT.AUDIENCE', // For audience demographics (age, gender, location)
  // Add other products if needed, e.g., 'INCOME' (Post-MVP)
];

// --- Helper: Phyllo API Request --- (Basic fetch for this example)
// Ideally, import makePhylloRequest from phylloService.ts
async function makePhylloApiRequest(endpoint: string, options: RequestInit = {}) {
  if (!PHYLLO_BASE_URL) throw new Error('Missing PHYLLO_BASE_URL');
  const url = `${PHYLLO_BASE_URL}${endpoint}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };

  // Note: Token management (getAccessToken) is skipped here for brevity,
  // but the real phylloService handles it.
  // Basic auth used directly for user/token endpoints.
  const authHeader = getBasicAuthHeader();

  logger.debug(`[Phyllo API] Requesting: ${options.method || 'GET'} ${url}`);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      Authorization: authHeader,
      ...options.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    logger.error(`[Phyllo API] Error ${response.status}:`, result);
    const error = new Error(result?.details || `Phyllo API Error (${response.status})`);
    (error as any).status = response.status;
    (error as any).phylloError = result;
    throw error;
  }
  return result;
}

// --- Zod Schema for Request Body ---
const RequestBodySchema = z.object({
  marketplaceInfluencerId: z
    .string()
    .uuid({ message: 'Valid Marketplace Influencer ID is required' }),
});

export async function POST(req: NextRequest) {
  logger.info('[API Phyllo SdkToken] Request received');
  if (!PHYLLO_BASE_URL || !PHYLLO_CLIENT_ID || !PHYLLO_CLIENT_SECRET) {
    logger.error('[API Phyllo SdkToken] Runtime Error: Missing Phyllo credentials.');
    return NextResponse.json({ error: 'Phyllo configuration error' }, { status: 503 });
  }

  let phylloUserId: string | null | undefined = null;
  let influencerName: string = 'Influencer'; // Default name

  try {
    // --- Validate Request Body ---
    const body = await req.json();
    const validationResult = RequestBodySchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('[API Phyllo SdkToken] Invalid request body:', validationResult.error.flatten());
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }
    const { marketplaceInfluencerId } = validationResult.data;
    logger.info(
      `[API Phyllo SdkToken] Processing request for MarketplaceInfluencer ID: ${marketplaceInfluencerId}`
    );

    // --- Find Influencer and Phyllo User ID ---
    const influencer = await prisma.marketplaceInfluencer.findUnique({
      where: { id: marketplaceInfluencerId },
      select: { phylloUserId: true, name: true }, // Select needed fields
    });

    if (!influencer) {
      logger.error(
        `[API Phyllo SdkToken] MarketplaceInfluencer not found for ID: ${marketplaceInfluencerId}`
      );
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
    }
    influencerName = influencer.name; // Store name for potential user creation
    phylloUserId = influencer.phylloUserId;

    // --- Create Phyllo User if needed ---
    if (!phylloUserId) {
      logger.info(
        `[API Phyllo SdkToken] No existing Phyllo User ID found for ${marketplaceInfluencerId}. Creating new Phyllo user...`
      );
      try {
        const newUserPayload = {
          name: influencerName,
          external_id: marketplaceInfluencerId, // Link using our stable ID
        };
        logger.debug(
          '[API Phyllo SdkToken] Calling Phyllo POST /v1/users with payload:',
          newUserPayload
        );

        const newUserResponse = await makePhylloApiRequest('/v1/users', {
          method: 'POST',
          body: JSON.stringify(newUserPayload),
        });

        if (!newUserResponse || !newUserResponse.id) {
          throw new Error('Failed to create Phyllo user: Invalid response');
        }
        phylloUserId = newUserResponse.id;
        logger.info(
          `[API Phyllo SdkToken] Successfully created Phyllo user ${phylloUserId} for ${marketplaceInfluencerId}. Updating DB...`
        );

        // Update MarketplaceInfluencer record with the new phylloUserId
        await prisma.marketplaceInfluencer.update({
          where: { id: marketplaceInfluencerId },
          data: { phylloUserId: phylloUserId },
        });
        logger.info(
          `[API Phyllo SdkToken] DB updated successfully for ${marketplaceInfluencerId}.`
        );
      } catch (createUserError: any) {
        logger.error(
          `[API Phyllo SdkToken] Error creating Phyllo user for ${marketplaceInfluencerId}:`,
          createUserError
        );
        // Handle potential duplicate external_id errors from Phyllo if needed
        return NextResponse.json(
          {
            error: 'Failed to create or link Phyllo user',
            details: createUserError.message,
            phylloError: createUserError.phylloError,
          },
          { status: createUserError.status || 500 }
        );
      }
    } else {
      logger.info(
        `[API Phyllo SdkToken] Found existing Phyllo User ID: ${phylloUserId} for ${marketplaceInfluencerId}`
      );
    }

    // --- Generate SDK Token ---
    logger.info(`[API Phyllo SdkToken] Requesting SDK token for Phyllo User ID: ${phylloUserId}`);
    const tokenPayload = {
      user_id: phylloUserId,
      products: REQUIRED_PRODUCTS,
    };
    logger.debug(
      '[API Phyllo SdkToken] Calling Phyllo POST /v1/sdk-tokens with payload:',
      tokenPayload
    );

    const tokenResponse = await makePhylloApiRequest('/v1/sdk-tokens', {
      method: 'POST',
      body: JSON.stringify(tokenPayload),
    });

    logger.info(
      `[API Phyllo SdkToken] Successfully generated SDK token for Phyllo User ID: ${phylloUserId}`
    );
    return NextResponse.json(tokenResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    const status = (err as any).status || 500;
    const phylloError = (err as any).phylloError;
    logger.error('[API Phyllo SdkToken] General error:', message);
    return NextResponse.json(
      { error: 'Failed to process SDK token request', details: message, phylloError: phylloError },
      { status: status }
    );
  }
}
