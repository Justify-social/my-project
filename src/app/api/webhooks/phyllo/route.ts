import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform, Prisma } from '@prisma/client'; // Ensure Prisma namespace is imported for JsonValue
import crypto from 'crypto';
import { logger } from '@/utils/logger';
import { makePhylloRequest } from '@/lib/phylloService'; // Ensure this is correctly exported and imported

const prisma = new PrismaClient();

const PHYLLO_WEBHOOK_SECRET = process.env.PHYLLO_WEBHOOK_SECRET;

/**
 * Handles incoming webhook events from Phyllo.
 *
 * Important: This endpoint must be publicly accessible and able to handle POST requests.
 */
export async function POST(request: NextRequest) {
  logger.info('[API /webhooks/phyllo] Received POST request');

  // --- 1. Verify Webhook Signature (CRITICAL FOR SECURITY) ---
  const signatureHeader = request.headers.get('phyllo-signature');
  const webhookSecret = process.env.PHYLLO_WEBHOOK_SECRET; // Ensure this is set in your env!

  if (!signatureHeader || !webhookSecret) {
    logger.error('[API /webhooks/phyllo] Missing signature header or webhook secret');
    return NextResponse.json(
      { success: false, error: 'Missing signature information' },
      { status: 400 }
    );
  }

  try {
    const requestBody = await request.text(); // Read raw body for verification

    const [timestampPart, signaturePart] = signatureHeader.split(',');
    const timestamp = timestampPart?.split('=')[1];
    const signature = signaturePart?.split('=')[1];

    if (!timestamp || !signature) {
      logger.error('[API /webhooks/phyllo] Invalid signature header format');
      return NextResponse.json(
        { success: false, error: 'Invalid signature header format' },
        { status: 400 }
      );
    }

    const signedPayload = `${timestamp}.${requestBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Compare signatures securely to prevent timing attacks
    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!signaturesMatch) {
      logger.warn('[API /webhooks/phyllo] Invalid webhook signature');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
    }

    logger.info('[API /webhooks/phyllo] Webhook signature verified successfully.');

    // --- 2. Parse the Event Payload ---
    const event = JSON.parse(requestBody); // Now parse the verified body
    const eventType = event.event;
    const eventId = event.id;
    const eventData = event.data;

    logger.info(`[API /webhooks/phyllo] Processing event: ${eventType} (ID: ${eventId})`, {
      eventData,
    });

    // --- 3. Process the Event ---
    // TODO: Implement logic based on the eventType
    switch (eventType) {
      case 'ACCOUNTS.CONNECTED':
        // Handle account connected: Maybe create initial influencer record, fetch initial data
        logger.info('Processing ACCOUNTS.CONNECTED', {
          accountId: eventData.id,
          userId: eventData.user.id,
        });
        // Example: await processAccountConnected(eventData);
        break;
      case 'PROFILES.DATA.AVAILABLE':
        // Handle profile data available: Fetch profile analytics from Phyllo API, update influencer DB record
        logger.info('Processing PROFILES.DATA.AVAILABLE', {
          accountId: eventData.account_id,
          userId: eventData.user.id,
        });
        // Example: await processProfileDataAvailable(eventData);
        break;
      // Add cases for other events you subscribe to:
      // case 'IDENTITY.DATA.AVAILABLE': ...
      // case 'ENGAGEMENT.DATA.AVAILABLE': ...
      // case 'ACCOUNTS.DISCONNECTED': ...
      default:
        logger.warn(`[API /webhooks/phyllo] Received unhandled event type: ${eventType}`);
        break;
    }

    // --- 4. Return Success Response ---
    // Tell Phyllo the webhook was received successfully
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error processing webhook';
    logger.error(`[API /webhooks/phyllo] Error processing webhook: ${message}`, error);
    // Return an error status, but be cautious - Phyllo might retry if you return 5xx frequently
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// --- Example Placeholder Processing Functions ---
// async function processAccountConnected(data: any) {
//   // 1. Extract relevant IDs (accountId, userId, externalUserId)
//   // 2. Find or create influencer record in your DB based on externalUserId
//   // 3. Link the Phyllo accountId to your influencer record
//   // 4. Optionally trigger initial data fetch from Phyllo API
// }

// async function processProfileDataAvailable(data: any) {
//   // 1. Extract accountId, userId
//   // 2. Find your internal influencer record linked to this accountId/userId
//   // 3. Call Phyllo API (e.g., Get Profile Analytics) using the accountId
//   // 4. Update your influencer record in the DB with the fetched data
// }

// Add empty export to ensure file is treated as a module
export {};
