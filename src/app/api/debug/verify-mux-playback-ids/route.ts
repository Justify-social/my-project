import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { logger } from '@/utils/logger';

/**
 * Utility function to extract a Mux playback ID from a URL
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
 * This endpoint verifies and reports on Mux playback IDs in the database
 * Only accessible to super admin users
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a super admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    // Get all video assets with missing or problematic Mux playback IDs
    const allVideoAssets = await prisma.creativeAsset.findMany({
      where: {
        type: 'video',
      },
      select: {
        id: true,
        name: true,
        type: true,
        muxAssetId: true,
        muxPlaybackId: true,
        muxProcessingStatus: true,
        createdAt: true,
        updatedAt: true,
        url: true,
        campaignWizardId: true,
        submissionId: true,
        campaignWizard: {
          select: {
            name: true,
            id: true,
            submissionId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Analyze assets
    const summary = {
      totalVideoAssets: allVideoAssets.length,
      readyWithPlaybackId: 0,
      missingPlaybackId: 0,
      processingAssets: 0,
      errorAssets: 0,
      fixableFromUrl: 0,
    };

    const problematicAssets = [];
    const readyAssets = [];
    const fixableAssets = [];

    for (const asset of allVideoAssets) {
      // Check if we can extract playback ID from URL
      if (!asset.muxPlaybackId && asset.url) {
        const extractedId = extractMuxPlaybackId(asset.url);
        if (extractedId) {
          fixableAssets.push({
            ...asset,
            extractedPlaybackId: extractedId,
            issue: 'Missing playback ID but can extract from URL',
          });
          summary.fixableFromUrl++;
        }
      }

      if (asset.muxProcessingStatus === 'READY' && asset.muxPlaybackId) {
        summary.readyWithPlaybackId++;
        readyAssets.push(asset);
      } else if (asset.muxProcessingStatus === 'READY' && !asset.muxPlaybackId) {
        summary.missingPlaybackId++;
        problematicAssets.push({
          ...asset,
          issue: 'Status READY but missing playback ID',
        });
      } else if (asset.muxPlaybackId && asset.muxProcessingStatus !== 'READY') {
        problematicAssets.push({
          ...asset,
          issue: `Has playback ID but status is ${asset.muxProcessingStatus}`,
        });
      } else if (asset.muxProcessingStatus?.includes('ERROR')) {
        summary.errorAssets++;
        problematicAssets.push({
          ...asset,
          issue: `Processing error: ${asset.muxProcessingStatus}`,
        });
      } else {
        summary.processingAssets++;
        problematicAssets.push({
          ...asset,
          issue: `Still processing: ${asset.muxProcessingStatus}`,
        });
      }
    }

    // Find campaign wizards with brand lift studies
    const wizardIds = allVideoAssets.filter(a => a.campaignWizardId).map(a => a.campaignWizardId);

    const brandLiftStudies = await prisma.brandLiftStudy.findMany({
      where: {
        submissionId: {
          in: wizardIds.map(id => parseInt(id as string)).filter(id => !isNaN(id)),
        },
      },
      select: {
        id: true,
        name: true,
        submissionId: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      summary,
      readyAssets: readyAssets.slice(0, 5), // Limit to first 5 for brevity
      problematicAssets: problematicAssets.slice(0, 20), // Limit to first 20 for brevity
      fixableAssets: fixableAssets.slice(0, 20), // Limit to first 20 for brevity
      brandLiftStudies,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in verify-mux-playback-ids endpoint:', error);
    return NextResponse.json({ error: 'Failed to analyze Mux playback IDs' }, { status: 500 });
  }
}

/**
 * This endpoint can fix specific issues with Mux IDs when needed
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a super admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    // Get request body
    const { action, assetId, muxPlaybackId } = await req.json();

    if (!action || !assetId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, assetId' },
        { status: 400 }
      );
    }

    // Handle different repair actions
    if (action === 'updatePlaybackId' && muxPlaybackId) {
      // Update an asset's Mux playback ID manually
      await prisma.creativeAsset.update({
        where: { id: assetId },
        data: {
          muxPlaybackId,
          muxProcessingStatus: 'READY',
          url: `https://stream.mux.com/${muxPlaybackId}.m3u8`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Updated Mux playback ID for asset ${assetId} to ${muxPlaybackId}`,
      });
    } else if (action === 'resetProcessingStatus') {
      // Reset the processing status for an asset
      await prisma.creativeAsset.update({
        where: { id: assetId },
        data: {
          muxProcessingStatus: 'MUX_PROCESSING',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Reset processing status for asset ${assetId}`,
      });
    } else if (action === 'checkMuxUpload') {
      // Check the status of a Mux upload directly via API
      const asset = await prisma.creativeAsset.findUnique({
        where: { id: assetId },
        select: { muxUploadId: true, muxAssetId: true, muxProcessingStatus: true, name: true },
      });

      if (!asset) {
        return NextResponse.json({ success: false, message: 'Asset not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        asset: {
          id: assetId,
          name: asset.name,
          muxUploadId: asset.muxUploadId,
          muxAssetId: asset.muxAssetId,
          muxProcessingStatus: asset.muxProcessingStatus,
        },
        message: `Current status: ${asset.muxProcessingStatus}`,
      });
    } else if (action === 'extractFromUrl') {
      // Get the asset
      const asset = await prisma.creativeAsset.findUnique({
        where: { id: assetId },
        select: { url: true, id: true },
      });

      if (!asset || !asset.url) {
        return NextResponse.json({ error: 'Asset not found or has no URL' }, { status: 404 });
      }

      // Extract playback ID from URL
      const extractedId = extractMuxPlaybackId(asset.url);
      if (!extractedId) {
        return NextResponse.json(
          { error: 'Could not extract playback ID from URL' },
          { status: 400 }
        );
      }

      // Update with extracted ID
      await prisma.creativeAsset.update({
        where: { id: assetId },
        data: {
          muxPlaybackId: extractedId,
          muxProcessingStatus: 'READY',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Extracted and updated Mux playback ID for asset ${assetId} to ${extractedId}`,
        extractedId,
      });
    } else if (action === 'fixAllMissingIds') {
      // Find all video assets with URL but no playback ID
      const assetsToFix = await prisma.creativeAsset.findMany({
        where: {
          type: 'video',
          muxPlaybackId: null,
          url: { contains: 'stream.mux.com/' },
        },
        select: { id: true, url: true },
      });

      const results = [];
      let successCount = 0;

      // Process each asset
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
              results.push({
                id: asset.id,
                success: true,
                extractedId,
              });
              successCount++;
            } catch (err) {
              results.push({
                id: asset.id,
                success: false,
                error: String(err),
              });
            }
          } else {
            results.push({
              id: asset.id,
              success: false,
              error: 'Could not extract ID from URL after null check',
            });
          }
        } else {
          results.push({
            id: asset.id,
            success: false,
            error: 'Asset has no URL to extract ID from',
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Fixed ${successCount} of ${assetsToFix.length} assets with missing playback IDs`,
        results,
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    logger.error('Error in fix-mux-playback-ids endpoint:', error);
    return NextResponse.json({ error: 'Failed to fix Mux playback ID' }, { status: 500 });
  }
}
