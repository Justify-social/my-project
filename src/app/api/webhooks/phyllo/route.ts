import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform, Prisma } from '@prisma/client'; // Ensure Prisma namespace is imported for JsonValue
import crypto from 'crypto';
import { logger } from '@/utils/logger';
import { makePhylloRequest } from '@/lib/phylloService'; // Ensure this is correctly exported and imported

const prisma = new PrismaClient();

const PHYLLO_WEBHOOK_SECRET = process.env.PHYLLO_WEBHOOK_SECRET;

// --- Webhook Signature Verification ---
async function verifySignature(signature: string | null, rawBody: string): Promise<boolean> {
  if (!PHYLLO_WEBHOOK_SECRET) {
    logger.error('[Webhook Phyllo] Missing PHYLLO_WEBHOOK_SECRET');
    return false;
  }
  if (!signature) {
    logger.warn('[Webhook Phyllo] Missing Phyllo-Signature header');
    return false;
  }
  try {
    const hmac = crypto.createHmac('sha256', PHYLLO_WEBHOOK_SECRET);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const checksum = Buffer.from(signature, 'utf8');
    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
      logger.warn('[Webhook Phyllo] Invalid signature');
      return false;
    }
  } catch (error) {
    logger.error('[Webhook Phyllo] Error verifying signature:', error);
    return false;
  }
  return true;
}

// --- Interfaces ---
interface PhylloAccountAddedPayload {
  event: 'ACCOUNTS.ADDED';
  user_id: string;
  id: string;
}
interface PhylloAccountDetails {
  id: string;
  status: string;
  platform?: Platform;
  work_platform?: { name: string; id: string };
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  logger.info('[Webhook Phyllo] Received POST request');

  // 1. Read raw body
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (error) {
    logger.error('[Webhook Phyllo] Error reading request body text:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read request body' },
      { status: 500 }
    );
  }

  // 2. Verify Signature
  const signature = request.headers.get('Phyllo-Signature');
  const isVerified = await verifySignature(signature, rawBody);
  if (!isVerified) {
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
  }
  logger.debug('[Webhook Phyllo] Signature verified successfully');

  // 3. Parse Payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
    logger.info(`[Webhook Phyllo] Parsed payload for event: ${payload?.event}`);
  } catch (error) {
    logger.error('[Webhook Phyllo] Error parsing JSON payload:', error);
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }

  // 4. Handle ACCOUNTS.ADDED Event
  if (payload?.event === 'ACCOUNTS.ADDED') {
    const { user_id: phylloUserId, id: phylloAccountId } = payload as PhylloAccountAddedPayload;
    logger.info(
      `[Webhook Phyllo] Processing ACCOUNTS.ADDED for User: ${phylloUserId}, Account: ${phylloAccountId}`
    );

    if (!phylloUserId || !phylloAccountId) {
      logger.warn('[Webhook Phyllo] Missing user_id or account_id in ACCOUNTS.ADDED payload');
      return NextResponse.json(
        { success: false, error: 'Missing required fields in payload' },
        { status: 400 }
      );
    }

    try {
      // a. Find Marketplace Influencer ID
      const influencer = await prisma.marketplaceInfluencer.findUnique({
        where: { phylloUserId: phylloUserId },
        select: { id: true },
      });

      if (!influencer) {
        logger.error(
          `[Webhook Phyllo] Could not find MarketplaceInfluencer for Phyllo User ID: ${phylloUserId}. Cannot link account ${phylloAccountId}.`
        );
        return NextResponse.json({
          success: true,
          message: 'Internal mapping missing, event acknowledged.',
        });
      }
      const marketplaceInfluencerId = influencer.id;

      // b. Get Account Details from Phyllo
      const accountDetails = await makePhylloRequest<PhylloAccountDetails>(
        `/v1/accounts/${phylloAccountId}`
      );

      if (!accountDetails?.platform) {
        logger.error(
          `[Webhook Phyllo] Failed to fetch valid account details or platform for Phyllo Account: ${phylloAccountId}`
        );
        return NextResponse.json(
          { success: false, error: 'Failed to retrieve account details from Phyllo' },
          { status: 500 }
        );
      }

      const platform = accountDetails.platform;
      const status = accountDetails.status ?? 'CONNECTED';
      const metadata = accountDetails as unknown as Prisma.JsonValue;

      // c. Create/Update the Link Record
      logger.info(
        `[Webhook Phyllo] Creating/Updating PhylloAccountLink for MPI_ID: ${marketplaceInfluencerId}, PhylloAID: ${phylloAccountId}`
      );
      await prisma.phylloAccountLink.upsert({
        where: { phylloAccountId: phylloAccountId },
        create: {
          marketplaceInfluencerId: marketplaceInfluencerId,
          phylloAccountId: phylloAccountId,
          phylloUserId: phylloUserId,
          platform: platform,
          status: status,
          metadata: metadata === null ? undefined : metadata,
          connectedAt: new Date(),
        },
        update: {
          status: status,
          metadata: metadata === null ? undefined : metadata,
          updatedAt: new Date(),
        },
      });
      logger.info(
        `[Webhook Phyllo] Successfully processed ACCOUNTS.ADDED for Account: ${phylloAccountId}`
      );
    } catch (error) {
      logger.error(
        `[Webhook Phyllo] Error processing ACCOUNTS.ADDED for Account ${phylloAccountId}:`,
        error
      );
      return NextResponse.json({
        success: true,
        message: 'Internal error processing event, acknowledged.',
      });
    }
    // TODO: Handle other events like ACCOUNTS.REMOVED, IDENTITY.UPDATED etc.
  } else {
    logger.info(
      `[Webhook Phyllo] Received unhandled event type: ${payload?.event}. Acknowledging.`
    );
  }

  // Acknowledge receipt to Phyllo
  return NextResponse.json({ success: true });
}
// Add empty export to ensure file is treated as a module
export {};
