import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { muxService } from '@/lib/muxService';
import { logger } from '@/utils/logger';

/**
 * 🎯 SINGLE SOURCE OF TRUTH: Mux Debug Operations
 *
 * This endpoint consolidates ALL Mux-related debug functionality:
 * - Asset listing and analysis
 * - Stuck asset detection and reset
 * - Playback ID verification and extraction
 * - Manual asset fixing
 * - System health checks
 */

// Type definitions for asset analysis
interface VideoAssetForAnalysis {
  id: number;
  name: string;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  muxUploadId: string | null;
  muxProcessingStatus: string | null;
  createdAt: Date;
  url: string | null;
  campaignWizardId: string | null;
}

/**
 * Utility: Extract Mux playback ID from URL
 */
const extractMuxPlaybackId = (url: string): string | null => {
  if (!url || !url.includes('stream.mux.com/')) return null;

  try {
    const urlParts = url.split('stream.mux.com/');
    if (urlParts.length === 2) {
      return urlParts[1].replace('.m3u8', '');
    }
  } catch (e) {
    logger.error('Error extracting Mux playback ID from URL:', e);
  }
  return null;
};

/**
 * Utility: Check if user has admin access
 */
const checkAdminAccess = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    user,
    isAdmin: user.role === 'SUPER_ADMIN',
    isSelf: true, // For user's own assets
  };
};

/**
 * GET: Comprehensive Mux asset analysis and listing
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, isAdmin } = await checkAdminAccess(userId);
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'list';

    // Different GET actions
    switch (action) {
      case 'list': {
        // List Mux assets (user's own or all if admin)
        const whereClause = isAdmin
          ? {} // Admin sees all
          : { userId: user.id }; // User sees only their own

        const muxAssets = await prisma.creativeAsset.findMany({
          where: {
            type: 'video',
            OR: [
              { muxAssetId: { not: null } },
              { muxPlaybackId: { not: null } },
              { muxUploadId: { not: null } },
            ],
            ...whereClause,
          },
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit results
          select: {
            id: true,
            name: true,
            type: true,
            url: true,
            muxAssetId: true,
            muxPlaybackId: true,
            muxUploadId: true,
            muxProcessingStatus: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            campaignWizard: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return NextResponse.json({
          assets: muxAssets,
          total: muxAssets.length,
          isAdmin,
          timestamp: new Date().toISOString(),
        });
      }

      case 'analyze': {
        // Comprehensive analysis of Mux assets
        const whereClause = isAdmin ? { type: 'video' } : { type: 'video', userId: user.id };

        const allVideoAssets = await prisma.creativeAsset.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            muxAssetId: true,
            muxPlaybackId: true,
            muxUploadId: true,
            muxProcessingStatus: true,
            createdAt: true,
            url: true,
            campaignWizardId: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        // Analyze asset states
        const summary = {
          totalVideoAssets: allVideoAssets.length,
          readyWithPlaybackId: 0,
          missingPlaybackId: 0,
          stuckUploads: 0,
          processingAssets: 0,
          errorAssets: 0,
          fixableFromUrl: 0,
        };

        const problematicAssets: Array<(typeof allVideoAssets)[0] & { issue: string }> = [];
        const stuckAssets: Array<
          (typeof allVideoAssets)[0] & { issue: string; ageMinutes: number }
        > = [];
        const fixableAssets: Array<
          (typeof allVideoAssets)[0] & { issue: string; extractedPlaybackId: string }
        > = [];

        const tenMinutes = 10 * 60 * 1000;
        const now = Date.now();

        for (const assetRaw of allVideoAssets) {
          const asset = assetRaw as VideoAssetForAnalysis;

          // Check for stuck uploads
          if (asset.muxProcessingStatus === 'AWAITING_UPLOAD' && asset.createdAt) {
            const assetAge = now - new Date(asset.createdAt).getTime();
            if (assetAge > tenMinutes) {
              summary.stuckUploads++;
              stuckAssets.push({
                ...asset,
                issue: `Stuck in AWAITING_UPLOAD for ${Math.round(assetAge / 60000)} minutes`,
                ageMinutes: Math.round(assetAge / 60000),
              });
              continue;
            }
          }

          // Check if fixable from URL
          if (!asset.muxPlaybackId && asset.url) {
            const extractedId = extractMuxPlaybackId(asset.url);
            if (extractedId) {
              summary.fixableFromUrl++;
              fixableAssets.push({
                ...asset,
                extractedPlaybackId: extractedId,
                issue: 'Missing playback ID but can extract from URL',
              });
            }
          }

          // Categorize by status
          if (asset.muxProcessingStatus === 'READY' && asset.muxPlaybackId) {
            summary.readyWithPlaybackId++;
          } else if (asset.muxProcessingStatus === 'READY' && !asset.muxPlaybackId) {
            summary.missingPlaybackId++;
            problematicAssets.push({
              ...asset,
              issue: 'Status READY but missing playback ID',
            });
          } else if (asset.muxProcessingStatus?.includes('ERROR')) {
            summary.errorAssets++;
            problematicAssets.push({
              ...asset,
              issue: `Processing error: ${asset.muxProcessingStatus}`,
            });
          } else if (
            asset.muxProcessingStatus &&
            !['READY', 'ERROR'].includes(asset.muxProcessingStatus)
          ) {
            summary.processingAssets++;
          }
        }

        return NextResponse.json({
          summary,
          stuckAssets: stuckAssets.slice(0, 20),
          problematicAssets: problematicAssets.slice(0, 20),
          fixableAssets: fixableAssets.slice(0, 20),
          isAdmin,
          timestamp: new Date().toISOString(),
        });
      }

      case 'health': {
        // System health check for Mux integration
        const healthData = {
          muxService: {
            configured: !!(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET),
            webhookSecret: !!process.env.MUX_WEBHOOK_SIGNING_SECRET,
          },
          database: {
            connected: false,
            responseTime: 0,
          },
          recentActivity: {
            uploadsLast24h: 0,
            readyLast24h: 0,
            errorsLast24h: 0,
          },
        };

        const dbStart = Date.now();
        try {
          await prisma.$queryRaw`SELECT 1`;
          healthData.database.connected = true;
          healthData.database.responseTime = Date.now() - dbStart;

          // Get recent activity
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

          const recentStats = await prisma.creativeAsset.groupBy({
            by: ['muxProcessingStatus'],
            where: {
              type: 'video',
              createdAt: { gte: yesterday },
              ...(isAdmin ? {} : { userId: user.id }),
            },
            _count: true,
          });

          for (const stat of recentStats) {
            if (stat.muxProcessingStatus === 'READY') {
              healthData.recentActivity.readyLast24h = stat._count;
            } else if (stat.muxProcessingStatus?.includes('ERROR')) {
              healthData.recentActivity.errorsLast24h += stat._count;
            } else {
              healthData.recentActivity.uploadsLast24h += stat._count;
            }
          }
        } catch (dbError) {
          healthData.database.responseTime = Date.now() - dbStart;
          logger.warn('[Debug Mux Health] Database health check failed:', dbError);
        }

        return NextResponse.json({
          health: healthData,
          isAdmin,
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('[Debug Mux GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Execute Mux debug operations
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, isAdmin } = await checkAdminAccess(userId);
    const body = await req.json();
    const { action, assetId, muxPlaybackId } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    // Handle different POST actions
    switch (action) {
      case 'resetStuckAssets': {
        // Reset stuck assets for current user
        const stuckAssets = await prisma.creativeAsset.findMany({
          where: {
            userId: user.id,
            muxProcessingStatus: 'AWAITING_UPLOAD',
            muxAssetId: null,
            createdAt: {
              lt: new Date(Date.now() - 5 * 60 * 1000), // Older than 5 minutes
            },
          },
        });

        if (stuckAssets.length === 0) {
          return NextResponse.json({
            success: true,
            message: 'No stuck assets found',
            count: 0,
          });
        }

        const deletedCount = await prisma.creativeAsset.deleteMany({
          where: {
            id: { in: stuckAssets.map(asset => asset.id) },
          },
        });

        logger.info(`[Debug Mux] Reset ${deletedCount.count} stuck assets for user ${userId}`);

        return NextResponse.json({
          success: true,
          message: `Successfully reset ${deletedCount.count} stuck assets`,
          count: deletedCount.count,
          deletedAssets: stuckAssets.map(asset => ({
            id: asset.id,
            name: asset.name,
            ageMinutes: Math.round((Date.now() - new Date(asset.createdAt).getTime()) / 60000),
          })),
        });
      }

      case 'fixAsset': {
        if (!assetId) {
          return NextResponse.json({ error: 'Missing assetId' }, { status: 400 });
        }

        // Get asset (check ownership if not admin)
        const whereClause = isAdmin
          ? { id: parseInt(assetId) }
          : { id: parseInt(assetId), userId: user.id };

        const dbAsset = await prisma.creativeAsset.findUnique({
          where: whereClause,
          select: {
            id: true,
            name: true,
            muxAssetId: true,
            muxUploadId: true,
            muxProcessingStatus: true,
            muxPlaybackId: true,
            url: true,
          },
        });

        if (!dbAsset) {
          return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        // Try to fix the asset
        if (dbAsset.muxAssetId) {
          // Check with Mux API
          try {
            const muxAssetInfo = await muxService.getAssetPlaybackInfo(dbAsset.muxAssetId);

            if (muxAssetInfo.status === 'ready' && dbAsset.muxProcessingStatus !== 'READY') {
              const publicPlaybackId = muxAssetInfo.playbackIds?.find(
                (pid: { id: string; policy: string }) => pid.policy === 'public'
              )?.id;

              if (publicPlaybackId) {
                const updatedAsset = await prisma.creativeAsset.update({
                  where: { id: dbAsset.id },
                  data: {
                    muxProcessingStatus: 'READY',
                    muxPlaybackId: publicPlaybackId,
                    url: `https://stream.mux.com/${publicPlaybackId}.m3u8`,
                    duration: muxAssetInfo.duration ? Math.round(muxAssetInfo.duration) : null,
                  },
                });

                logger.info(`[Debug Mux] Fixed asset ${assetId} - synced with Mux API`);

                return NextResponse.json({
                  success: true,
                  message: 'Asset fixed by syncing with Mux API',
                  asset: {
                    id: updatedAsset.id,
                    name: updatedAsset.name,
                    status: updatedAsset.muxProcessingStatus,
                    playbackId: updatedAsset.muxPlaybackId,
                  },
                });
              }
            }
          } catch (muxError) {
            logger.warn(`[Debug Mux] Mux API check failed for asset ${assetId}:`, muxError);
          }
        }

        // Try to extract from URL
        if (!dbAsset.muxPlaybackId && dbAsset.url) {
          const extractedId = extractMuxPlaybackId(dbAsset.url);
          if (extractedId) {
            const updatedAsset = await prisma.creativeAsset.update({
              where: { id: dbAsset.id },
              data: {
                muxPlaybackId: extractedId,
                muxProcessingStatus: 'READY',
              },
            });

            logger.info(`[Debug Mux] Fixed asset ${assetId} - extracted playback ID from URL`);

            return NextResponse.json({
              success: true,
              message: 'Asset fixed by extracting playback ID from URL',
              asset: {
                id: updatedAsset.id,
                name: updatedAsset.name,
                status: updatedAsset.muxProcessingStatus,
                playbackId: updatedAsset.muxPlaybackId,
              },
            });
          }
        }

        return NextResponse.json({
          success: false,
          message: 'Could not fix asset automatically',
          currentStatus: dbAsset.muxProcessingStatus,
          hasUrl: !!dbAsset.url,
          hasMuxAssetId: !!dbAsset.muxAssetId,
        });
      }

      case 'updatePlaybackId': {
        if (!assetId || !muxPlaybackId) {
          return NextResponse.json({ error: 'Missing assetId or muxPlaybackId' }, { status: 400 });
        }

        // Only allow admin to manually set playback IDs
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Admin access required for manual playback ID updates' },
            { status: 403 }
          );
        }

        const updatedAsset = await prisma.creativeAsset.update({
          where: { id: parseInt(assetId) },
          data: {
            muxPlaybackId,
            muxProcessingStatus: 'READY',
            url: `https://stream.mux.com/${muxPlaybackId}.m3u8`,
          },
        });

        logger.info(
          `[Debug Mux] Admin manually updated playback ID for asset ${assetId} to ${muxPlaybackId}`
        );

        return NextResponse.json({
          success: true,
          message: `Manually updated playback ID for asset ${assetId}`,
          asset: {
            id: updatedAsset.id,
            name: updatedAsset.name,
            playbackId: updatedAsset.muxPlaybackId,
          },
        });
      }

      case 'fixAllMissingIds': {
        // Only allow admin to run bulk operations
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Admin access required for bulk operations' },
            { status: 403 }
          );
        }

        const assetsToFix = await prisma.creativeAsset.findMany({
          where: {
            type: 'video',
            muxPlaybackId: null,
            url: { contains: 'stream.mux.com/' },
          },
          select: { id: true, url: true, name: true },
          take: 50, // Limit bulk operations
        });

        const results = [];
        let successCount = 0;

        for (const asset of assetsToFix) {
          if (asset.url) {
            const extractedId = extractMuxPlaybackId(asset.url);
            if (extractedId) {
              try {
                await prisma.creativeAsset.update({
                  where: { id: asset.id },
                  data: {
                    muxPlaybackId: extractedId,
                    muxProcessingStatus: 'READY',
                  },
                });
                results.push({ id: asset.id, name: asset.name, success: true, extractedId });
                successCount++;
              } catch (err) {
                results.push({
                  id: asset.id,
                  name: asset.name,
                  success: false,
                  error: String(err),
                });
              }
            } else {
              results.push({
                id: asset.id,
                name: asset.name,
                success: false,
                error: 'Could not extract ID from URL',
              });
            }
          }
        }

        logger.info(
          `[Debug Mux] Bulk fix completed: ${successCount} of ${assetsToFix.length} assets fixed`
        );

        return NextResponse.json({
          success: true,
          message: `Fixed ${successCount} of ${assetsToFix.length} assets`,
          successCount,
          totalAttempted: assetsToFix.length,
          results: results.slice(0, 20), // Limit response size
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('[Debug Mux POST] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
