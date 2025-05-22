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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(
      '[API /webhooks/mux] Webhook signature verification failed or unwrap error:',
      message
    );
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  // Process the event based on its type
  try {
    switch (event.type) {
      case 'video.asset.created':
        try {
          const muxAssetId = event.data.id;
          logger.info(`[API /webhooks/mux] video.asset.created: Mux Asset ID ${muxAssetId}`);
          // This event confirms the asset exists on Mux. Update status if we have a matching muxAssetId.
          // This might be the first time we learn the muxAssetId if video.upload.asset_created was missed or if create-video-upload didn't get it.
          // However, our primary linking mechanism is now via video.upload.asset_created.
          const existingAsset = await prisma.creativeAsset.findUnique({ where: { muxAssetId } });
          if (existingAsset) {
            await prisma.creativeAsset.update({
              where: { muxAssetId: muxAssetId },
              data: { muxProcessingStatus: 'MUX_PROCESSING' }, // Or a more specific status if available from this event
            });
            logger.info(
              `[API /webhooks/mux] CreativeAsset status updated to MUX_PROCESSING for muxAssetId: ${muxAssetId} via video.asset.created.`
            );
          } else {
            // This could happen if video.upload.asset_created hasn't fired yet to populate muxAssetId from a muxUploadId match.
            // Or if /api/mux/create-video-upload didn't successfully store an initial reference linked to this muxAssetId.
            logger.warn(
              `[API /webhooks/mux] video.asset.created: CreativeAsset not found by muxAssetId ${muxAssetId}. Waiting for video.upload.asset_created to link it, or create-video-upload needs to store muxAssetId if available there.`
            );
          }
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          logger.error(
            `[API /webhooks/mux] DB error in video.asset.created for Mux Asset ID ${event.data.id}:`,
            message
          );
        }
        break;

      case 'video.asset.ready':
        try {
          logger.info(
            `[API /webhooks/mux] video.asset.ready: Asset ID ${event.data.id}, Upload ID: ${event.data.upload_id}`
          );
          const assetReady = event.data as Mux.Video.Asset;
          const muxAssetId = assetReady.id;
          const muxUploadId = assetReady.upload_id; // Get the upload_id from the event

          const publicPlaybackId = assetReady.playback_ids?.find(
            pid => pid.policy === 'public'
          )?.id;

          if (!publicPlaybackId) {
            logger.error(`[API /webhooks/mux] No public playback ID found for asset ${muxAssetId}`);
            // Try to update by muxAssetId, then by muxUploadId if available and assetId failed
            let errorUpdateResult = await prisma.creativeAsset.updateMany({
              where: { muxAssetId: muxAssetId },
              data: { muxProcessingStatus: 'ERROR_NO_PLAYBACK_ID' },
            });
            if (errorUpdateResult.count === 0 && muxUploadId) {
              logger.info(
                `[API /webhooks/mux] video.asset.ready: Could not find asset by muxAssetId ${muxAssetId} to mark as ERROR_NO_PLAYBACK_ID. Trying by muxUploadId ${muxUploadId}`
              );
              errorUpdateResult = await prisma.creativeAsset.updateMany({
                where: { muxUploadId: muxUploadId },
                data: { muxProcessingStatus: 'ERROR_NO_PLAYBACK_ID' },
              });
            }
            logger.info(
              `[API /webhooks/mux] video.asset.ready: Marked asset (muxAssetId: ${muxAssetId}, muxUploadId: ${muxUploadId}) as ERROR_NO_PLAYBACK_ID. Count: ${errorUpdateResult.count}`
            );
            break;
          }

          const updateData = {
            muxPlaybackId: publicPlaybackId,
            duration: assetReady.duration ? Math.round(assetReady.duration) : null,
            muxProcessingStatus: 'READY' as const, // Ensure it's a literal type
            url: `https://stream.mux.com/${publicPlaybackId}.m3u8`,
            muxAssetId: muxAssetId, // Ensure muxAssetId is also set/confirmed here
          };

          // First, try to update using muxAssetId
          let updateResult = await prisma.creativeAsset.updateMany({
            where: { muxAssetId: muxAssetId },
            data: updateData,
          });

          if (updateResult.count > 0) {
            logger.info(
              `[API /webhooks/mux] video.asset.ready: Successfully updated CreativeAsset(s) (found by muxAssetId: ${muxAssetId}) to READY. Count: ${updateResult.count}`
            );
          } else if (muxUploadId) {
            // If no records were updated by muxAssetId, and we have a muxUploadId from the event, try updating by muxUploadId
            logger.warn(
              `[API /webhooks/mux] video.asset.ready: No CreativeAsset found by muxAssetId ${muxAssetId}. Attempting update via muxUploadId: ${muxUploadId}`
            );
            updateResult = await prisma.creativeAsset.updateMany({
              where: { muxUploadId: muxUploadId }, // Fallback to muxUploadId
              data: updateData, // updateData now includes muxAssetId to ensure it's set
            });

            if (updateResult.count > 0) {
              logger.info(
                `[API /webhooks/mux] video.asset.ready: Successfully updated CreativeAsset(s) (found by muxUploadId: ${muxUploadId}) to READY and linked muxAssetId ${muxAssetId}. Count: ${updateResult.count}`
              );
            } else {
              logger.error(
                `[API /webhooks/mux] video.asset.ready: CRITICAL - No CreativeAsset found by muxAssetId (${muxAssetId}) OR by muxUploadId (${muxUploadId}) to update to READY. Asset may be orphaned.`
              );
            }
          } else {
            // muxUploadId was not available on the event, and muxAssetId didn't match
            logger.error(
              `[API /webhooks/mux] video.asset.ready: CRITICAL - No CreativeAsset found by muxAssetId (${muxAssetId}) and no muxUploadId available in webhook event to attempt fallback. Asset may be orphaned.`
            );
          }
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          logger.error(
            `[API /webhooks/mux] DB error in video.asset.ready for asset ${event.data.id}:`,
            message
          );
        }
        break;

      case 'video.asset.errored':
        try {
          logger.warn(
            `[API /webhooks/mux] video.asset.errored: Asset ID ${event.data.id}. Errors: ${JSON.stringify(event.data.errors)}`
          );
          const assetErroredId = event.data.id;
          await prisma.creativeAsset.update({
            where: { muxAssetId: assetErroredId },
            data: { muxProcessingStatus: 'ERROR' },
          });
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          logger.error(
            `[API /webhooks/mux] DB error in video.asset.errored for asset ${event.data.id}:`,
            message
          );
        }
        break;

      case 'video.upload.asset_created':
        try {
          const muxEventData = event.data as any; // Cast to any to avoid TS complaints, then check props
          const upload_id_from_mux = muxEventData?.id as string | undefined;
          const asset_id_from_mux = muxEventData?.asset_id as string | undefined;

          logger.info(
            `[API /webhooks/mux] video.upload.asset_created: Received Mux Upload ID ${upload_id_from_mux}, Mux Asset ID ${asset_id_from_mux}`
          );

          if (upload_id_from_mux && asset_id_from_mux) {
            const assetRecord = await prisma.creativeAsset.findUnique({
              where: { muxUploadId: upload_id_from_mux },
            });

            if (assetRecord) {
              await prisma.creativeAsset.update({
                where: { id: assetRecord.id },
                data: {
                  muxAssetId: asset_id_from_mux,
                  muxProcessingStatus: 'MUX_PROCESSING',
                },
              });
              logger.info(
                `[API /webhooks/mux] CreativeAsset DB ID ${assetRecord.id} updated: set muxAssetId to ${asset_id_from_mux} and status to MUX_PROCESSING (found via muxUploadId ${upload_id_from_mux}).`
              );
            } else {
              logger.warn(
                `[API /webhooks/mux] video.upload.asset_created: No CreativeAsset found with muxUploadId ${upload_id_from_mux}. Checking if asset exists by muxAssetId ${asset_id_from_mux} (in case of race condition).`
              );
              const assetByMuxId = await prisma.creativeAsset.findUnique({
                where: { muxAssetId: asset_id_from_mux },
              });
              if (assetByMuxId && !(assetByMuxId as any).muxUploadId) {
                // Cast to any for muxUploadId check if TS still complains
                await prisma.creativeAsset.update({
                  where: { id: assetByMuxId.id },
                  data: { muxUploadId: upload_id_from_mux, muxProcessingStatus: 'MUX_PROCESSING' },
                });
                logger.info(
                  `[API /webhooks/mux] CreativeAsset DB ID ${assetByMuxId.id} (found by muxAssetId) updated with muxUploadId ${upload_id_from_mux}.`
                );
              } else if (assetByMuxId) {
                logger.info(
                  `[API /webhooks/mux] CreativeAsset DB ID ${assetByMuxId.id} (found by muxAssetId) already processed or has muxUploadId.`
                );
              } else {
                logger.error(
                  `[API /webhooks/mux] video.upload.asset_created: Critical - No CreativeAsset found for uploadId ${upload_id_from_mux} NOR for muxAssetId ${asset_id_from_mux}. Asset may be orphaned.`
                );
              }
            }
          } else {
            logger.warn(
              '[API /webhooks/mux] video.upload.asset_created: Missing upload_id or asset_id in webhook payload.',
              { data: muxEventData } // Log the data we received
            );
          }
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          const muxEventDataForError = event.data as any; // Use this for logging
          logger.error(
            `[API /webhooks/mux] DB error in video.upload.asset_created. Upload ID: ${muxEventDataForError?.id}, Asset ID: ${muxEventDataForError?.asset_id}:`,
            message
          );
        }
        break;

      default:
        logger.info(`[API /webhooks/mux] Received unhandled Mux event type: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (dbError: unknown) {
    logger.error(
      `[API /webhooks/mux] Outer DB error processing webhook for event ${event.id} (type: ${event.type}):`,
      dbError // Log the full error object for dbError
    );
    return NextResponse.json(
      { error: dbError instanceof Error ? dbError.message : 'Database error processing webhook' },
      { status: 500 }
    );
  }
}
