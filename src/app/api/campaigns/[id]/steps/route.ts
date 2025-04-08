import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { updateCampaignWithTransactions } from '@/services/campaign-service'
import { rateLimit } from '@/utils/rate-limit';

// Define rate limit constants
const RATE_LIMIT_INTERVAL = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // Max 20 requests per minute

// Initialize rate limiter using constants
const limiter = rateLimit({
  interval: RATE_LIMIT_INTERVAL,
  max: RATE_LIMIT_MAX,
});

// Convert ID to the appropriate type for CampaignWizard (string for UUID)
// Convert ID to the appropriate type for CampaignWizardSubmission (always a number)
const prepareCampaignSubmissionId = (id: string | number): number => {
  return typeof id === 'string' ? parseInt(id, 10) : id;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const campaignId = params.id
  const correlationId = `api-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  try {
    // Apply rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    // Minimal object satisfying ResponseWithHeaders for the check call
    const dummyResponse = { headers: { set: () => { } } };
    try {
      // Pass the dummy response object
      await limiter.check(dummyResponse, clientIp, RATE_LIMIT_MAX);
    } catch (limitError) {
      // If limiter.check throws, it means the limit was exceeded
      console.warn(`[${correlationId}] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        {
          status: 429,
          headers: {
            // Use constants for headers
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil((Date.now() + RATE_LIMIT_INTERVAL) / 1000)),
            'Retry-After': String(Math.ceil(RATE_LIMIT_INTERVAL / 1000))
          }
        }
      );
    }

    console.log(`[${correlationId}] Processing PATCH for campaign ${campaignId}`)

    const data = await request.json()

    // Check if the ID is a UUID (string format) or a numeric ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId)
    const numericId = parseInt(campaignId, 10)

    if (!isUuid && isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 })
    }

    // The ID to use depends on whether it's a UUID or numeric ID
    const idToUse = isUuid ? campaignId : numericId

    // For step 4, implement transaction-based updates for asset management
    if (data.step === 4) {
      try {
        // Adjust to the updated payload structure
        const creativeAssets = data.creativeAssets || [];

        // Format assets for storage in CampaignWizard.assets JSON field
        const formattedAssets = creativeAssets.map((asset: any) => ({
          id: asset.id || `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: asset.name || '',
          description: asset.description || '',
          url: asset.url,
          type: asset.type || 'image',
          fileSize: Number(asset.fileSize) || 0,
          format: asset.format || 'unknown',
          influencerHandle: asset.influencerHandle || null,
          budget: Number(asset.budget) || 0
        }));

        // Execute transaction for data consistency
        const result = await prisma.$transaction(async (tx) => {
          // Update CampaignWizard model - NOT CampaignWizardSubmission
          const campaign = await tx.campaignWizard.update({
            where: {
              id: idToUse.toString() // CampaignWizard uses string IDs
            },
            data: {
              updatedAt: new Date(),
              assets: formattedAssets,
              step4Complete: true // This field exists in CampaignWizard
            }
          });

          return campaign;
        });

        return NextResponse.json(result);
      } catch (error) {
        console.error(`[${correlationId}] Transaction failed:`, error);
        return NextResponse.json({ error: 'Error updating campaign step 4' }, { status: 500 });
      }
    }

    // Process other steps normally (if needed)
    let updateData: any = {};

    switch (data.step) {
      case 1:
        updateData = {
          step1Complete: true
        }
        break

      case 2:
        updateData = {
          step2Complete: true
        }
        break

      case 3:
        updateData = {
          step3Complete: true
        }
        break

      case 5:
        updateData = {
          isComplete: true,
          status: 'COMPLETED'
        }
        break
    }

    // We're working with CampaignWizard, not CampaignWizardSubmission
    const campaign = await prisma.campaignWizard.update({
      where: { id: idToUse.toString() },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error(`[${correlationId}] Error updating campaign step:`, error);
    return NextResponse.json({ error: 'Error updating campaign step' }, { status: 500 });
  }
} 