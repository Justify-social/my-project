import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  CampaignWizardSubmission,
  CreativeAsset,
  CreativeRequirement,
  Audience,
} from '@prisma/client';

type CampaignWithRelations = CampaignWizardSubmission & {
  creativeAssets: CreativeAsset[];
  creativeRequirements: CreativeRequirement[];
  audience?: Audience | null;
};

// Explicit type for Audience including the optional competitors relation
// type AudienceWithCompetitors = Audience & {
//   competitors?: { id: number; name: string; audienceId: number }[] | null
// }; // Removed explicit type, rely on Prisma type inference

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const campaignId = searchParams.get('id');

  if (!campaignId) {
    return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
  }

  try {
    // Fetch campaign with all related data
    const campaign = await prisma.campaignWizardSubmission.findUnique({
      where: { id: parseInt(campaignId) },
      include: {
        creativeAssets: true,
        creativeRequirements: true,
        audience: {
          include: {
            competitors: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Process JSON fields
    let parsedContacts = null;
    let contactsParseError = null;
    try {
      parsedContacts = campaign.contacts ? JSON.parse(campaign.contacts) : null;
    } catch (e) {
      contactsParseError = (e as Error).message;
    }

    // Create objectives object from related fields
    const objectives = {
      mainMessage: campaign.mainMessage,
      hashtags: campaign.hashtags,
      primaryKPI: campaign.primaryKPI,
      secondaryKPIs: campaign.secondaryKPIs,
      features: campaign.features,
    };

    // Structure the validation response
    const validationResult = {
      id: campaign.id,
      step1: {
        status: 'complete',
        fields: {
          campaignName: {
            value: campaign.campaignName,
            status: campaign.campaignName ? 'present' : 'missing',
          },
          description: {
            value: campaign.description,
            status: campaign.description ? 'present' : 'missing',
          },
          startDate: {
            value: campaign.startDate,
            status: campaign.startDate ? 'present' : 'missing',
          },
          endDate: {
            value: campaign.endDate,
            status: campaign.endDate ? 'present' : 'missing',
          },
          timeZone: {
            value: campaign.timeZone,
            status: campaign.timeZone ? 'present' : 'missing',
          },
          currency: {
            value: campaign.currency,
            status: campaign.currency ? 'present' : 'missing',
          },
          totalBudget: {
            value: campaign.totalBudget,
            status: campaign.totalBudget !== undefined ? 'present' : 'missing',
          },
          socialMediaBudget: {
            value: campaign.socialMediaBudget,
            status: campaign.socialMediaBudget !== undefined ? 'present' : 'missing',
          },
          contacts: {
            value: parsedContacts,
            status: parsedContacts ? 'present' : 'missing',
            error: contactsParseError,
          },
        },
      },
      step2: {
        status: objectives.mainMessage ? 'complete' : 'incomplete',
        fields: {
          objectives: {
            value: objectives,
            status: objectives.mainMessage ? 'present' : 'missing',
          },
        },
      },
      step3: {
        status: (
          Array.isArray(campaign.audience) ? campaign.audience.length > 0 : !!campaign.audience
        )
          ? 'complete'
          : 'incomplete',
        fields: {
          audience: {
            value: campaign.audience,
            status: (
              Array.isArray(campaign.audience) ? campaign.audience.length > 0 : !!campaign.audience
            )
              ? 'present'
              : 'missing',
          },
          competitors: {
            value:
              Array.isArray(campaign.audience) && campaign.audience.length > 0
                ? campaign.audience[0].competitors
                : null,
            status:
              Array.isArray(campaign.audience) &&
              campaign.audience.length > 0 &&
              campaign.audience[0].competitors?.length
                ? 'present'
                : 'missing',
          },
        },
      },
      step4: {
        status:
          campaign.creativeAssets && campaign.creativeAssets.length > 0 ? 'complete' : 'incomplete',
        fields: {
          assets: {
            value: campaign.creativeAssets,
            status:
              campaign.creativeAssets && campaign.creativeAssets.length > 0 ? 'present' : 'missing',
          },
          requirements: {
            value: campaign.creativeRequirements,
            status:
              campaign.creativeRequirements && campaign.creativeRequirements.length > 0
                ? 'present'
                : 'missing',
          },
        },
      },
    };

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Error validating campaign:', error);
    return NextResponse.json({ error: 'Failed to validate campaign data' }, { status: 500 });
  }
}
