import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient, Platform, Prisma } from '@prisma/client'; // Keep commented until DB logic is refactored
import crypto from 'crypto';
import { logger } from '@/utils/logger';
// import { makeInsightIQRequest } from '@/lib/insightiqService'; // Keep commented until service functions are implemented

// const prisma = new PrismaClient(); // Keep commented until DB logic is refactored

// const INSIGHTIQ_WEBHOOK_SECRET = process.env.INSIGHTIQ_WEBHOOK_SECRET; // Will be used once obtained

/**
 * Handles incoming webhook events from InsightIQ.
 *
 * Important: This endpoint must be publicly accessible and able to handle POST requests.
 */
export async function POST(request: NextRequest) {
  logger.info('[API /webhooks/insightiq] Received POST request');

  // --- 1. Verify Webhook Signature (CRITICAL FOR SECURITY) ---
  logger.warn(
    '[API /webhooks/insightiq] TODO: Implement InsightIQ Signature Verification - BLOCKER: Requires InsightIQ Docs & Webhook Secret'
  );
  // const signatureHeader = request.headers.get('insightiq-signature'); // TBD: Actual header name
  // const webhookSecret = process.env.INSIGHTIQ_WEBHOOK_SECRET;
  //
  // if (!signatureHeader || !webhookSecret) {
  //   logger.error('[API /webhooks/insightiq] Missing signature header or webhook secret');
  //   return NextResponse.json(
  //     { success: false, error: 'Missing signature information' },
  //     { status: 400 }
  //   );
  // }
  //
  // try {
  //   const requestBody = await request.text(); // Read raw body for verification
  //
  //   // TBD: Parse signature header based on InsightIQ format (e.g., timestamp, signatures)
  //   // const [timestampPart, signaturePart] = signatureHeader.split(',');
  //   // const timestamp = timestampPart?.split('=')[1];
  //   // const signature = signaturePart?.split('=')[1];
  //
  //   // if (!timestamp || !signature) { ... error handling ...}
  //
  //   // TBD: Construct signed payload based on InsightIQ's method
  //   // const signedPayload = `${timestamp}.${requestBody}`;
  //   // TBD: Use InsightIQ's expected algorithm (e.g., sha256, sha1?)
  //   // const expectedSignature = crypto
  //   //   .createHmac('sha256', webhookSecret)
  //   //   .update(signedPayload)
  //   //   .digest('hex');
  //
  //   // TBD: Use secure comparison
  //   // const signaturesMatch = crypto.timingSafeEqual(
  //   //   Buffer.from(signature),
  //   //   Buffer.from(expectedSignature)
  //   // );
  //   //
  //   // if (!signaturesMatch) {
  //   //   logger.warn('[API /webhooks/insightiq] Invalid webhook signature');
  //   //   return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
  //   // }
  //
  // logger.info('[API /webhooks/insightiq] Webhook signature verified successfully. (Verification logic needs implementation)');

  // --- 2. Parse the Event Payload ---
  let event;
  try {
    // Parse body AFTER simulated/skipped verification for now
    // Note: If verification reads request.text(), use that stored text here instead of parsing again.
    event = await request.json();
  } catch (parseError) {
    logger.error('[API /webhooks/insightiq] Error parsing request body:', parseError);
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  // TBD: Extract event details based on actual InsightIQ payload structure
  const eventType = event?.event_type || event?.event || 'UNKNOWN_EVENT_STRUCTURE'; // Guessing field names
  const eventId = event?.id || 'UNKNOWN_ID';
  const eventData = event?.data || {};

  logger.info(`[API /webhooks/insightiq] Processing event: ${eventType} (ID: ${eventId})`, {
    eventData,
  });

  // --- 3. Process the Event ---
  logger.warn(
    `[API /webhooks/insightiq] TODO: Implement event processing logic for ${eventType} - BLOCKER: Requires InsightIQ Docs`
  );

  // switch (eventType) {
  //   case 'INSIGHTIQ_ACCOUNTS.CONNECTED': // EXAMPLE - Use actual event names
  //     logger.info('Processing INSIGHTIQ_ACCOUNTS.CONNECTED', { eventData });
  //     // await processInsightIQAccountConnected(eventData);
  //     break;
  //   case 'INSIGHTIQ_PROFILES.DATA.AVAILABLE': // EXAMPLE
  //     logger.info('Processing INSIGHTIQ_PROFILES.DATA.AVAILABLE', { eventData });
  //     // await processInsightIQProfileDataAvailable(eventData);
  //     break;
  //   // Add cases for other InsightIQ events
  //   default:
  //     logger.warn(`[API /webhooks/insightiq] Received unhandled event type: ${eventType}`);
  //     break;
  // }

  // --- 4. Return Success Response ---
  // Acknowledge receipt even if processing is stubbed/pending
  logger.info(`[API /webhooks/insightiq] Acknowledging event ${eventId} type ${eventType}`);
  return NextResponse.json({ success: true, message: 'Webhook received' }, { status: 200 });

  // } catch (error: unknown) { // Catch block associated with signature verification try block
  //   const message = error instanceof Error ? error.message : 'Unknown error processing webhook';
  //   logger.error(`[API /webhooks/insightiq] Error processing webhook: ${message}`, error);
  //   return NextResponse.json({ success: false, error: message }, { status: 500 });
  // }
}

// --- Placeholder Processing Functions (Need InsightIQ details) ---
// async function processInsightIQAccountConnected(data: any) { ... }
// async function processInsightIQProfileDataAvailable(data: any) { ... }

// Add empty export to ensure file is treated as a module
export {};
