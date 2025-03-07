import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Platform } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const handle = searchParams.get('handle');

    if (!platform || !handle) {
      return NextResponse.json(
        { error: 'Platform and handle are required' },
        { status: 400 }
      );
    }

    // Convert platform string to Platform enum
    // Ensure it matches one of the valid enum values
    const platformUpper = platform.toUpperCase();
    const validPlatform = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK'].includes(platformUpper) 
      ? platformUpper as Platform 
      : 'INSTAGRAM' as Platform;

    // First, try to find the influencer in our database
    const existingInfluencer = await prisma.influencer.findFirst({
      where: {
        platform: validPlatform,
        handle: handle,
      },
    });

    if (existingInfluencer) {
      return NextResponse.json({
        influencer: {
          id: existingInfluencer.id,
          handle: existingInfluencer.handle,
          platform: existingInfluencer.platform,
          followerCount: 10000, // Placeholder - would come from real data
          verified: true,
          avatarUrl: `https://ui-avatars.com/api/?name=${handle}&background=random`,
        }
      });
    }

    // If not found in DB, simulate a response as if we queried an external API
    // In a real app, this would be a call to Phyllo, Hype Auditor, or similar service
    const mockInfluencerData = {
      id: `mock-${platform}-${handle}`,
      handle: handle,
      platform: platform,
      followerCount: Math.floor(Math.random() * 500000) + 5000,
      engagementRate: (Math.random() * 5 + 1).toFixed(2),
      verified: Math.random() > 0.5,
      avatarUrl: `https://ui-avatars.com/api/?name=${handle}&background=random`,
    };

    return NextResponse.json({ influencer: mockInfluencerData });
  } catch (error) {
    console.error('Error validating influencer:', error);
    return NextResponse.json(
      { error: 'Failed to validate influencer' },
      { status: 500 }
    );
  }
} 