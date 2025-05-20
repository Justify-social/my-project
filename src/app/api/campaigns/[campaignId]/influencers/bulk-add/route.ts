import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// import { prisma } from '@/lib/prisma'; // Commented out as unused in active code
// import { Platform, Prisma } from '@prisma/client'; // Commented out as unused in active code
// import { v4 as uuidv4 } from 'uuid'; // Commented out as unused in active code

// Define the schema for an individual influencer in the request
// const influencerInputSchema = z.object({ // Commented out
//   handle: z.string().min(1, { message: 'Influencer handle is required' }),
//   platform: z.nativeEnum(Platform, { errorMap: () => ({ message: 'Invalid platform provided' }) }),
// });

// Define the schema for the bulk add request body
// const bulkAddInfluencerSchema = z.object({ // Commented out
//   influencers: z
//     .array(influencerInputSchema)
//     .min(1, { message: 'Influencer list cannot be empty' }),
// });

// Use the exact signature pattern from the working route
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const resolvedParams = await params; // Await the params Promise
  console.log('Received request for campaign ID:', resolvedParams.campaignId);
  return NextResponse.json({ success: true, message: 'Minimal response OK' });

  /* // --- Original Logic Commented Out ---
  const campaignId = resolvedParams.campaignId;
 
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
 
    const influencersToAttemptCreate = inputInfluencers.map(inputInf => ({
      id: uuidv4(),
      handle: inputInf.handle,
      platform: inputInf.platform,
      campaignId: campaignId,
    }));
 
    let addedCount = 0;
    let skippedDueToDuplicate = 0;
 
    for (const influencerData of influencersToAttemptCreate) {
      try {
        await prisma.influencer.create({ data: influencerData });
        addedCount++;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          skippedDueToDuplicate++;
        } else {
          console.error(
            `[API /bulk-add] Error creating influencer ${influencerData.handle}:`,
            error
          );
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
      message = 'No influencers were processed or added.'; 
    }
 
    return NextResponse.json(
      { success: true, message: message, added: addedCount, skipped: skippedDueToDuplicate },
      { status: addedCount > 0 ? 201 : 200 }
    );
  } catch (error) {
    console.error(`[API /campaigns/${resolvedParams.campaignId}/influencers/bulk-add POST] Error:`, error);
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
  */ // --- End Original Logic Commented Out ---
}
