import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { prisma } from '@/lib/prisma';
import { serverConfig } from '@/config/server-config';
import { logger } from '@/utils/logger';

// Initialize Mux client with the webhook secret for signature verification
let mux: Mux | null = null;
if (serverConfig.mux.webhookSecret && serverConfig.mux.tokenId && serverConfig.mux.tokenSecret) {
  mux = new Mux({
    tokenId: serverConfig.mux.tokenId,
    tokenSecret: serverConfig.mux.tokenSecret,
    webhookSecret: serverConfig.mux.webhookSecret,
  });
  logger.info('[API /webhooks/mux] Mux client initialized for webhook verification.');
} else {
  logger.error(
    '[API /webhooks/mux] MUX_WEBHOOK_SIGNING_SECRET, MUX_TOKEN_ID, or MUX_TOKEN_SECRET is not configured. Webhook verification will fail or Mux client may not be fully functional.'
  );
}

export async function POST(req: NextRequest) {
  if (!mux) {
    logger.error(
      '[API /webhooks/mux] Mux client not initialized due to missing configuration. Cannot process webhook.'
    );
    return NextResponse.json({ error: 'Webhook processing misconfigured' }, { status: 500 });
  }

  const rawBody = await req.text(); // Mux expects the raw body string for verification

  let event: any; // Use 'any' for now, or a more specific base type if known.
  // The Mux SDK should provide proper types for 'event.data' after unwrap.

  try {
    // Verify and parse the webhook event using the Mux SDK's unwrap method
    event = mux.webhooks.unwrap(rawBody, req.headers);
    logger.info(
      `[API /webhooks/mux] Received Mux webhook. Event Type: ${event.type}, Event ID: ${event.id}`
    );
  } catch (error: any) {
    logger.error(
      '[API /webhooks/mux] Webhook signature verification failed or unwrap error:',
      error.message
    );
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  // Process the event based on its type
  try {
    switch (event.type) {
      case 'video.asset.created':
        try {
          logger.info(`[API /webhooks/mux] video.asset.created: Asset ID ${event.data.id}`);
          const assetCreated = event.data as Mux.Video.Asset;
          await prisma.creativeAsset.updateMany({
            where: { muxAssetId: assetCreated.id },
            data: { muxProcessingStatus: 'MUX_PROCESSING' },
          });
        } catch (e: any) {
          logger.error(
            `[API /webhooks/mux] DB error in video.asset.created for asset ${event.data.id}:`,
            e.message
          );
          // Decide if you want to throw or just log, affecting the overall webhook response
        }
        break;

      case 'video.asset.ready':
        try {
          logger.info(`[API /webhooks/mux] video.asset.ready: Asset ID ${event.data.id}`);
          const assetReady = event.data as Mux.Video.Asset;
          const publicPlaybackId = assetReady.playback_ids?.find(
            pid => pid.policy === 'public'
          )?.id;

          if (!publicPlaybackId) {
            logger.error(
              `[API /webhooks/mux] No public playback ID found for asset ${assetReady.id}`
            );
            await prisma.creativeAsset.updateMany({
              where: { muxAssetId: assetReady.id },
              data: { muxProcessingStatus: 'ERROR_NO_PLAYBACK_ID' },
            });
            break;
          }

          await prisma.creativeAsset.updateMany({
            where: { muxAssetId: assetReady.id },
            data: {
              muxPlaybackId: publicPlaybackId,
              duration: assetReady.duration ? Math.round(assetReady.duration) : null,
              muxProcessingStatus: 'READY',
              url: `https://stream.mux.com/${publicPlaybackId}.m3u8`, // Set the URL to Mux stream
            },
          });
          logger.info(
            `[API /webhooks/mux] CreativeAsset updated for Mux Asset ID: ${assetReady.id}`
          );
        } catch (e: any) {
          logger.error(
            `[API /webhooks/mux] DB error in video.asset.ready for asset ${event.data.id}:`,
            e.message
          );
        }
        break;

      case 'video.asset.errored':
        try {
          logger.warn(
            `[API /webhooks/mux] video.asset.errored: Asset ID ${event.data.id}. Errors: ${JSON.stringify(event.data.errors)}`
          );
          const assetErroredId = event.data.id;
          await prisma.creativeAsset.updateMany({
            where: { muxAssetId: assetErroredId },
            data: { muxProcessingStatus: 'ERROR' },
          });
        } catch (e: any) {
          logger.error(
            `[API /webhooks/mux] DB error in video.asset.errored for asset ${event.data.id}:`,
            e.message
          );
        }
        break;

      case 'video.upload.asset_created':
        try {
          logger.info(
            `[API /webhooks/mux] video.upload.asset_created: Upload ID ${event.data.object?.id} linked to Asset ID ${event.data.asset_id}`
          );
          // This event is useful if you initially only have an upload_id and need to link it to the asset_id.
          // Our current flow in create-video-upload gets muxAssetId upfront if possible,
          // but this handler can be a fallback or secondary update.
          if (event.data.asset_id) {
            await prisma.creativeAsset.updateMany({
              where: { muxAssetId: event.data.asset_id }, // Or search by a stored muxUploadId if you add that field
              data: { muxProcessingStatus: 'MUX_PROCESSING' }, // Asset exists, processing
            });
          }
        } catch (e: any) {
          logger.error(
            `[API /webhooks/mux] DB error in video.upload.asset_created for asset ${event.data.asset_id}:`,
            e.message
          );
        }
        break;

      default:
        logger.info(`[API /webhooks/mux] Received unhandled Mux event type: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (dbError: any) {
    logger.error(
      `[API /webhooks/mux] Outer DB error processing webhook for event ${event.id} (type: ${event.type}):`,
      dbError
    );
    return NextResponse.json({ error: 'Database error processing webhook' }, { status: 500 });
  }
}
