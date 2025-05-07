import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma'; // Assuming prisma client is exported from @/lib/prisma
import { Platform, Prisma } from '@prisma/client'; // Import the Platform enum and Prisma for error types
import { v4 as uuidv4 } from 'uuid';

// Define the schema for the request body using Zod
const addInfluencerSchema = z.object({
  handle: z.string().min(1, { message: 'Influencer handle is required' }),
  // Ensure platform is one of the values in the Prisma Platform enum
  platform: z.nativeEnum(Platform, { errorMap: () => ({ message: 'Invalid platform provided' }) }),
  // marketplaceInfluencerId: z.string().min(1, { message: 'Marketplace Influencer ID is required' }), // REMOVED
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const resolvedParams = await params; // Await the params Promise
  const campaignId = resolvedParams.campaignId;

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

    // const { handle, platform, marketplaceInfluencerId } = validationResult.data; // OLD
    const { handle, platform } = validationResult.data; // NEW

    // 1. Check if the campaign exists (optional, as DB relation constraint exists, but good practice)
    const campaign = await prisma.campaignWizard.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // 2. Attempt to create the new influencer record.
    // Prisma will automatically handle the unique constraint check.
    try {
      const newInfluencer = await prisma.influencer.create({
        data: {
          id: uuidv4(),
          handle,
          platform,
          // platformId: marketplaceInfluencerId, // REMOVED
          campaignId,
        },
      });
      return NextResponse.json(
        {
          success: true,
          data: newInfluencer,
          message: 'Influencer added to campaign successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      // Check if the error is due to the unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // P2002 is the code for unique constraint failure
        return NextResponse.json(
          {
            success: true,
            message: 'Influencer already exists in this campaign for this platform',
          },
          { status: 200 } // Return 200 OK as it's not a new creation but not an error either
        );
      }
      // Re-throw other database errors to be caught by the outer try-catch
      throw error;
    }
  } catch (error) {
    console.error(`[API /campaigns/${campaignId}/influencers POST] Error:`, error);
    // Handle potential database errors specifically if needed, otherwise keep generic
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const statusCode = error instanceof Prisma.PrismaClientKnownRequestError ? 409 : 500; // Example: Use 409 for constraint errors if not caught above

    return NextResponse.json(
      { success: false, error: 'Failed to add influencer to campaign', details: errorMessage },
      { status: statusCode }
    );
  }
}
