import { NextRequest, NextResponse } from 'next/server';
import { SurveyPreviewData } from '@/types/brandLift';
import { Platform, KPI, CreativeAssetType } from '@prisma/client';

// Mock function to get survey data - will be replaced with database queries
const getMockSurveyData = (campaignId: string, assetId: string): SurveyPreviewData => {
  // Different assets for different IDs
  const assets = {
    'asset-1': {
      id: 'asset-1',
      type: CreativeAssetType.video,
      url: 'https://placehold.co/1080x1920/0f172a/f8fafc?text=Travel+Video+1',
      aspectRatio: '9:16',
      thumbnailUrl: 'https://placehold.co/400x400/0f172a/f8fafc?text=Thumbnail+1',
      duration: 15
    },
    'asset-2': {
      id: 'asset-2',
      type: CreativeAssetType.image,
      url: 'https://placehold.co/1080x1080/1e3a8a/f8fafc?text=Travel+Image+2',
      aspectRatio: '1:1',
      thumbnailUrl: 'https://placehold.co/400x400/1e3a8a/f8fafc?text=Thumbnail+2'
    },
    'asset-3': {
      id: 'asset-3',
      type: CreativeAssetType.video,
      url: 'https://placehold.co/1080x1350/7e22ce/f8fafc?text=Travel+Video+3',
      aspectRatio: '4:5',
      thumbnailUrl: 'https://placehold.co/400x400/7e22ce/f8fafc?text=Thumbnail+3',
      duration: 30
    }
  };

  return {
    id: campaignId,
    campaignName: "Summer Brand Awareness",
    date: new Date().toISOString(),
    brandName: "TravelPlus",
    brandLogo: "https://placehold.co/400x400/e2e8f0/1e293b?text=T%2B",
    platforms: [Platform.Instagram, Platform.TikTok],
    activePlatform: Platform.TikTok,
    adCreative: assets[assetId as keyof typeof assets] || assets['asset-1'],
    adCaption: "Experience luxury travel like never before",
    adHashtags: "#travel #seniortravel #luxurytravel",
    adMusic: "Wanderlust • Travel Beats",
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

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { campaignId, assetId } = body as { 
      campaignId: string; 
      platformId?: string;
      assetId: string;
    };
    
    if (!campaignId || !assetId) {
      return NextResponse.json(
        { error: 'Campaign ID and Asset ID are required' },
        { status: 400 }
      );
    }
    
    // TODO: Update the asset in the database
    // For now, return mock data with the updated asset
    const updatedSurvey = getMockSurveyData(campaignId, assetId);
    
    return NextResponse.json(updatedSurvey);
  } catch (error) {
    console.error('Error updating creative asset:', error);
    return NextResponse.json(
      { error: 'Failed to update creative asset' },
      { status: 500 }
    );
  }
} 