import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  CampaignWizardSubmission,
  CreativeAsset,
  CampaignWizard,
  PrimaryContact,
  User,
  Platform,
  CreativeAssetType,
} from '@prisma/client';
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
  if (!assets || assets.length === 0) return null;

  const primary = assets.find(a => {
    const asset = a as any; // Cast to any once
    return asset.isPrimaryForBrandLiftPreview;
  });
  if (primary) return primary as CreativeAsset;

  const videoWithMux = assets.find(a => {
    const asset = a as any; // Cast to any once
    return asset.type === CreativeAssetType.video && asset.muxPlaybackId;
  });
  if (videoWithMux) return videoWithMux as CreativeAsset;

  const image = assets.find(a => (a as any).type === CreativeAssetType.image);
  if (image) return image as CreativeAsset;

  const anyVideo = assets.find(a => (a as any).type === CreativeAssetType.video);
  if (anyVideo) return anyVideo as CreativeAsset;

  return assets.length > 0 ? (assets[0] as CreativeAsset) : null;
};

export async function GET(request: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const { userId: clerkUserId } = getAuth(request);
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const primaryAsset = selectPrimaryCreativeAsset(typedCreativeAssets); // Use the typed array

    if (!primaryAsset) {
      return NextResponse.json(
        { error: 'No suitable creative asset found for preview' },
        { status: 404 }
      );
    }

    let influencerProfileImageUrl: string | null = null;
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

    const mediaData: CreativeMediaData = {
      type: (primaryAsset as any).type,
      altText: (primaryAsset as any).description || (primaryAsset as any).name,
      imageUrl:
        (primaryAsset as any).type === CreativeAssetType.image ? (primaryAsset as any).url : null,
      muxPlaybackId:
        (primaryAsset as any).type === CreativeAssetType.video
          ? (primaryAsset as any).muxPlaybackId
          : null,
      dimensions: (primaryAsset as any).dimensions,
      duration: (primaryAsset as any).duration,
    };

    const creativeData: CreativeDataProps = {
      profile: profileData,
      caption:
        campaignSubmission.wizard?.businessGoal ||
        (primaryAsset as any).description ||
        campaignSubmission.mainMessage ||
        'Creative details for the campaign.',
      media: mediaData,
      campaignAssetId: (primaryAsset as any).id.toString(),
    };

    return NextResponse.json(creativeData);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return handleApiError({
      error: err,
      message: 'Failed to fetch campaign creative details',
      request,
    });
  }
}
