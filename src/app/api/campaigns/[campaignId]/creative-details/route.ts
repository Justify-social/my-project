import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { CreativeAsset, CreativeAssetType } from '@prisma/client';
import { CreativeDataProps, CreativeProfileData, CreativeMediaData } from '@/types/brand-lift';
import { handleApiError } from '@/lib/apiErrorHandler';
import { getAuth } from '@clerk/nextjs/server';
import { insightIQService } from '@/lib/insightiqService';
import logger from '@/lib/logger';

const paramsSchema = z.object({
  campaignId: z.string(),
});

// Type guard for the selected CreativeAsset to ensure fields exist
// This uses Prisma's actual CreativeAsset type now
const selectPrimaryCreativeAsset = (assets: CreativeAsset[]): CreativeAsset | null => {
  if (!assets || assets.length === 0) {
    logger.warn('[API /creative-details] No assets found in submission');
    return null;
  }

  // Log all assets for debugging
  logger.info('[API /creative-details] Available assets:', {
    count: assets.length,
    assetDetails: assets.map(a => ({
      id: a.id,
      type: a.type,
      muxPlaybackId: a.muxPlaybackId,
      muxAssetId: a.muxAssetId,
      muxProcessingStatus: a.muxProcessingStatus,
      isPrimary: a.isPrimaryForBrandLiftPreview,
    })),
  });

  const primary = assets.find(a => {
    const asset: any = a; // Cast to any once
    return asset.isPrimaryForBrandLiftPreview;
  });
  if (primary) {
    logger.info(
      '[API /creative-details] Selected primary asset flagged with isPrimaryForBrandLiftPreview',
      {
        id: primary.id,
        type: primary.type,
        muxPlaybackId: primary.muxPlaybackId,
        muxProcessingStatus: primary.muxProcessingStatus,
      }
    );
    return primary as CreativeAsset;
  }

  const videoWithMux = assets.find(a => {
    const asset: any = a; // Cast to any once
    return asset.type === CreativeAssetType.video && asset.muxPlaybackId;
  });
  if (videoWithMux) {
    logger.info('[API /creative-details] Selected video with Mux playback ID', {
      id: videoWithMux.id,
      muxPlaybackId: videoWithMux.muxPlaybackId,
      muxProcessingStatus: videoWithMux.muxProcessingStatus,
    });
    return videoWithMux as CreativeAsset;
  }

  const image = assets.find(a => {
    const asset: any = a; // Cast to any once
    return asset.type === CreativeAssetType.image;
  });
  if (image) return image as CreativeAsset;

  const anyVideo = assets.find(a => {
    const asset: any = a; // Cast to any once
    return asset.type === CreativeAssetType.video;
  });
  if (anyVideo) return anyVideo as CreativeAsset;

  return assets.length > 0 ? (assets[0] as CreativeAsset) : null;
};

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { userId: clerkUserId } = getAuth(request);
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await paramsPromise; // Await the params

    // Fetch your internal User record using the clerkId
    const internalUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }, // Select only the internal UUID
    });

    if (!internalUser) {
      logger.error(`[API /creative-details] No internal user found for clerkId: ${clerkUserId}`);
      return NextResponse.json({ error: 'User not found in system' }, { status: 404 });
    }
    const internalUserId = internalUser.id; // This is your internal DB User ID (UUID)

    // Explicitly pass the expected structure to Zod
    const validation = paramsSchema.safeParse({ campaignId: params.campaignId });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid campaignId format', details: validation.error.format() },
        { status: 400 }
      );
    }
    const { campaignId: submissionIdString } = validation.data;
    const submissionId = parseInt(submissionIdString, 10);
    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: 'Invalid campaignId: must be an integer' },
        { status: 400 }
      );
    }

    const campaignSubmission = await prisma.campaignWizardSubmission.findUnique({
      where: { id: submissionId },
      include: {
        creativeAssets: true,
        user: true,
        wizard: true,
        primaryContact: true,
      },
    });

    if (!campaignSubmission) {
      return NextResponse.json({ error: 'Campaign submission not found' }, { status: 404 });
    }

    // *** IMPORTANT: Compare internal user IDs ***
    if (campaignSubmission.userId !== internalUserId) {
      logger.warn(
        `[API /creative-details] Authorization failed. clerkUserId: ${clerkUserId}, internalUserId: ${internalUserId}, submissionOwnerUserId: ${campaignSubmission.userId}`
      );
      return NextResponse.json(
        { error: 'Forbidden: You do not own this campaign' },
        { status: 403 }
      );
    }

    // Explicitly cast creativeAssets to ensure full type information
    const typedCreativeAssets = (campaignSubmission.creativeAssets || []) as CreativeAsset[];

    const primaryAsset = selectPrimaryCreativeAsset(typedCreativeAssets);

    if (!primaryAsset) {
      logger.warn('[API /creative-details] No primary asset found for campaign', {
        submissionId,
        assetCount: typedCreativeAssets.length,
      });
      return NextResponse.json(
        { error: 'No suitable creative asset found for preview' },
        { status: 404 }
      );
    }

    let influencerProfileImageUrl: string | null = null;
    // Cast primaryAsset to any for property access if TypeScript is still struggling
    const primaryAssetAsAny: any = primaryAsset;

    if (campaignSubmission.influencerHandle && campaignSubmission.platform) {
      try {
        const influencerProfile = await insightIQService.fetchDetailedProfile(
          campaignSubmission.influencerHandle,
          campaignSubmission.platform
        );
        if (influencerProfile?.image_url) {
          influencerProfileImageUrl = influencerProfile.image_url;
        } else {
          logger.warn(
            `No image_url found in InsightIQ profile for ${campaignSubmission.influencerHandle}`
          );
        }
      } catch (serviceError) {
        const e = serviceError instanceof Error ? serviceError : new Error(String(serviceError));
        logger.error('Error calling insightIQService.fetchDetailedProfile', {
          handle: campaignSubmission.influencerHandle,
          error: e.message,
        });
      }
    } else {
      logger.warn(
        `Missing influencerHandle or platform for campaign submission ID: ${submissionId}, cannot fetch profile image.`
      );
    }

    const profileName =
      campaignSubmission.influencerHandle ||
      (campaignSubmission.primaryContact
        ? `${campaignSubmission.primaryContact.firstName} ${campaignSubmission.primaryContact.surname}`
        : campaignSubmission.campaignName);

    const profileData: CreativeProfileData = {
      name: profileName,
      username: campaignSubmission.influencerHandle || 'campaign_profile',
      profilePictureUrl: influencerProfileImageUrl,
    };

    // Extract Mux playback ID from URL if it's not already set but URL contains it
    if (
      primaryAssetAsAny.type === CreativeAssetType.video &&
      !primaryAssetAsAny.muxPlaybackId &&
      primaryAssetAsAny.url &&
      primaryAssetAsAny.url.includes('stream.mux.com/')
    ) {
      // Extract the playback ID from the URL (format: https://stream.mux.com/PLAYBACK_ID.m3u8)
      const urlParts = primaryAssetAsAny.url.split('stream.mux.com/');
      if (urlParts.length === 2) {
        const playbackId = urlParts[1].replace('.m3u8', '');
        if (playbackId) {
          logger.info('[API /creative-details] Extracted Mux playback ID from URL', {
            extractedId: playbackId,
            assetId: primaryAssetAsAny.id,
          });

          // Update the asset with the extracted playback ID for future requests
          try {
            await prisma.creativeAsset.update({
              where: { id: primaryAssetAsAny.id },
              data: {
                muxPlaybackId: playbackId,
                muxProcessingStatus: 'READY',
              },
            });

            // Update in-memory reference for current request
            primaryAssetAsAny.muxPlaybackId = playbackId;
            primaryAssetAsAny.muxProcessingStatus = 'READY';

            logger.info('[API /creative-details] Updated asset with extracted Mux playback ID', {
              assetId: primaryAssetAsAny.id,
              playbackId,
            });
          } catch (updateError) {
            logger.error('[API /creative-details] Failed to update asset with extracted Mux ID', {
              error: updateError,
              assetId: primaryAssetAsAny.id,
            });
            // Continue with the request even if update fails
          }
        }
      }
    }

    // Log detailed information about the primary asset
    logger.info('[API /creative-details] Primary asset details:', {
      id: primaryAssetAsAny.id,
      type: primaryAssetAsAny.type,
      name: primaryAssetAsAny.name,
      muxPlaybackId: primaryAssetAsAny.muxPlaybackId,
      muxAssetId: primaryAssetAsAny.muxAssetId,
      muxProcessingStatus: primaryAssetAsAny.muxProcessingStatus,
      url: primaryAssetAsAny.url,
      dimensions: primaryAssetAsAny.dimensions,
      duration: primaryAssetAsAny.duration,
    });

    const mediaData: CreativeMediaData = {
      type: primaryAssetAsAny.type,
      altText: primaryAssetAsAny.description || primaryAssetAsAny.name,
      imageUrl: primaryAssetAsAny.type === CreativeAssetType.image ? primaryAssetAsAny.url : null,
      url: primaryAssetAsAny.url || null,
      muxPlaybackId:
        primaryAssetAsAny.type === CreativeAssetType.video ? primaryAssetAsAny.muxPlaybackId : null,
      muxAssetId: primaryAssetAsAny.muxAssetId,
      muxProcessingStatus: primaryAssetAsAny.muxProcessingStatus,
      dimensions: primaryAssetAsAny.dimensions,
      duration: primaryAssetAsAny.duration,
    };

    // If we still don't have a muxPlaybackId but have a video URL with mux.com,
    // extract it directly for the response
    if (
      mediaData.type === 'video' &&
      !mediaData.muxPlaybackId &&
      primaryAssetAsAny.url &&
      primaryAssetAsAny.url.includes('stream.mux.com/')
    ) {
      const urlParts = primaryAssetAsAny.url.split('stream.mux.com/');
      if (urlParts.length === 2) {
        const playbackId = urlParts[1].replace('.m3u8', '');
        if (playbackId) {
          mediaData.muxPlaybackId = playbackId;
          mediaData.muxProcessingStatus = 'READY';
          logger.info('[API /creative-details] Set muxPlaybackId directly in response', {
            playbackId,
          });
        }
      }
    }

    const creativeData: CreativeDataProps = {
      profile: profileData,
      caption:
        campaignSubmission.wizard?.businessGoal ||
        primaryAssetAsAny.description ||
        campaignSubmission.mainMessage ||
        'Creative details for the campaign.',
      media: mediaData,
      campaignAssetId: primaryAssetAsAny.id.toString(),
    };

    logger.info('Fetched creative details successfully', {
      campaignId: submissionId,
      userId: clerkUserId,
      mediaDetails: {
        type: mediaData.type,
        muxPlaybackId: mediaData.muxPlaybackId,
        muxProcessingStatus: mediaData.muxProcessingStatus,
        muxAssetId: mediaData.muxAssetId,
      },
    });
    return NextResponse.json(creativeData);
  } catch (error: unknown) {
    return handleApiError(error, request);
  }
}
