import { NextRequest, NextResponse } from 'next/server';
import { SurveyPreviewData } from '@/types/brandLift';
import { Platform, KPI, CreativeAssetType } from '@prisma/client';

// Mock function to get survey data with updated platform
const getMockSurveyData = (campaignId: string, platformId: Platform): SurveyPreviewData => {
  // Different creative assets for different platforms
  const platformAssets: Record<Platform, {
    id: string;
    type: CreativeAssetType;
    url: string;
    aspectRatio: string;
    thumbnailUrl: string;
    duration?: number;
  }> = {
    [Platform.Instagram]: {
      id: 'instagram-asset',
      type: CreativeAssetType.image,
      url: 'https://placehold.co/1080x1080/1e3a8a/f8fafc?text=Instagram+Post',
      aspectRatio: '1:1',
      thumbnailUrl: 'https://placehold.co/400x400/1e3a8a/f8fafc?text=Instagram'
    },
    [Platform.TikTok]: {
      id: 'tiktok-asset',
      type: CreativeAssetType.video,
      url: 'https://placehold.co/1080x1920/0f172a/f8fafc?text=TikTok+Video',
      aspectRatio: '9:16',
      thumbnailUrl: 'https://placehold.co/400x400/0f172a/f8fafc?text=TikTok',
      duration: 15
    },
    [Platform.YouTube]: {
      id: 'youtube-asset',
      type: CreativeAssetType.video,
      url: 'https://placehold.co/1280x720/dc2626/f8fafc?text=YouTube+Video',
      aspectRatio: '16:9',
      thumbnailUrl: 'https://placehold.co/400x400/dc2626/f8fafc?text=YouTube',
      duration: 60
    }
  };

  return {
    id: campaignId,
    campaignName: "Summer Brand Awareness",
    date: new Date().toISOString(),
    brandName: "TravelPlus",
    brandLogo: "https://placehold.co/400x400/e2e8f0/1e293b?text=T%2B",
    platforms: [Platform.Instagram, Platform.TikTok, Platform.YouTube],
    activePlatform: platformId,
    adCreative: platformAssets[platformId],
    adCaption: getPlatformCaption(platformId),
    adHashtags: getPlatformHashtags(platformId),
    adMusic: platformId === Platform.TikTok ? "Wanderlust • Travel Beats" : undefined,
    questions: [
      {
        id: '1',
        title: 'How familiar are you with the brand shown in the clip?',
        type: 'Single Choice',
        kpi: KPI.brandAwareness,
        options: [
          { id: '1-1', text: 'Very familiar', image: 'https://placehold.co/400x300/e9edc9/1d3557?text=Person+Smiling' },
          { id: '1-2', text: 'Somewhat familiar', image: 'https://placehold.co/400x300/fefae0/1d3557?text=Cat+Face' },
          { id: '1-3', text: 'Not familiar at all', image: 'https://placehold.co/400x300/e9c46a/1d3557?text=I%27M+NOT+FAMILIAR' },
          { id: '1-4', text: 'None/other', image: 'https://placehold.co/400x300/e5e5e5/1d3557?text=%3F' },
        ],
        required: true
      },
      {
        id: '2',
        title: 'Which of our advertisements do you recall seeing?',
        type: 'Multiple Choice',
        kpi: KPI.adRecall,
        options: [
          { id: '2-1', text: 'Product billboard', image: 'https://placehold.co/400x300/e5e5e5/1d3557?text=Billboard' },
          { id: '2-2', text: 'Social media ad', image: 'https://placehold.co/400x300/e5e5e5/1d3557?text=Social+Media' },
          { id: '2-3', text: 'TV commercial', image: 'https://placehold.co/400x300/e5e5e5/1d3557?text=TV+Commercial' },
          { id: '2-4', text: 'None of the above', image: null },
        ],
        required: true
      }
    ],
    submissionStatus: 'draft'
  };
};

// Helper function to get platform-specific caption
const getPlatformCaption = (platform: Platform): string => {
  switch (platform) {
    case Platform.Instagram:
      return "Experience luxury travel like never before ✨";
    case Platform.TikTok:
      return "Travel in style with our exclusive packages #travel";
    case Platform.YouTube:
      return "Discover the world's most luxurious travel destinations with TravelPlus";
    default:
      return "Experience luxury travel like never before";
  }
};

// Helper function to get platform-specific hashtags
const getPlatformHashtags = (platform: Platform): string => {
  switch (platform) {
    case Platform.Instagram:
      return "#travel #luxurytravel #vacation #wanderlust";
    case Platform.TikTok:
      return "#travellife #adventure #explore #tiktoktravel";
    case Platform.YouTube:
      return "#travel #luxurytravel #travelguide";
    default:
      return "#travel #vacation";
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { campaignId, platformId } = body as { 
      campaignId: string; 
      platformId: Platform;
    };
    
    if (!campaignId || !platformId) {
      return NextResponse.json(
        { error: 'Campaign ID and Platform ID are required' },
        { status: 400 }
      );
    }
    
    // Validate platform ID
    if (!Object.values(Platform).includes(platformId)) {
      return NextResponse.json(
        { error: 'Invalid Platform ID' },
        { status: 400 }
      );
    }
    
    // TODO: Update the platform in the database
    // For now, return mock data with the updated platform
    const updatedSurvey = getMockSurveyData(campaignId, platformId);
    
    return NextResponse.json(updatedSurvey);
  } catch (error) {
    console.error('Error changing platform:', error);
    return NextResponse.json(
      { error: 'Failed to change platform' },
      { status: 500 }
    );
  }
} 