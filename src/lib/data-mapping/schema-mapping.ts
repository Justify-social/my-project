import {
  CampaignWizardSubmission,
  Audience,
  AudienceLocation,
  AudienceGender,
  AudienceScreeningQuestion,
  AudienceLanguage,
  AudienceCompetitor,
  CreativeAsset,
  KPI,
  Feature,
  Position,
  Platform,
  Currency,
  Prisma,
  CreativeAssetType,
  CreativeRequirement,
} from '@prisma/client';
import { z } from 'zod'; // Assuming Zod might be useful for validation later

// Remove imports for non-existent files
// import { ... } from './form-types';
// import { ... } from './api-payload-types';

/**
 * Type definitions for form data from each step of the wizard
 */

// Step 1: Campaign Overview
interface OverviewFormData {
  name?: string;
  businessGoal?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  timeZone?: string;
  contacts?: string | object; // Keep flexible for now
  currency?: string;
  totalBudget?: number | string;
  socialMediaBudget?: number | string;
  platform?: string;
  influencerHandle?: string;
  // primary/secondary contacts omitted as they weren't used in mapOverviewToSchema
}

// Step 2: Objectives
interface ObjectivesFormData {
  mainMessage?: string;
  hashtags?: string;
  memorability?: string;
  keyBenefits?: string;
  expectedAchievements?: string;
  purchaseIntent?: string;
  brandPerception?: string;
  primaryKPI?: string; // Input as string
  secondaryKPIs?: string[]; // Input as strings
  features?: string[]; // Input as strings
}

// Step 3: Audience
interface AudienceFormData {
  audience?: {
    ageDistribution?: {
      age1824?: number | string;
      age2534?: number | string;
      age3544?: number | string;
      age4554?: number | string;
      age5564?: number | string;
      age65plus?: number | string;
    };
    keywords?: string[];
    interests?: string[];
    competitors?: string[];
    genders?: string[];
    languages?: string[];
    locations?: { country: string; proportion?: number /* ... */ }[];
    screeningQuestions?: { question: string /* ... */ }[];
  };
}

// Step 4: Creative Assets
interface AssetsFormData {
  creativeAssets?: {
    type: CreativeAssetType;
    name?: string;
    description?: string;
    url?: string;
    fileSize?: number;
    format?: string;
    dimensions?: string;
    duration?: number;
  }[];
  creativeRequirements?: { description: string; mandatory?: boolean }[];
}

// --- Enum Conversion Helpers ---

function stringToCurrency(input: string | undefined): Currency | undefined {
  if (!input) return undefined;
  const upperInput = input.toUpperCase();
  if (upperInput in Currency) {
    return upperInput as Currency;
  }
  console.warn(`Invalid Currency string: ${input}`);
  return undefined; // Or throw error / return default
}

function stringToPlatform(input: string | undefined): Platform | undefined {
  if (!input) return undefined;
  const upperInput = input.toUpperCase();
  if (upperInput in Platform) {
    return upperInput as Platform;
  }
  console.warn(`Invalid Platform string: ${input}`);
  return undefined; // Or throw error / return default
}

function stringToKpi(input: string | undefined): KPI | undefined {
  if (!input) return undefined;
  // Attempt common variations
  const key = Object.keys(KPI).find(
    k =>
      k.toLowerCase() === input.toLowerCase() ||
      k.replace(/_/g, '').toLowerCase() === input.replace(/[-_\s]/g, '').toLowerCase()
  );
  if (key) {
    return KPI[key as keyof typeof KPI];
  }
  console.warn(`Invalid KPI string: ${input}`);
  return undefined;
}

function stringArrayToKpis(inputs: string[] | undefined): KPI[] | undefined {
  if (!inputs) return undefined;
  return inputs.map(s => stringToKpi(s)).filter((k): k is KPI => k !== undefined);
}

function stringToFeature(input: string | undefined): Feature | undefined {
  if (!input) return undefined;
  const key = Object.keys(Feature).find(
    k =>
      k.toLowerCase() === input.toLowerCase() ||
      k.replace(/_/g, '').toLowerCase() === input.replace(/[-_\s]/g, '').toLowerCase()
  );
  if (key) {
    return Feature[key as keyof typeof Feature];
  }
  console.warn(`Invalid Feature string: ${input}`);
  return undefined;
}

function stringArrayToFeatures(inputs: string[] | undefined): Feature[] | undefined {
  if (!inputs) return undefined;
  return inputs.map(s => stringToFeature(s)).filter((f): f is Feature => f !== undefined);
}

/**
 * Map functions to transform form data to database schema
 */

// Map Step 1 form data to CampaignWizardSubmission fields
export function mapOverviewToSchema(
  data: OverviewFormData
): Partial<Prisma.CampaignWizardSubmissionCreateInput> {
  const startDate = data.startDate ? new Date(data.startDate) : undefined;
  const endDate = data.endDate ? new Date(data.endDate) : undefined;

  return {
    campaignName: data.name,
    description: data.businessGoal,
    startDate: startDate && !isNaN(startDate.getTime()) ? startDate : undefined,
    endDate: endDate && !isNaN(endDate.getTime()) ? endDate : undefined,
    timeZone: data.timeZone,
    contacts: typeof data.contacts === 'object' ? JSON.stringify(data.contacts) : data.contacts,
    currency: stringToCurrency(data.currency),
    totalBudget: data.totalBudget ? parseFloat(String(data.totalBudget)) : undefined,
    socialMediaBudget: data.socialMediaBudget
      ? parseFloat(String(data.socialMediaBudget))
      : undefined,
    platform: stringToPlatform(data.platform),
    influencerHandle: data.influencerHandle,
  };
}

// Map Step 2 form data to CampaignWizardSubmission fields
export function mapObjectivesToSchema(
  data: ObjectivesFormData
): Partial<Prisma.CampaignWizardSubmissionCreateInput> {
  return {
    mainMessage: data.mainMessage,
    hashtags: data.hashtags,
    memorability: data.memorability,
    keyBenefits: data.keyBenefits,
    expectedAchievements: data.expectedAchievements,
    purchaseIntent: data.purchaseIntent,
    brandPerception: data.brandPerception,
    primaryKPI: stringToKpi(data.primaryKPI),
    secondaryKPIs: stringArrayToKpis(data.secondaryKPIs),
    features: stringArrayToFeatures(data.features),
  };
}

// Map Step 3 form data to Audience-related tables
export function mapAudienceToSchema(data: AudienceFormData): {
  audience: Partial<Prisma.AudienceCreateWithoutCampaignInput> & {
    ageRangeMin: number;
    ageRangeMax: number;
  };
  locations: Prisma.AudienceLocationCreateWithoutAudienceInput[];
  genders: Prisma.AudienceGenderCreateWithoutAudienceInput[];
  screeningQuestions: Prisma.AudienceScreeningQuestionCreateWithoutAudienceInput[];
  languages: Prisma.AudienceLanguageCreateWithoutAudienceInput[];
  competitors: Prisma.AudienceCompetitorCreateWithoutAudienceInput[];
} {
  const defaultReturn = {
    audience: { ageRangeMin: 0, ageRangeMax: 100 }, // Ensure defaults are in the type base
    locations: [],
    genders: [],
    screeningQuestions: [],
    languages: [],
    competitors: [],
  };
  const audienceData = data?.audience;
  if (!audienceData) return defaultReturn as any; // Cast needed due to partial vs required mismatch, implementation ensures correctness

  const audience: Partial<Prisma.AudienceCreateWithoutCampaignInput> & {
    ageRangeMin: number;
    ageRangeMax: number;
  } = {
    age1824: Number(audienceData.ageDistribution?.age1824 ?? 0),
    age2534: Number(audienceData.ageDistribution?.age2534 ?? 0),
    age3544: Number(audienceData.ageDistribution?.age3544 ?? 0),
    age4554: Number(audienceData.ageDistribution?.age4554 ?? 0),
    age5564: Number(audienceData.ageDistribution?.age5564 ?? 0),
    age65plus: Number(audienceData.ageDistribution?.age65plus ?? 0),
    keywords: audienceData.keywords ?? [],
    interests: audienceData.interests ?? [],
    ageRangeMin: 0, // Default/Calculate if needed
    ageRangeMax: 100, // Default/Calculate if needed
  };

  const locations = (audienceData.locations ?? []).map(
    (loc): Prisma.AudienceLocationCreateWithoutAudienceInput => ({
      country: loc.country || 'Unknown',
      proportion: loc.proportion ?? 0,
    })
  );

  const genders = (audienceData.genders ?? []).map(
    (gender): Prisma.AudienceGenderCreateWithoutAudienceInput => ({
      gender: gender || 'Unknown',
      proportion: 0,
    })
  );

  const screeningQuestions = (audienceData.screeningQuestions ?? []).map(
    (q): Prisma.AudienceScreeningQuestionCreateWithoutAudienceInput => ({
      question: q.question || 'No Question',
    })
  );

  const languages = (audienceData.languages ?? []).map(
    (language): Prisma.AudienceLanguageCreateWithoutAudienceInput => ({
      language: language || 'Unknown',
    })
  );

  const competitors = (audienceData.competitors ?? []).map(
    (name): Prisma.AudienceCompetitorCreateWithoutAudienceInput => ({
      name: name || 'Unknown',
    })
  );

  return { audience, locations, genders, screeningQuestions, languages, competitors };
}

// Map Step 4 form data to CreativeAsset and CreativeRequirement tables
export function mapAssetsToSchema(data: AssetsFormData): {
  creativeAssets: Prisma.CreativeAssetCreateWithoutSubmissionInput[];
  creativeRequirements: Prisma.CreativeRequirementCreateWithoutSubmissionInput[];
} {
  const creativeAssets = (data?.creativeAssets ?? [])
    .map((asset): Prisma.CreativeAssetCreateWithoutSubmissionInput | null => {
      if (!asset.type || !(asset.type in CreativeAssetType)) {
        console.warn(`Invalid or missing asset type: ${asset.type}, skipping asset.`);
        return null;
      }
      if (!asset.url) {
        console.warn(`Asset URL missing for ${asset.name || 'Untitled Asset'}, skipping asset.`);
        return null;
      }
      return {
        name: asset.name || 'Untitled Asset',
        description: asset.description || '',
        url: asset.url,
        type: asset.type,
        fileSize: Number(asset.fileSize) || 0,
        format: asset.format || 'unknown',
        dimensions: asset.dimensions,
        duration: asset.duration ? Number(asset.duration) : null,
      };
    })
    .filter((a): a is Prisma.CreativeAssetCreateWithoutSubmissionInput => a !== null);

  const creativeRequirements = (data?.creativeRequirements ?? []).map(
    (req): Prisma.CreativeRequirementCreateWithoutSubmissionInput => ({
      description: req.description || 'No Description',
      mandatory: req.mandatory ?? false,
    })
  );

  return { creativeAssets, creativeRequirements };
}

/**
 * Transaction helper for updating campaign and related data
 */
export function buildCampaignUpdateTransaction(
  campaignId: number,
  data: OverviewFormData & ObjectivesFormData & AudienceFormData & AssetsFormData
) {
  // Combine all mapping functions
  const campaignData = {
    ...mapOverviewToSchema(data),
    ...mapObjectivesToSchema(data),
  };

  const {
    audience: audienceData,
    locations,
    genders,
    screeningQuestions,
    languages,
    competitors,
  } = mapAudienceToSchema(data);

  const { creativeAssets, creativeRequirements } = mapAssetsToSchema(data);

  // Return the transaction builder function that accepts a transaction
  return async (tx: Prisma.TransactionClient) => {
    // 1. Update main campaign record
    const updatedCampaign = await tx.campaignWizardSubmission.update({
      where: { id: campaignId },
      data: campaignData,
    });

    // 2. Handle audience data if present
    if (Object.keys(audienceData).length > 0) {
      // Check if audience record exists
      const existingAudience = await tx.audience.findFirst({
        where: { campaignId },
      });

      if (existingAudience) {
        // Update existing audience record
        await tx.audience.update({
          where: { id: existingAudience.id },
          data: audienceData,
        });

        // Handle audience relations

        // Locations: Delete and recreate
        if (locations.length > 0) {
          await tx.audienceLocation.deleteMany({
            where: { audienceId: existingAudience.id },
          });

          for (const location of locations) {
            await tx.audienceLocation.create({
              data: {
                ...location,
                audienceId: existingAudience.id,
              },
            });
          }
        }

        // Genders: Delete and recreate
        if (genders.length > 0) {
          await tx.audienceGender.deleteMany({
            where: { audienceId: existingAudience.id },
          });

          for (const gender of genders) {
            await tx.audienceGender.create({
              data: {
                ...gender,
                audienceId: existingAudience.id,
              },
            });
          }
        }

        // Screening Questions: Delete and recreate
        if (screeningQuestions.length > 0) {
          await tx.audienceScreeningQuestion.deleteMany({
            where: { audienceId: existingAudience.id },
          });

          for (const question of screeningQuestions) {
            await tx.audienceScreeningQuestion.create({
              data: {
                ...question,
                audienceId: existingAudience.id,
              },
            });
          }
        }

        // Languages: Delete and recreate
        if (languages.length > 0) {
          await tx.audienceLanguage.deleteMany({
            where: { audienceId: existingAudience.id },
          });

          for (const language of languages) {
            await tx.audienceLanguage.create({
              data: {
                ...language,
                audienceId: existingAudience.id,
              },
            });
          }
        }

        // Competitors: Delete and recreate
        if (competitors.length > 0) {
          await tx.audienceCompetitor.deleteMany({
            where: { audienceId: existingAudience.id },
          });

          for (const competitor of competitors) {
            await tx.audienceCompetitor.create({
              data: {
                ...competitor,
                audienceId: existingAudience.id,
              },
            });
          }
        }
      } else {
        // Create new audience record with relations
        const newAudience = await tx.audience.create({
          data: {
            ...audienceData,
            campaignId,
          },
        });

        // Create relations for the new audience
        if (locations.length > 0) {
          for (const location of locations) {
            await tx.audienceLocation.create({
              data: {
                ...location,
                audienceId: newAudience.id,
              },
            });
          }
        }

        if (genders.length > 0) {
          for (const gender of genders) {
            await tx.audienceGender.create({
              data: {
                ...gender,
                audienceId: newAudience.id,
              },
            });
          }
        }

        if (screeningQuestions.length > 0) {
          for (const question of screeningQuestions) {
            await tx.audienceScreeningQuestion.create({
              data: {
                ...question,
                audienceId: newAudience.id,
              },
            });
          }
        }

        if (languages.length > 0) {
          for (const language of languages) {
            await tx.audienceLanguage.create({
              data: {
                ...language,
                audienceId: newAudience.id,
              },
            });
          }
        }

        if (competitors.length > 0) {
          for (const competitor of competitors) {
            await tx.audienceCompetitor.create({
              data: {
                ...competitor,
                audienceId: newAudience.id,
              },
            });
          }
        }
      }
    }

    // 3. Handle creative assets if present
    if (creativeAssets.length > 0) {
      // Delete existing assets
      await tx.creativeAsset.deleteMany({
        where: { submissionId: campaignId },
      });

      // Create new assets
      for (const asset of creativeAssets) {
        await tx.creativeAsset.create({
          data: {
            ...asset,
            submissionId: campaignId,
          },
        });
      }
    }

    // 4. Handle creative requirements if present
    if (creativeRequirements.length > 0) {
      // Delete existing requirements
      await tx.creativeRequirement.deleteMany({
        where: { submissionId: campaignId },
      });

      // Create new requirements
      for (const requirement of creativeRequirements) {
        await tx.creativeRequirement.create({
          data: {
            ...requirement,
            submissionId: campaignId,
          },
        });
      }
    }

    return updatedCampaign;
  };
}

// --- REMOVE Unused Helper Functions ---
