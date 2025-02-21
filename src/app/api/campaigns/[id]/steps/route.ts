import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { step, data } = await request.json()
    const campaignId = parseInt(params.id)

    let updateData = {}

    switch (step) {
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

      case 4:
        updateData = {
          creativeGuidelines: data.creativeGuidelines,
          creativeNotes: data.creativeNotes,
          creativeAssets: {
            create: data.creativeAssets.map((asset: any) => ({
              type: asset.type,
              url: asset.url,
              title: asset.title,
              description: asset.description,
              influencerAssigned: asset.influencerAssigned,
              influencerHandle: asset.influencerHandle,
              influencerBudget: asset.influencerBudget
            }))
          },
          creativeRequirements: {
            create: data.creativeRequirements.map((req: any) => ({
              requirement: req.requirement
            }))
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
      where: { id: campaignId },
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