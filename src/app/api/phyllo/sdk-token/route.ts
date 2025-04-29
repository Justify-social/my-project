import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger'; // Assuming logger path

const PHYLLO_BASE_URL = process.env.PHYLLO_BASE_URL;
const PHYLLO_CLIENT_ID = process.env.PHYLLO_CLIENT_ID;
const PHYLLO_CLIENT_SECRET = process.env.PHYLLO_CLIENT_SECRET;

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

export async function POST(req: NextRequest) {
  if (!PHYLLO_BASE_URL || !PHYLLO_CLIENT_ID || !PHYLLO_CLIENT_SECRET) {
    logger.error('[API Phyllo SdkToken] Runtime Error: Missing Phyllo credentials.');
    return NextResponse.json({ error: 'Phyllo configuration error' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { user_id } = body;
    if (!user_id) {
      logger.warn('[API Phyllo SdkToken] Missing user_id parameter.');
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const apiUrl = `${PHYLLO_BASE_URL}/v1/sdk-tokens`;
    logger.info(`[API Phyllo SdkToken] Requesting SDK token for user_id: ${user_id}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getBasicAuthHeader(),
      },
      body: JSON.stringify({
        user_id: user_id,
        products: REQUIRED_PRODUCTS, // Use the updated product list
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      logger.error('[API Phyllo SdkToken] Phyllo API error:', {
        status: response.status,
        body: result,
      });
      const errorMessage = result?.details || result?.error_message || 'Failed to fetch SDK token';
      return NextResponse.json(
        { error: errorMessage, phylloError: result },
        { status: response.status }
      );
    }

    logger.info(`[API Phyllo SdkToken] Successfully generated SDK token for user_id: ${user_id}`);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    logger.error('[API Phyllo SdkToken] Failed to fetch SDK token:', message);
    return NextResponse.json(
      { error: 'Failed to fetch SDK token', details: message },
      { status: 500 }
    );
  }
}
