import { NextRequest, NextResponse } from 'next/server';
import { SurveyResponses } from '@/types/brandLift';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { campaignId, responses } = body as { 
      campaignId: string; 
      responses: SurveyResponses;
    };
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Save the responses to the database
    // For now, just log them and return success
    console.log(`Saving draft for campaign ${campaignId}:`, responses);
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving survey draft:', error);
    return NextResponse.json(
      { error: 'Failed to save survey draft', success: false },
      { status: 500 }
    );
  }
} 