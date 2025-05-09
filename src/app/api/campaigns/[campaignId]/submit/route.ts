// TODO: Reinstate and fix POST, GET, DELETE handlers which were removed due to persistent build errors related to type signatures (RouteContext).

// import { prisma } from '@/lib/prisma'; // Unused

// Define type for route context parameters
/* // Interface removed due to build errors with handlers
interface RouteContext {
  params: { campaignId: string };
}
*/

// POST, GET, DELETE handlers previously here were removed due to build errors.
// See TODO at the top of the file.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import {
  Prisma,
  Platform as PrismaPlatform,
  KPI as PrismaKPI,
  Feature as PrismaFeature,
  Currency as PrismaCurrency,
  Position as PrismaPosition,
  CreativeAssetType as PrismaCreativeAssetType,
  SubmissionStatus as PrismaSubmissionStatus,
  Status as PrismaCampaignStatus,
} from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import {
  UnauthenticatedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  DatabaseError,
} from '@/lib/errors';
import { tryCatch } from '@/lib/middleware/api/util-middleware';

interface RouteContext {
  params: { campaignId: string }; // campaignId is the CampaignWizard ID (UUID)
}

// Helper function to safely parse JSON - assuming wizard fields are already parsed by Prisma if Json type
// but useful if we were dealing with stringified JSON from elsewhere.
// For Prisma Json fields, direct access is usually fine.

// Define interfaces for the expected JSON structures within CampaignWizard
// These should ideally come from a shared types location if defined elsewhere (e.g., campaign types)
interface WizardPrimaryContact {
  firstName?: string;
  surname?: string;
  email?: string;
  position?: string; // Should match prisma Position enum
}
interface WizardSecondaryContact extends WizardPrimaryContact {}

interface WizardBudget {
  currency?: string; // Should match prisma Currency enum
  total?: number;
  socialMedia?: number;
}

interface WizardMessaging {
  mainMessage?: string;
  hashtags?: string[];
  keyBenefits?: string[];
}

interface WizardExpectedOutcomes {
  memorability?: string;
  purchaseIntent?: string;
  brandPerception?: string;
  // expectedAchievements is on Submission, not clearly here.
}

interface WizardDemographics {
  age18_24?: number;
  age25_34?: number;
  age35_44?: number;
  age45_54?: number;
  age55_64?: number;
  age65plus?: number;
  genders?: string[];
  languages?: string[];
}

interface WizardLocation {
  city?: string; // Assuming 'city' is the primary location identifier in the JSON array
  country?: string; // Optional: if country data is also present
  // Add other fields if present in your wizard.locations JSON structure
}

interface WizardTargeting {
  interests?: string[];
  keywords?: string[];
}

interface WizardAsset {
  id?: string; // Temporary ID from frontend upload?
  url?: string;
  name?: string;
  fileName?: string;
  fileSize?: number;
  type?: string; // 'video' or 'image', maps to CreativeAssetType enum
  rationale?: string;
  budget?: number;
  dimensions?: string; // e.g., "1080x1920"
  duration?: number; // in seconds for video
  associatedInfluencerIds?: string[]; // Not directly mapped to CreativeAsset, informational
}

// Explicitly type the wizard to include submissionId, as linter might be slow
// This should align with the actual Prisma type after migration
type CampaignWizardWithSubmission = Prisma.CampaignWizardGetPayload<{
  include: { Influencer: true };
}> & { submissionId?: number | null };

export async function POST(req: NextRequest, { params }: { params: { campaignId: string } }) {
  // Access campaignId at the top level of the POST handler
  const wizardIdFromParams = params.campaignId;

  return tryCatch(
    async () => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        throw new UnauthenticatedError('User not authenticated');
      }

      // Use the campaignId obtained from the outer scope
      const wizardId = wizardIdFromParams;

      if (
        !wizardId ||
        typeof wizardId !== 'string' ||
        !z.string().uuid().safeParse(wizardId).success
      ) {
        throw new BadRequestError('Valid Campaign Wizard ID is required.');
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundError('Authenticated user not found in database.');
      }
      const internalUserId = user.id;

      const wizardData = await prisma.campaignWizard.findUnique({
        where: {
          id: wizardId,
          userId: internalUserId,
        },
        include: { Influencer: true },
      });

      if (!wizardData) {
        throw new NotFoundError(
          `Campaign Wizard with ID ${wizardId} not found or not accessible by user.`
        );
      }

      // Cast to our extended type
      const wizard = wizardData as CampaignWizardWithSubmission;

      if (wizard.status !== 'DRAFT') {
        throw new BadRequestError(
          `Campaign can only be submitted if its status is DRAFT and all steps are complete. Current status: ${wizard.status}`
        );
      }

      if (!wizard.isComplete) {
        throw new BadRequestError('Campaign wizard steps are not fully completed.');
      }

      if (wizard.submissionId) {
        // This check should now be fine with the cast
        throw new BadRequestError('This campaign has already been submitted.');
      }

      const submissionResult = await prisma.$transaction(async tx => {
        const primaryContactData = wizard.primaryContact as WizardPrimaryContact | null;
        if (
          !primaryContactData ||
          !primaryContactData.email ||
          !primaryContactData.firstName ||
          !primaryContactData.surname ||
          !primaryContactData.position
        ) {
          throw new BadRequestError(
            'Primary contact details (firstName, surname, email, position) are missing or invalid.'
          );
        }
        // Validate position against enum
        if (
          !Object.values(PrismaPosition).includes(primaryContactData.position as PrismaPosition)
        ) {
          throw new BadRequestError(
            `Invalid position value for primary contact: ${primaryContactData.position}`
          );
        }
        const primaryContact = await tx.primaryContact.create({
          data: {
            firstName: primaryContactData.firstName,
            surname: primaryContactData.surname,
            email: primaryContactData.email,
            position: primaryContactData.position as PrismaPosition,
          },
        });

        let secondaryContactId: number | undefined = undefined;
        const secondaryContactData = wizard.secondaryContact as WizardSecondaryContact | null;
        if (
          secondaryContactData &&
          secondaryContactData.email &&
          secondaryContactData.firstName &&
          secondaryContactData.surname &&
          secondaryContactData.position
        ) {
          if (
            !Object.values(PrismaPosition).includes(secondaryContactData.position as PrismaPosition)
          ) {
            throw new BadRequestError(
              `Invalid position value for secondary contact: ${secondaryContactData.position}`
            );
          }
          const secondaryContact = await tx.secondaryContact.create({
            data: {
              firstName: secondaryContactData.firstName,
              surname: secondaryContactData.surname,
              email: secondaryContactData.email,
              position: secondaryContactData.position as PrismaPosition,
            },
          });
          secondaryContactId = secondaryContact.id;
        }

        const budgetData = (wizard.budget as WizardBudget | null) || {};
        const messagingData = (wizard.messaging as WizardMessaging | null) || {};
        const expectedOutcomesData =
          (wizard.expectedOutcomes as WizardExpectedOutcomes | null) || {};

        let contactsString = `Primary: ${primaryContactData.email}`;
        if (secondaryContactData && secondaryContactData.email) {
          contactsString += `, Secondary: ${secondaryContactData.email}`;
        }

        const wizardTargetPlatform = wizard.targetPlatforms?.[0];
        if (wizardTargetPlatform && !Object.values(PrismaPlatform).includes(wizardTargetPlatform)) {
          throw new BadRequestError(`Invalid target platform: ${wizardTargetPlatform}`);
        }

        const wizardPrimaryKPI = wizard.primaryKPI;
        if (!wizardPrimaryKPI || !Object.values(PrismaKPI).includes(wizardPrimaryKPI)) {
          throw new BadRequestError(`Primary KPI is missing or invalid: ${wizardPrimaryKPI}`);
        }

        const wizardCurrency = budgetData.currency?.toUpperCase();
        if (
          !wizardCurrency ||
          !Object.values(PrismaCurrency).includes(wizardCurrency as PrismaCurrency)
        ) {
          throw new BadRequestError(
            `Budget currency is missing or invalid: ${budgetData.currency}. Must be one of ${Object.values(PrismaCurrency).join(', ')}`
          );
        }

        const newSubmission = await tx.campaignWizardSubmission.create({
          data: {
            campaignName: wizard.name,
            description:
              wizard.businessGoal || messagingData.mainMessage || 'No description provided.',
            startDate: wizard.startDate,
            endDate: wizard.endDate,
            timeZone: wizard.timeZone,
            contacts: contactsString,
            currency: wizardCurrency as PrismaCurrency,
            totalBudget: Number(budgetData.total) || 0,
            socialMediaBudget: Number(budgetData.socialMedia) || 0,
            platform: (wizardTargetPlatform || PrismaPlatform.INSTAGRAM) as PrismaPlatform,
            influencerHandle: wizard.Influencer?.[0]?.handle || 'N/A',
            primaryContactId: primaryContact.id,
            secondaryContactId: secondaryContactId,
            mainMessage: messagingData.mainMessage || '',
            hashtags: (messagingData.hashtags || []).join(', '),
            memorability: expectedOutcomesData.memorability || '',
            keyBenefits: (messagingData.keyBenefits || []).join(', '),
            expectedAchievements: '', // Source unclear from CampaignWizard, defaulting
            purchaseIntent: expectedOutcomesData.purchaseIntent || '',
            brandPerception: expectedOutcomesData.brandPerception || '',
            primaryKPI: wizardPrimaryKPI,
            secondaryKPIs: (wizard.secondaryKPIs || []).filter(kpi =>
              Object.values(PrismaKPI).includes(kpi)
            ) as PrismaKPI[],
            features: (wizard.features || []).filter(feat =>
              Object.values(PrismaFeature).includes(feat)
            ) as PrismaFeature[],
            submissionStatus: PrismaSubmissionStatus.submitted,
            userId: internalUserId,
          },
        });

        const demographicsData = (wizard.demographics as WizardDemographics | null) || {};
        const locationsData = (wizard.locations as WizardLocation[] | null) || [];
        const targetingData = (wizard.targeting as WizardTargeting | null) || {};

        let ageRangeMin = 0;
        let ageRangeMax = 0;
        const ageBrackets: { min: number; max: number; key: keyof WizardDemographics }[] = [
          { min: 18, max: 24, key: 'age18_24' },
          { min: 25, max: 34, key: 'age25_34' },
          { min: 35, max: 44, key: 'age35_44' },
          { min: 45, max: 54, key: 'age45_54' },
          { min: 55, max: 64, key: 'age55_64' },
          { min: 65, max: 100, key: 'age65plus' }, // Assuming 100 as upper for 65+
        ];
        let firstAgeBracket = true;
        for (const bracket of ageBrackets) {
          if (demographicsData[bracket.key] && Number(demographicsData[bracket.key]) > 0) {
            if (firstAgeBracket) {
              ageRangeMin = bracket.min;
              firstAgeBracket = false;
            }
            ageRangeMax = bracket.max;
          }
        }
        if (ageRangeMax < ageRangeMin && !firstAgeBracket) ageRangeMax = ageRangeMin; // If only one bracket, max = min
        if (firstAgeBracket) {
          // No age data provided
          ageRangeMin = 0; // Default or handle as error
          ageRangeMax = 0;
        }

        await tx.audience.create({
          data: {
            submissionId: newSubmission.id,
            ageRangeMin: ageRangeMin,
            ageRangeMax: ageRangeMax === 100 && ageRangeMin === 65 ? 0 : ageRangeMax, // Represent 65+ as min 65, max 0 or a conventional high number
            keywords: targetingData.keywords || [],
            interests: targetingData.interests || [],
            age1824: Number(demographicsData.age18_24) || 0,
            age2534: Number(demographicsData.age25_34) || 0,
            age3544: Number(demographicsData.age35_44) || 0,
            age4554: Number(demographicsData.age45_54) || 0,
            age5564: Number(demographicsData.age55_64) || 0,
            age65plus: Number(demographicsData.age65plus) || 0,
            gender: {
              create: (demographicsData.genders || []).map((g: string) => ({
                gender: g,
                proportion: 0 /* Defaulting proportion */,
              })),
            },
            languages: {
              create: (demographicsData.languages || []).map((lang: string) => ({
                language: lang,
              })),
            },
            geographicSpread: {
              create: locationsData.map((loc: WizardLocation) => ({
                country: loc.country || loc.city || 'N/A', // Prioritize country, fallback to city
                proportion: 0 /* Defaulting proportion */,
              })),
            },
            competitors: {
              create: (wizard.competitors || []).map((comp: string) => ({ name: comp })),
            },
          },
        });

        const assetsData = (wizard.assets as WizardAsset[] | null) || [];
        if (assetsData.length > 0) {
          const creativeAssetsToCreate = assetsData
            .map(asset => {
              const assetTypeString = asset.type?.toLowerCase();
              let creativeAssetType: PrismaCreativeAssetType;
              if (assetTypeString === 'video') creativeAssetType = PrismaCreativeAssetType.video;
              else if (assetTypeString === 'image')
                creativeAssetType = PrismaCreativeAssetType.image;
              else {
                logger.warn('Unknown asset type, defaulting to image', { assetType: asset.type });
                creativeAssetType = PrismaCreativeAssetType.image; // Default or throw error
              }

              return {
                submissionId: newSubmission.id,
                name: asset.name || 'Untitled Asset',
                description: asset.rationale || '',
                url: asset.url || '', // Should be validated
                type: creativeAssetType,
                fileSize: Number(asset.fileSize) || 0,
                dimensions: asset.dimensions,
                duration: Number(asset.duration) || undefined,
                format: asset.fileName?.split('.').pop()?.toLowerCase() || '',
              };
            })
            .filter(asset => asset.url); // Filter out assets without a URL

          if (creativeAssetsToCreate.length > 0) {
            await tx.creativeAsset.createMany({
              data: creativeAssetsToCreate,
            });
          }
        }

        await tx.campaignWizard.update({
          where: { id: wizardId },
          data: {
            status: 'SUBMITTED_FINAL' as PrismaCampaignStatus,
            submissionId: newSubmission.id,
          },
        });

        return newSubmission;
      });

      logger.info('Campaign submitted successfully', {
        wizardId,
        submissionId: submissionResult.id,
        userId: clerkUserId,
      });

      return NextResponse.json(submissionResult, { status: 201 });
    },
    error => handleApiError(error, req)
  );
}

// GET and DELETE handlers can be added later if needed for this specific submit route,
// but typically submission is a POST-only action.

export {};
