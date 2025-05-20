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
  const primary = assets.find(a => a.isPrimaryForBrandLiftPreview);
  if (primary) return primary;
  const videoWithMux = assets.find(a => a.type === CreativeAssetType.video && a.muxPlaybackId);
  if (videoWithMux) return videoWithMux;
  const image = assets.find(a => a.type === CreativeAssetType.image);
  if (image) return image;
  const anyVideo = assets.find(a => a.type === CreativeAssetType.video);
  if (anyVideo) return anyVideo;
  return assets[0];
};

export async function GET(request: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const { userId: clerkUserId } = getAuth(request);
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validation = paramsSchema.safeParse(params);
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
        creativeAssets: true, // Should include all scalar fields of CreativeAsset by default
        user: true,
        wizard: true,
        primaryContact: true,
        // No explicit select for creativeAssets, relying on Prisma to include all fields
        // including muxPlaybackId and isPrimaryForBrandLiftPreview if client is up-to-date.
      },
    });

    if (!campaignSubmission) {
      return NextResponse.json({ error: 'Campaign submission not found' }, { status: 404 });
    }

    if (campaignSubmission.userId !== clerkUserId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this campaign' },
        { status: 403 }
      );
    }

    const primaryAsset = selectPrimaryCreativeAsset(campaignSubmission.creativeAssets || []);
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
      type: primaryAsset.type, // Relying on CreativeAssetType being compatible with 'image' | 'video'
      altText: primaryAsset.description || primaryAsset.name,
      imageUrl: primaryAsset.type === CreativeAssetType.image ? primaryAsset.url : null,
      muxPlaybackId:
        primaryAsset.type === CreativeAssetType.video ? primaryAsset.muxPlaybackId : null,
      dimensions: primaryAsset.dimensions,
      duration: primaryAsset.duration,
    };

    const creativeData: CreativeDataProps = {
      profile: profileData,
      caption:
        campaignSubmission.wizard?.businessGoal ||
        primaryAsset.description ||
        campaignSubmission.mainMessage ||
        'Creative details for the campaign.',
      media: mediaData,
      campaignAssetId: primaryAsset.id.toString(),
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
