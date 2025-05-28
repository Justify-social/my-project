import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { validateMuxWebhook, executeResilientMuxOperation } from '@/lib/utils/mux-resilience';
import { prisma } from '@/lib/db';

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
  let webhookData: any = null;
  let assetId: string | undefined;

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
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    if (!muxSignature) {
      logger.error('Webhook missing signature header', {
        service: 'mux-webhook',
        bodyLength: rawBody.length,
      });
      return NextResponse.json(
        { error: 'Missing mux-signature header' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    logger.info('Webhook signature validated successfully', {
      service: 'mux-webhook',
      timestamp: validationResult.timestamp,
    });

    // =========================================================================
    // 3. PARSE WEBHOOK DATA
    // =========================================================================

    try {
      webhookData = JSON.parse(rawBody);
      assetId = webhookData.data?.id;
    } catch (parseError) {
      logger.error('Failed to parse webhook JSON', {
        service: 'mux-webhook',
        error: parseError instanceof Error ? parseError.message : 'Parse failed',
        bodyLength: rawBody.length,
      });
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!assetId) {
      logger.warn('Webhook missing asset ID', {
        service: 'mux-webhook',
        webhookType: webhookData.type,
        data: webhookData.data,
      });
      return NextResponse.json(
        { error: 'Missing asset ID in webhook data' },
        { status: 400 }
      );
    }

    // =========================================================================
    // 4. PROCESS WEBHOOK WITH RESILIENCE
    // =========================================================================

    const result = await executeResilientMuxOperation(
      async () => {
        return await processWebhookEvent(webhookData, assetId!);
      },
      'process-webhook',
      assetId
    );

    const duration = Date.now() - startTime;
    logger.info('Webhook processed successfully', {
      service: 'mux-webhook',
      assetId,
      webhookType: webhookData.type,
      duration,
      result,
    });

    return NextResponse.json({
      success: true,
      processed: true,
      assetId,
      duration
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Webhook processing failed', {
      service: 'mux-webhook',
      assetId,
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
async function processWebhookEvent(webhookData: any, assetId: string) {
  const { type, data } = webhookData;

  logger.info('Processing webhook event', {
    service: 'mux-webhook-processor',
    assetId,
    type,
    status: data.status,
  });

  switch (type) {
    case 'video.asset.ready':
      return await handleAssetReady(assetId, data);

    case 'video.asset.errored':
      return await handleAssetErrored(assetId, data);

    case 'video.asset.created':
      return await handleAssetCreated(assetId, data);

    case 'video.asset.updated':
      return await handleAssetUpdated(assetId, data);

    default:
      logger.info('Ignoring unhandled webhook type', {
        service: 'mux-webhook-processor',
        type,
        assetId,
      });
      return { handled: false, reason: `Unhandled webhook type: ${type}` };
  }
}

/**
 * Handle video.asset.ready webhook
 */
async function handleAssetReady(assetId: string, data: any) {
  logger.info('Handling asset ready webhook', {
    service: 'mux-webhook-processor',
    assetId,
    playbackIds: data.playback_ids,
  });

  // Check for idempotency - avoid duplicate processing
  const existingAsset = await prisma.creativeAsset.findFirst({
    where: {
      muxAssetId: assetId,
      muxProcessingStatus: 'READY',
    },
  });

  if (existingAsset) {
    logger.info('Asset already marked as ready - idempotent operation', {
      service: 'mux-webhook-processor',
      assetId,
      existingAssetId: existingAsset.id,
    });
    return { handled: true, reason: 'Already processed (idempotent)', assetId: existingAsset.id };
  }

  // Update asset status and URL
  const playbackId = data.playback_ids?.[0]?.id;
  const streamUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null;

  const updatedAsset = await prisma.creativeAsset.updateMany({
    where: {
      muxAssetId: assetId,
    },
    data: {
      muxProcessingStatus: 'READY',
      url: streamUrl || undefined,
      updatedAt: new Date(),
    },
  });

  if (updatedAsset.count === 0) {
    logger.warn('No assets found to update for ready webhook', {
      service: 'mux-webhook-processor',
      assetId,
    });
    return { handled: false, reason: 'No matching assets found' };
  }

  logger.info('Asset marked as ready successfully', {
    service: 'mux-webhook-processor',
    assetId,
    updatedCount: updatedAsset.count,
    streamUrl,
  });

  return {
    handled: true,
    updatedCount: updatedAsset.count,
    streamUrl,
    status: 'READY'
  };
}

/**
 * Handle video.asset.errored webhook
 */
async function handleAssetErrored(assetId: string, data: any) {
  logger.error('Handling asset errored webhook', {
    service: 'mux-webhook-processor',
    assetId,
    errors: data.errors,
  });

  const updatedAsset = await prisma.creativeAsset.updateMany({
    where: {
      muxAssetId: assetId,
    },
    data: {
      muxProcessingStatus: 'ERROR',
      updatedAt: new Date(),
    },
  });

  if (updatedAsset.count === 0) {
    logger.warn('No assets found to update for error webhook', {
      service: 'mux-webhook-processor',
      assetId,
    });
    return { handled: false, reason: 'No matching assets found' };
  }

  return {
    handled: true,
    updatedCount: updatedAsset.count,
    status: 'ERROR',
    errors: data.errors
  };
}

/**
 * Handle video.asset.created webhook
 */
async function handleAssetCreated(assetId: string, data: any) {
  logger.info('Handling asset created webhook', {
    service: 'mux-webhook-processor',
    assetId,
    status: data.status,
  });

  // Just log for now - creation is handled during upload
  return {
    handled: true,
    reason: 'Asset creation logged',
    status: data.status
  };
}

/**
 * Handle video.asset.updated webhook
 */
async function handleAssetUpdated(assetId: string, data: any) {
  logger.info('Handling asset updated webhook', {
    service: 'mux-webhook-processor',
    assetId,
    status: data.status,
  });

  // Update status if it changed
  const status = mapMuxStatusToInternal(data.status);

  if (status) {
    const updatedAsset = await prisma.creativeAsset.updateMany({
      where: {
        muxAssetId: assetId,
      },
      data: {
        muxProcessingStatus: status,
        updatedAt: new Date(),
      },
    });

    return {
      handled: true,
      updatedCount: updatedAsset.count,
      status
    };
  }

  return { handled: true, reason: 'No status update needed' };
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
