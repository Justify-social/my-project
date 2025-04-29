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
    logger.error('[API Phyllo CreateUser] Missing Phyllo Client ID or Secret.');
    throw new Error('Phyllo Client ID or Secret is missing.');
  }
  const credentials = `${PHYLLO_CLIENT_ID}:${PHYLLO_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

export async function POST(req: NextRequest) {
  if (!PHYLLO_BASE_URL || !PHYLLO_CLIENT_ID || !PHYLLO_CLIENT_SECRET) {
    logger.error('[API Phyllo CreateUser] Runtime Error: Missing Phyllo credentials.');
    return NextResponse.json({ error: 'Phyllo configuration error' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { external_id, name } = body;
    if (!external_id || !name) {
      logger.warn('[API Phyllo CreateUser] Missing required parameters: external_id or name');
      return NextResponse.json(
        { error: 'Missing required parameters: external_id, name' },
        { status: 400 }
      );
    }

    const apiUrl = `${PHYLLO_BASE_URL}/v1/users`;
    logger.info(`[API Phyllo CreateUser] Creating Phyllo user for external_id: ${external_id}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getBasicAuthHeader(),
      },
      body: JSON.stringify({ name, external_id }),
    });

    const result = await response.json();

    if (!response.ok) {
      logger.error('[API Phyllo CreateUser] Phyllo API error:', {
        status: response.status,
        body: result,
      });
      // Provide more context from Phyllo if available
      const errorMessage =
        result?.details || result?.error_message || 'Phyllo user creation failed';
      return NextResponse.json(
        { error: errorMessage, phylloError: result },
        { status: response.status }
      );
    }

    logger.info(`[API Phyllo CreateUser] Successfully created Phyllo user: ${result.id}`);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    logger.error('[API Phyllo CreateUser] Failed to create Phyllo user:', message);
    return NextResponse.json(
      { error: 'Failed to create Phyllo user', details: message },
      { status: 500 }
    );
  }
}
