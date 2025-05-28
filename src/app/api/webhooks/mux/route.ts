import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { validateMuxWebhook, executeResilientMuxOperation } from '@/lib/utils/mux-resilience';
import { prisma } from '@/lib/db';

/**
 * TypeScript interfaces for Mux webhook data
 */
interface MuxPlaybackId {
  id: string;
  policy: 'public' | 'signed';
}

interface MuxAssetData {
  id: string;
  status: 'preparing' | 'ready' | 'errored';
  playback_ids?: MuxPlaybackId[];
  errors?: Array<{ type: string; messages: string[] }>;
  duration?: number;
  aspect_ratio?: string;
  created_at?: string;
  updated_at?: string;
  upload_id?: string;
}

interface MuxWebhookPayload {
  type:
    | 'video.asset.ready'
    | 'video.asset.errored'
    | 'video.asset.created'
    | 'video.asset.updated'
    | 'video.upload.asset_created';
  data: MuxAssetData;
  object: {
    type: string;
    id: string;
  };
  id: string;
  environment: {
    name: string;
    id: string;
  };
  created_at: string;
}

/**
 * 🎯 ENHANCED MUX WEBHOOK ENDPOINT
 *
 * Features:
 * - HMAC-SHA256 signature verification for security
 * - Circuit breaker protection against failures
 * - Comprehensive error handling and logging
 * - Idempotent processing to prevent duplicate operations
 * - Graceful degradation with fallback mechanisms
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let webhookData: MuxWebhookPayload | null = null;
  let primaryId: string | undefined; // Can be either assetId or uploadId depending on webhook type

  try {
    // =========================================================================
    // 1. EXTRACT WEBHOOK DATA & SIGNATURE
    // =========================================================================

    const rawBody = await request.text();
    const muxSignature = request.headers.get('mux-signature');

    if (!rawBody) {
      logger.error('Webhook received empty body', {
        service: 'mux-webhook',
        headers: Object.fromEntries(request.headers.entries()),
      });
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    if (!muxSignature) {
      logger.error('Webhook missing signature header', {
        service: 'mux-webhook',
        bodyLength: rawBody.length,
      });
      return NextResponse.json({ error: 'Missing mux-signature header' }, { status: 400 });
    }

    // =========================================================================
    // 2. VALIDATE WEBHOOK SIGNATURE
    // =========================================================================

    const validationResult = validateMuxWebhook(rawBody, muxSignature);

    if (!validationResult.isValid) {
      logger.error('Webhook signature validation failed', {
        service: 'mux-webhook',
        error: validationResult.error,
        timestamp: validationResult.timestamp,
      });
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    logger.info('Webhook signature validated successfully', {
      service: 'mux-webhook',
      timestamp: validationResult.timestamp,
    });

    // =========================================================================
    // 3. PARSE WEBHOOK DATA
    // =========================================================================

    try {
      webhookData = JSON.parse(rawBody) as MuxWebhookPayload;
      // For most webhooks, the asset ID is in data.id
      // For video.upload.asset_created, we need both:
      // - object.id = upload ID
      // - data.id = asset ID
      if (webhookData?.type === 'video.upload.asset_created') {
        primaryId = webhookData.object?.id; // This is actually the upload ID for this event
      } else {
        primaryId = webhookData.data?.id;
      }
    } catch (parseError) {
      logger.error('Failed to parse webhook JSON', {
        service: 'mux-webhook',
        error: parseError instanceof Error ? parseError.message : 'Parse failed',
        bodyLength: rawBody.length,
      });
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (!primaryId) {
      logger.warn('Webhook missing primary ID', {
        service: 'mux-webhook',
        webhookType: webhookData?.type,
        data: webhookData?.data,
        object: webhookData?.object,
      });
      return NextResponse.json({ error: 'Missing required ID in webhook data' }, { status: 400 });
    }

    if (!webhookData) {
      logger.error('Webhook data is null after parsing', {
        service: 'mux-webhook',
        primaryId,
      });
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    // =========================================================================
    // 4. PROCESS WEBHOOK WITH RESILIENCE
    // =========================================================================

    const result = await executeResilientMuxOperation(
      async () => {
        return await processWebhookEvent(webhookData!, primaryId!);
      },
      'process-webhook',
      primaryId
    );

    const duration = Date.now() - startTime;
    logger.info('Webhook processed successfully', {
      service: 'mux-webhook',
      primaryId,
      webhookType: webhookData.type,
      duration,
      result,
    });

    return NextResponse.json({
      success: true,
      processed: true,
      primaryId,
      webhookType: webhookData.type,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Webhook processing failed', {
      service: 'mux-webhook',
      primaryId,
      webhookType: webhookData?.type,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return 200 to prevent Mux from retrying non-retryable errors
    if (error instanceof Error && shouldReturn200ForError(error)) {
      return NextResponse.json({
        success: false,
        error: error.message,
        retryable: false,
      });
    }

    // Return 500 for retryable errors so Mux will retry
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        retryable: true,
      },
      { status: 500 }
    );
  }
}

/**
 * Process individual webhook event with comprehensive error handling
 */
async function processWebhookEvent(webhookData: MuxWebhookPayload, primaryId: string) {
  const { type, data } = webhookData;

  logger.info('Processing webhook event', {
    service: 'mux-webhook-processor',
    primaryId,
    type,
    status: data.status,
  });

  switch (type) {
    case 'video.asset.ready':
      return await handleAssetReady(primaryId, data);

    case 'video.asset.errored':
      return await handleAssetErrored(primaryId, data);

    case 'video.asset.created':
      return await handleAssetCreated(primaryId, data);

    case 'video.asset.updated':
      return await handleAssetUpdated(primaryId, data);

    case 'video.upload.asset_created':
      return await handleUploadAssetCreated(primaryId, data);

    default:
      logger.info('Ignoring unhandled webhook type', {
        service: 'mux-webhook-processor',
        type,
        primaryId,
      });
      return { handled: false, reason: `Unhandled webhook type: ${type}` };
  }
}

/**
 * Handle video.asset.ready webhook
 */
async function handleAssetReady(primaryId: string, data: MuxAssetData) {
  logger.info('Handling asset ready webhook', {
    service: 'mux-webhook-processor',
    primaryId,
    playbackIds: data.playback_ids,
  });

  // Check for idempotency - avoid duplicate processing
  const existingAsset = await prisma.creativeAsset.findFirst({
    where: {
      muxAssetId: primaryId,
      muxProcessingStatus: 'READY',
    },
  });

  if (existingAsset) {
    logger.info('Asset already marked as ready - idempotent operation', {
      service: 'mux-webhook-processor',
      primaryId,
      existingAssetId: existingAsset.id,
    });
    return { handled: true, reason: 'Already processed (idempotent)', assetId: existingAsset.id };
  }

  // Update asset status and URL
  const playbackId = data.playback_ids?.[0]?.id;
  const streamUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null;

  const updatedAsset = await prisma.creativeAsset.updateMany({
    where: {
      OR: [{ muxAssetId: primaryId }, { muxUploadId: primaryId }],
    },
    data: {
      muxAssetId: primaryId,
      muxPlaybackId: playbackId || undefined,
      muxProcessingStatus: 'READY',
      url: streamUrl || undefined,
      updatedAt: new Date(),
    },
  });

  if (updatedAsset.count === 0) {
    logger.warn('No assets found to update for ready webhook', {
      service: 'mux-webhook-processor',
      primaryId,
    });
    return { handled: false, reason: 'No matching assets found' };
  }

  logger.info('Asset marked as ready successfully', {
    service: 'mux-webhook-processor',
    primaryId,
    updatedCount: updatedAsset.count,
    streamUrl,
  });

  return {
    handled: true,
    updatedCount: updatedAsset.count,
    streamUrl,
    status: 'READY',
  };
}

/**
 * Handle video.asset.errored webhook
 */
async function handleAssetErrored(primaryId: string, data: MuxAssetData) {
  logger.error('Handling asset errored webhook', {
    service: 'mux-webhook-processor',
    primaryId,
    errors: data.errors,
  });

  const updatedAsset = await prisma.creativeAsset.updateMany({
    where: {
      OR: [{ muxAssetId: primaryId }, { muxUploadId: primaryId }],
    },
    data: {
      muxAssetId: primaryId,
      muxProcessingStatus: 'ERROR',
      updatedAt: new Date(),
    },
  });

  if (updatedAsset.count === 0) {
    logger.warn('No assets found to update for error webhook', {
      service: 'mux-webhook-processor',
      primaryId,
    });
    return { handled: false, reason: 'No matching assets found' };
  }

  return {
    handled: true,
    updatedCount: updatedAsset.count,
    status: 'ERROR',
    errors: data.errors,
  };
}

/**
 * Handle video.asset.created webhook
 */
async function handleAssetCreated(assetId: string, data: MuxAssetData) {
  logger.info('Handling asset created webhook', {
    service: 'mux-webhook-processor',
    assetId,
    uploadId: data.upload_id,
    status: data.status,
  });

  const internalStatus = mapMuxStatusToInternal(data.status);

  if (data.upload_id) {
    // This is the primary way to link an upload to its final asset ID.
    const updatedAsset = await prisma.creativeAsset.updateMany({
      where: {
        muxUploadId: data.upload_id,
      },
      data: {
        muxAssetId: assetId,
        muxProcessingStatus: internalStatus || 'PREPARING',
        updatedAt: new Date(),
      },
    });

    if (updatedAsset.count > 0) {
      logger.info('Asset linked to upload via video.asset.created event', {
        service: 'mux-webhook-processor',
        uploadId: data.upload_id,
        assetId,
        updatedCount: updatedAsset.count,
      });
      return {
        handled: true,
        updatedCount: updatedAsset.count,
        assetId,
        uploadId: data.upload_id,
        status: internalStatus || data.status,
      };
    } else {
      logger.warn('No asset found with upload_id to link for video.asset.created', {
        service: 'mux-webhook-processor',
        uploadId: data.upload_id,
        assetId,
      });
      // Fallback: if no record was found by upload_id, something is off,
      // but we can still try to update by asset_id if a record somehow exists with it already.
      // This is less likely to be the primary update path.
    }
  }

  // If no upload_id, or if update by upload_id found nothing,
  // try to update based on the assetId itself. This might happen if the asset wasn't created via direct upload
  // or if our initial record keeping was incomplete.
  if (internalStatus) {
    const updatedAssetByAssetId = await prisma.creativeAsset.updateMany({
      where: {
        muxAssetId: assetId,
      },
      data: {
        muxProcessingStatus: internalStatus,
        updatedAt: new Date(),
      },
    });
    if (updatedAssetByAssetId.count > 0) {
      logger.info('Asset status updated via video.asset.created (by assetId)', {
        service: 'mux-webhook-processor',
        assetId,
        updatedCount: updatedAssetByAssetId.count,
      });
      return {
        handled: true,
        updatedCount: updatedAssetByAssetId.count,
        status: internalStatus,
      };
    }
  }

  logger.info('Asset creation event processed (or no update needed/possible)', {
    service: 'mux-webhook-processor',
    assetId,
    uploadId: data.upload_id,
    status: data.status,
  });
  return {
    handled: true,
    reason: 'Asset creation logged or updated',
    status: data.status,
  };
}

/**
 * Handle video.asset.updated webhook
 */
async function handleAssetUpdated(primaryId: string, data: MuxAssetData) {
  logger.info('Handling asset updated webhook', {
    service: 'mux-webhook-processor',
    primaryId,
    status: data.status,
  });

  // Update status if it changed
  const status = mapMuxStatusToInternal(data.status);

  if (status) {
    const updatedAsset = await prisma.creativeAsset.updateMany({
      where: {
        OR: [{ muxAssetId: primaryId }, { muxUploadId: primaryId }],
      },
      data: {
        muxAssetId: primaryId,
        muxProcessingStatus: status,
        updatedAt: new Date(),
      },
    });

    return {
      handled: true,
      updatedCount: updatedAsset.count,
      status,
    };
  }

  return { handled: true, reason: 'No status update needed' };
}

/**
 * Handle video.upload.asset_created webhook
 */
async function handleUploadAssetCreated(uploadId: string, data: MuxAssetData) {
  logger.info('Handling upload asset created webhook', {
    service: 'mux-webhook-processor',
    uploadId,
    assetId: data.id,
    status: data.status,
  });

  // Find asset by upload ID and update with asset ID
  const dataToUpdate: {
    muxProcessingStatus: string;
    updatedAt: Date;
    muxAssetId?: string;
  } = {
    muxProcessingStatus: mapMuxStatusToInternal(data.status) || 'PREPARING',
    updatedAt: new Date(),
  };

  // Always try to set the muxAssetId from data.id.
  // The video.asset.created event (if it comes) will be more definitive using data.upload_id
  // but this provides an early link.
  if (data.id) {
    dataToUpdate.muxAssetId = data.id;
  }

  const updatedAsset = await prisma.creativeAsset.updateMany({
    where: {
      muxUploadId: uploadId,
    },
    data: dataToUpdate,
  });

  if (updatedAsset.count === 0) {
    logger.warn('No assets found to update for upload asset created webhook', {
      service: 'mux-webhook-processor',
      uploadId,
      assetId: data.id,
    });
    return { handled: false, reason: 'No matching assets found' };
  }

  logger.info('Asset linked successfully', {
    service: 'mux-webhook-processor',
    uploadId,
    assetId: data.id,
    updatedCount: updatedAsset.count,
  });

  return {
    handled: true,
    updatedCount: updatedAsset.count,
    uploadId,
    assetId: data.id,
    status: data.status,
  };
}

/**
 * Map Mux status to internal status
 */
function mapMuxStatusToInternal(muxStatus: string): string | null {
  switch (muxStatus) {
    case 'preparing':
      return 'MUX_PROCESSING';
    case 'ready':
      return 'READY';
    case 'errored':
      return 'ERROR';
    default:
      return null;
  }
}

/**
 * Determine if error should return 200 (non-retryable)
 */
function shouldReturn200ForError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Don't retry validation errors, missing data, etc.
  return (
    message.includes('invalid') ||
    message.includes('missing') ||
    message.includes('malformed') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  );
}
