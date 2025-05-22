import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient, Platform, Prisma } from '@prisma/client'; // Keep commented until DB logic is refactored
// import crypto from 'crypto'; // crypto is unused
import { logger } from '@/lib/logger';
// import { makeInsightIQRequest } from '@/lib/insightiqService'; // Keep commented until service functions are implemented

// const prisma = new PrismaClient(); // Keep commented until DB logic is refactored

// const INSIGHTIQ_WEBHOOK_SECRET = process.env.INSIGHTIQ_WEBHOOK_SECRET; // Will be used once obtained

/**
 * Handles incoming webhook events from InsightIQ.
 *
 * Important: This endpoint must be publicly accessible and able to handle POST requests.
 */
export async function POST(request: NextRequest) {
  logger.info('[Webhook /api/webhooks/insightiq] Received POST request');

  // --- TODO: Implement Webhook Verification (Blocked by InsightIQ Docs) ---
  // 1. Extract signature header (Need header name from InsightIQ)
  // 2. Get raw request body
  // 3. Compute HMAC-SHA256 signature using INSIGHTIQ_WEBHOOK_SECRET
  // 4. Compare signatures securely (e.g., crypto.timingSafeEqual)
  // 5. If invalid, return 401 Unauthorized
  // const isValid = verifyWebhookSignature(request, serverConfig.insightiq.webhookSecret);
  // if (!isValid) {
  //   logger.warn('[Webhook /api/webhooks/insightiq] Invalid signature');
  //   return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
  // }
  logger.warn(
    '[Webhook /api/webhooks/insightiq] Signature verification SKIPPED (Pending InsightIQ Docs)'
  );

  try {
    const payload = await request.json();
    logger.info('[Webhook /api/webhooks/insightiq] Parsed payload:', payload);

    // --- TODO: Implement Payload Processing (Blocked by InsightIQ Docs) ---
    // 1. Identify event type from payload.event
    // 2. Extract relevant IDs (e.g., account_id, content_ids, profile_id)
    // 3. Queue payload/IDs for asynchronous processing (e.g., Redis, RabbitMQ, BullMQ)
    //    - Ensure idempotency check using payload.id
    // 4. Acknowledge receipt immediately with 200 OK

    // Example (Conceptual - requires actual payload structure & queue mechanism):
    // const { event, id, data } = payload;
    // const isDuplicate = await checkDuplicateWebhook(id); // Check if webhook ID already processed
    // if (isDuplicate) {
    //   logger.info(`[Webhook /api/webhooks/insightiq] Duplicate webhook received: ${id}`);
    //   return NextResponse.json({ success: true, message: 'Duplicate ignored' }, { status: 200 });
    // }
    // await markWebhookAsProcessing(id);
    // await queueWebhookTask(event, data);

    logger.warn(
      '[Webhook /api/webhooks/insightiq] Payload processing NOT IMPLEMENTED (Pending InsightIQ Docs)'
    );

    // For now, always return a 200 OK to acknowledge receipt, even if processing fails.
    // Specific error handling and retries should be managed based on InsightIQ's webhook behavior.
    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error: unknown) {
    logger.error('Error processing InsightIQ webhook:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      errorObject: error,
    });
    // Still return 200 to acknowledge receipt to InsightIQ, preventing retries for server-side errors.
    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  }
}

// --- Placeholder Processing Functions (Need InsightIQ details) ---
// async function processInsightIQAccountConnected(data: any) { ... }
// async function processInsightIQProfileDataAvailable(data: any) { ... }

// Add empty export to ensure file is treated as a module
export {};
