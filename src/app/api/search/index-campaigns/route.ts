import { NextResponse } from 'next/server';
import { reindexAllCampaigns } from '@/lib/algolia';
import { prisma } from '@/lib/prisma';
import { CampaignWizard } from '@prisma/client';

// This route will be called to index campaigns in Algolia
export async function POST(req: Request) {
  try {
    // This should be secured with proper authentication
    // Only authenticated admin users should be allowed to index campaigns

    // Extract campaigns from request body
    const body = await req.json();
    const { campaigns } = body;

    if (!campaigns || !Array.isArray(campaigns)) {
      return NextResponse.json(
        { error: 'Invalid request. Campaigns array is required.' },
        { status: 400 }
      );
    }

    // Index campaigns to Algolia - assuming 'campaigns' are CampaignWizard[]
    await reindexAllCampaigns(campaigns as CampaignWizard[]);

    return NextResponse.json({
      success: true,
      message: `Successfully indexed ${campaigns.length} campaigns.`,
    });
  } catch (error) {
    const unknownError = error as unknown; // Type as unknown
    console.error('Error indexing campaigns:', unknownError);
    // Check if it's an error object before accessing message
    const errorMessage =
      unknownError instanceof Error ? unknownError.message : String(unknownError);
    return NextResponse.json(
      { success: false, error: 'Failed to index campaigns', details: errorMessage },
      { status: 500 }
    );
  }
}

// Index all campaigns by fetching them directly from the database
export async function GET() {
  try {
    console.log('Starting campaign indexing process...');

    // Authentication/Authorization is handled by middleware

    try {
      // Fetch all campaigns directly from the database
      console.log('Fetching campaigns from database...');
      const campaignsFromDb = await prisma.campaignWizard.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
        // Consider if a limit is appropriate or if all should be indexed.
        // take: 100, // Limit to 100 campaigns for performance - re-instating for safety, can be removed if all must be indexed
      });

      console.log(`Found ${campaignsFromDb.length} campaigns in the database.`);

      if (!campaignsFromDb.length) {
        return NextResponse.json({ warning: 'No campaigns found to index.' }, { status: 200 });
      }

      // No manual transformation needed here, reindexAllCampaigns will handle it.
      console.log(`Indexing ${campaignsFromDb.length} campaigns to Algolia...`);
      await reindexAllCampaigns(campaignsFromDb);

      console.log('Indexing complete!');
      return NextResponse.json({
        success: true,
        message: `Successfully indexed ${campaignsFromDb.length} campaigns.`,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        {
          error: 'Database error',
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error reindexing campaigns:', error);
    return NextResponse.json(
      {
        error: 'Failed to reindex campaigns.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
