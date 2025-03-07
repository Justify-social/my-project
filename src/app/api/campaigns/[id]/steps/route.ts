import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { updateCampaignWithTransactions } from '@/services/campaignService'
import { rateLimit } from '@/utils/rateLimit';

// Initialize rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  max: 20, // max 20 requests per minute per IP
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const campaignId = params.id
  const correlationId = `api-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  
  try {
    // Apply rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    try {
      await limiter.check(NextResponse, clientIp, 20);
    } catch {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          code: 'RATE_LIMIT_EXCEEDED' 
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': '60'
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
        // Format assets for database based on schema requirements
        const formattedAssets = data.creativeAssets.map((asset) => ({
          submissionId: idToUse,
          name: asset.title || '',
          description: asset.description || '',
          url: asset.url,
          // Make sure to use enum values defined in your schema
          type: asset.type?.includes('video') ? 'VIDEO' : 'IMAGE',
          fileSize: parseInt(asset.fileSize) || 0,
          format: asset.format || 'unknown',
          influencerHandle: asset.influencerHandle || null,
          budget: parseFloat(asset.influencerBudget) || 0
        }))
        
        // Execute transaction for data consistency
        const result = await prisma.$transaction(async (tx) => {
          // 1. Update campaign submission first
          const campaignUpdate = {
            step4Complete: data.step4Complete || false
          }
          
          const campaign = await tx.campaignWizardSubmission.update({
            where: { id: idToUse },
            data: campaignUpdate
          })
          
          // 2. Delete existing assets (clean slate approach)
          await tx.creativeAsset.deleteMany({
            where: { submissionId: idToUse }
          })
          
          // 3. Create new assets in batch
          if (formattedAssets.length > 0) {
            await tx.creativeAsset.createMany({
              data: formattedAssets
            })
          }
          
          return campaign
        })
        
        console.log(`[${correlationId}] Transaction completed successfully`)
        return NextResponse.json({ 
          success: true, 
          data: result 
        })
        
      } catch (txError) {
        console.error(`[${correlationId}] Transaction failed:`, txError)
        
        // Cache the submission data for recovery if needed
        try {
          // Note: In browser environment use localStorage, in Node.js environment use a different approach
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `pendingSubmission_${campaignId}`, 
              JSON.stringify({ data, timestamp: Date.now(), correlationId })
            )
          }
        } catch (cacheError) {
          console.error(`[${correlationId}] Failed to cache failed submission:`, cacheError)
        }
        
        return NextResponse.json({ 
          error: txError instanceof Error ? txError.message : 'Database transaction failed', 
          code: 'TRANSACTION_FAILED',
          correlationId
        }, { status: 500 })
      }
    }
    
    // Continue with original logic for other steps
    let updateData = {}

    switch (data.step) {
      case 1:
        updateData = {
          campaignName: data.campaignName,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          timeZone: data.timeZone,
          currency: data.currency,
          totalBudget: data.totalBudget,
          socialMediaBudget: data.socialMediaBudget,
          platform: data.platform,
          influencerHandle: data.influencerHandle,
          primaryContact: {
            create: data.primaryContact
          },
          secondaryContact: {
            create: data.secondaryContact
          }
        }
        break

      case 2:
        updateData = {
          mainMessage: data.mainMessage,
          hashtags: data.hashtags,
          memorability: data.memorability,
          keyBenefits: data.keyBenefits,
          expectedAchievements: data.expectedAchievements,
          purchaseIntent: data.purchaseIntent,
          brandPerception: data.brandPerception,
          primaryKPI: data.primaryKPI,
          secondaryKPIs: data.secondaryKPIs,
          features: data.features
        }
        break

      case 3:
        updateData = {
          audience: {
            create: {
              ...data.audience.create,
              locations: data.audience.create.locations,
              genders: data.audience.create.genders,
              screeningQuestions: data.audience.create.screeningQuestions,
              languages: data.audience.create.languages,
              competitors: data.audience.create.competitors
            }
          }
        }
        break

      case 5:
        updateData = {
          submissionStatus: 'submitted'
        }
        break
    }

    const campaign = await prisma.campaignWizardSubmission.update({
      where: { id: idToUse },
      data: updateData,
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
        creativeAssets: true,
        creativeRequirements: true
      }
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error updating campaign step:', error)
    return NextResponse.json({ error: 'Error updating campaign step' }, { status: 500 })
  }
} 