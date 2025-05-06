import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma'; // Assuming prisma client is exported from @/lib/prisma
import { Platform } from '@prisma/client'; // Import the Platform enum
import { v4 as uuidv4 } from 'uuid';

// Define the schema for the request body using Zod
const addInfluencerSchema = z.object({
  handle: z.string().min(1, { message: 'Influencer handle is required' }),
  // Ensure platform is one of the values in the Prisma Platform enum
  platform: z.nativeEnum(Platform, { errorMap: () => ({ message: 'Invalid platform provided' }) }),
  marketplaceInfluencerId: z.string().min(1, { message: 'Marketplace Influencer ID is required' }),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const campaignId = params.id;

  if (!campaignId) {
    return NextResponse.json({ success: false, error: 'Campaign ID is missing' }, { status: 400 });
  }

  try {
    // Validate request body
    const body = await request.json();
    const validationResult = addInfluencerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { handle, platform, marketplaceInfluencerId } = validationResult.data;

    // 1. Check if the campaign exists
    const campaign = await prisma.campaignWizard.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // 2. Idempotency Check: Check if this influencer (via marketplaceInfluencerId) is already in this campaign
    const existingInfluencer = await prisma.influencer.findFirst({
      where: {
        campaignId: campaignId,
        platformId: marketplaceInfluencerId, // platformId stores the marketplaceInfluencerId
        platform: platform, // Also check for the same platform
      },
    });

    if (existingInfluencer) {
      return NextResponse.json(
        {
          success: true,
          message: 'Influencer already exists in this campaign for this platform',
          data: existingInfluencer,
        },
        { status: 200 } // 200 OK as it's not an error, but an existing state
      );
    }

    // 3. Create the new influencer record
    const newInfluencer = await prisma.influencer.create({
      data: {
        id: uuidv4(),
        handle,
        platform,
        platformId: marketplaceInfluencerId, // Storing marketplaceInfluencerId here
        campaignId,
        // createdAt and updatedAt are handled by Prisma schema defaults/updates
      },
    });

    return NextResponse.json(
      { success: true, data: newInfluencer, message: 'Influencer added to campaign successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[API /campaigns/${campaignId}/influencers POST] Error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to add influencer to campaign', details: errorMessage },
      { status: 500 }
    );
  }
}
