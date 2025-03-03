import { NextRequest, NextResponse } from 'next/server';
import { SurveyPreviewData } from '@/types/brandLift';
import { Platform, KPI, CreativeAssetType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { connectToDatabase } from '@/lib/db';
import { mapCampaignToSurveyData } from '@/utils/surveyMappers';

// Mock data for development - will be replaced with actual database queries
const getMockSurveyData = (campaignId: string): SurveyPreviewData => {
  return {
    id: campaignId,
    campaignName: "Summer Brand Awareness",
    date: new Date().toISOString(),
    brandName: "TravelPlus",
    brandLogo: "https://placehold.co/400x400/e2e8f0/1e293b?text=T%2B",
    platforms: [Platform.Instagram, Platform.TikTok],
    activePlatform: Platform.TikTok,
    adCreative: {
      id: "asset-1",
      type: CreativeAssetType.video,
      url: "https://placehold.co/1080x1920/0f172a/f8fafc?text=Travel+Video",
      aspectRatio: "9:16",
      thumbnailUrl: "https://placehold.co/400x400/0f172a/f8fafc?text=Thumbnail",
      duration: 15
    },
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

export async function GET(request: NextRequest) {
  try {
    // Get the campaign ID from the query parameters
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Convert to integer for Prisma query
    const id = parseInt(campaignId);
    
    // Check if the ID is a valid number
    if (isNaN(id)) {
      console.warn(`Invalid campaign ID format: ${campaignId}. Using mock data.`);
      return NextResponse.json(getMockSurveyData(campaignId));
    }
    
    // Fetch the campaign data from the database
    try {
      console.log(`Fetching campaign data for ID: ${id}`);
      
      const campaign = await prisma.campaignWizardSubmission.findUnique({
        where: { id },
        include: {
          primaryContact: true,
          secondaryContact: true,
          audience: {
            include: {
              locations: true,
              genders: true,
              screeningQuestions: true,
              languages: true,
              competitors: true
            }
          },
          creativeAssets: true
        }
      });
      
      if (!campaign) {
        console.warn(`Campaign with ID ${id} not found. Using mock data.`);
        return NextResponse.json(getMockSurveyData(campaignId));
      }
      
      // Map the campaign data to survey preview data format using the utility function
      console.log(`Mapping campaign data to survey preview format for ID: ${id}`);
      const mockData = getMockSurveyData(campaignId);
      const surveyData = mapCampaignToSurveyData(campaign, mockData);
      
      console.log(`Successfully mapped survey data for campaign ID: ${id}`);
      return NextResponse.json(surveyData);
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      console.warn(`Error querying database for campaign ID: ${id}. Using mock data.`);
      return NextResponse.json(getMockSurveyData(campaignId));
    }
    
  } catch (error) {
    console.error('Error in survey preview API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey preview data' },
      { status: 500 }
    );
  }
} 