import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

// In-memory storage for demonstration - replace with actual database
const savedInfluencers: Array<{
  profileId: string;
  handle: string;
  name?: string;
  platform: string;
  avatarUrl?: string;
  bio?: string;
  followerCount?: number;
  engagementRate?: number;
  isVerified?: boolean;
  category?: string;
  justifyScore?: number;
  website?: string;
  contactEmail?: string;
  savedAt: string;
  savedBy: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.info('[SavedInfluencers API] Received save request:', {
      profileId: body.profileId,
      handle: body.handle,
      name: body.name,
    });

    // Validate required fields
    if (!body.profileId && !body.handle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either profileId or handle is required',
        },
        { status: 400 }
      );
    }

    // Check if influencer is already saved
    const existingInfluencer = savedInfluencers.find(
      inf => inf.profileId === body.profileId || inf.handle === body.handle
    );

    if (existingInfluencer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Influencer already saved to your list',
          message: 'This influencer is already in your saved list',
        },
        { status: 409 }
      );
    }

    // Save the influencer
    const savedInfluencer = {
      profileId: body.profileId || `temp-${Date.now()}`,
      handle: body.handle,
      name: body.name,
      platform: body.platform || 'INSTAGRAM',
      avatarUrl: body.avatarUrl,
      bio: body.bio,
      followerCount: body.followerCount,
      engagementRate: body.engagementRate,
      isVerified: body.isVerified || false,
      category: body.category,
      justifyScore: body.justifyScore,
      website: body.website,
      contactEmail: body.contactEmail,
      savedAt: body.savedAt || new Date().toISOString(),
      savedBy: body.savedBy || 'current-user',
    };

    savedInfluencers.push(savedInfluencer);

    logger.info('[SavedInfluencers API] Successfully saved influencer:', {
      profileId: savedInfluencer.profileId,
      handle: savedInfluencer.handle,
      totalSaved: savedInfluencers.length,
    });

    return NextResponse.json({
      success: true,
      message: `${savedInfluencer.name || savedInfluencer.handle} has been saved to your list`,
      data: {
        influencer: savedInfluencer,
        totalSaved: savedInfluencers.length,
      },
    });
  } catch (error) {
    logger.error('[SavedInfluencers API] Error saving influencer:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      originalError: error,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while saving influencer',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'current-user';

    logger.info('[SavedInfluencers API] Fetching saved influencers for user:', { userId });

    // Filter by user (in real implementation, this would be from auth)
    const userSavedInfluencers = savedInfluencers.filter(inf => inf.savedBy === userId);

    return NextResponse.json({
      success: true,
      data: {
        influencers: userSavedInfluencers,
        total: userSavedInfluencers.length,
      },
    });
  } catch (error) {
    logger.error('[SavedInfluencers API] Error fetching saved influencers:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      originalError: error,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while fetching saved influencers',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const handle = searchParams.get('handle');

    if (!profileId && !handle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either profileId or handle is required for deletion',
        },
        { status: 400 }
      );
    }

    logger.info('[SavedInfluencers API] Deleting saved influencer:', { profileId, handle });

    const _initialLength = savedInfluencers.length;
    const index = savedInfluencers.findIndex(
      inf => inf.profileId === profileId || inf.handle === handle
    );

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Influencer not found in saved list',
        },
        { status: 404 }
      );
    }

    const removedInfluencer = savedInfluencers.splice(index, 1)[0];

    logger.info('[SavedInfluencers API] Successfully removed influencer:', {
      profileId: removedInfluencer.profileId,
      handle: removedInfluencer.handle,
      totalRemaining: savedInfluencers.length,
    });

    return NextResponse.json({
      success: true,
      message: `${removedInfluencer.name || removedInfluencer.handle} has been removed from your saved list`,
      data: {
        removedInfluencer,
        totalRemaining: savedInfluencers.length,
      },
    });
  } catch (error) {
    logger.error('[SavedInfluencers API] Error deleting saved influencer:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      originalError: error,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while deleting saved influencer',
      },
      { status: 500 }
    );
  }
}
