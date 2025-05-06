import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Platform, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Define the schema for an individual influencer in the request
const influencerInputSchema = z.object({
  handle: z.string().min(1, { message: 'Influencer handle is required' }),
  platform: z.nativeEnum(Platform, { errorMap: () => ({ message: 'Invalid platform provided' }) }),
});

// Define the schema for the bulk add request body
const bulkAddInfluencerSchema = z.object({
  influencers: z
    .array(influencerInputSchema)
    .min(1, { message: 'Influencer list cannot be empty' }),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const campaignId = params.id;

  if (!campaignId) {
    return NextResponse.json({ success: false, error: 'Campaign ID is missing' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validationResult = bulkAddInfluencerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { influencers: inputInfluencers } = validationResult.data;

    const campaign = await prisma.campaignWizard.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Prepare data for createMany - no need for pre-fetching existing ones now
    // The unique constraint on (campaignId, handle, platform) will prevent duplicates.
    // We will catch errors from createMany to determine skips.
    const influencersToAttemptCreate = inputInfluencers.map(inputInf => ({
      id: uuidv4(),
      handle: inputInf.handle,
      platform: inputInf.platform,
      campaignId: campaignId,
    }));

    let addedCount = 0;
    let skippedDueToDuplicate = 0;
    // We need to create one by one to accurately count skips due to P2002
    // createMany doesn't easily return which ones failed due to unique constraint.

    for (const influencerData of influencersToAttemptCreate) {
      try {
        await prisma.influencer.create({ data: influencerData });
        addedCount++;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          skippedDueToDuplicate++;
        } else {
          // For other errors, log and potentially re-throw or count as a general failure
          console.error(
            `[API /bulk-add] Error creating influencer ${influencerData.handle}:`,
            error
          );
          // Decide if this should be a general skip or halt the process
        }
      }
    }

    let message = '';
    if (addedCount > 0 && skippedDueToDuplicate > 0) {
      message = `Successfully added ${addedCount} influencers. ${skippedDueToDuplicate} influencers already existed.`;
    } else if (addedCount > 0) {
      message = `Successfully added ${addedCount} influencers.`;
    } else if (skippedDueToDuplicate > 0) {
      message = `No new influencers added. ${skippedDueToDuplicate} influencers already existed.`;
    } else {
      message = 'No influencers were processed or added.'; // Should not happen if input is validated to be non-empty
    }

    return NextResponse.json(
      { success: true, message: message, added: addedCount, skipped: skippedDueToDuplicate },
      { status: addedCount > 0 ? 201 : 200 }
    );
  } catch (error) {
    console.error(`[API /campaigns/${campaignId}/influencers/bulk-add POST] Error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to bulk add influencers to campaign',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
