import { NextResponse } from 'next/server';
import { indexCampaigns } from '@/lib/algolia';
import { prisma } from '@/lib/prisma';

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

    // Index campaigns to Algolia
    await indexCampaigns(campaigns);

    return NextResponse.json({
      success: true,
      message: `Successfully indexed ${campaigns.length} campaigns.`,
    });
  } catch (error) {
    console.error('Error indexing campaigns:', error);
    return NextResponse.json(
      {
        error: 'Failed to index campaigns.',
        details: error instanceof Error ? error.message : String(error),
      },
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
      const campaigns = await prisma.campaignWizard.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
        take: 100, // Limit to 100 campaigns for performance
      });

      console.log(`Found ${campaigns.length} campaigns in the database.`);

      if (!campaigns.length) {
        return NextResponse.json({ warning: 'No campaigns found to index.' }, { status: 200 });
      }

      // Transform campaigns for Algolia
      console.log('Transforming campaigns for Algolia...');
      const algoliaRecords = campaigns.map((campaign: any) => ({
        objectID: campaign.id,
        id: campaign.id,
        campaignName: campaign.name || '',
        description: campaign.businessGoal || '',
        platform: campaign.platform || '',
        brand: '', // Add brand data if available
        status: campaign.status || 'DRAFT',
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString() : '',
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString() : '',
      }));

      // Index to Algolia
      console.log(`Indexing ${algoliaRecords.length} campaigns to Algolia...`);
      await indexCampaigns(algoliaRecords);

      console.log('Indexing complete!');
      return NextResponse.json({
        success: true,
        message: `Successfully indexed ${algoliaRecords.length} campaigns.`,
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
