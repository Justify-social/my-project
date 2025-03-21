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
  Position
} from '@prisma/client';

/**
 * Type definitions for form data from each step of the wizard
 */

// Step 1: Campaign Overview
export interface OverviewFormData {
  name?: string;
  businessGoal?: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  contacts?: string | string[];
  currency?: string;
  totalBudget?: number | string;
  socialMediaBudget?: number | string;
  platform?: string;
  influencerHandle?: string;
  primaryContact?: {
    firstName: string;
    surname: string;
    email: string;
    position: string;
  };
  secondaryContact?: {
    firstName: string;
    surname: string;
    email: string;
    position: string;
  };
}

// Step 2: Objectives
export interface ObjectivesFormData {
  mainMessage?: string;
  hashtags?: string;
  memorability?: string;
  keyBenefits?: string;
  expectedAchievements?: string;
  purchaseIntent?: string;
  brandPerception?: string;
  primaryKPI?: KPI | string;
  secondaryKPIs?: KPI[] | string[];
  features?: Feature[] | string[];
}

// Step 3: Audience
export interface AudienceFormData {
  audience?: {
    location?: string[];
    ageDistribution?: {
      age1824: number;
      age2534: number;
      age3544: number;
      age4554: number;
      age5564: number;
      age65plus: number;
    };
    gender?: string[];
    otherGender?: string;
    screeningQuestions?: string[];
    languages?: string[];
    educationLevel?: string;
    jobTitles?: string[];
    incomeLevel?: number | string;
    competitors?: string[];
  };
}

// Step 4: Creative Assets
export interface AssetsFormData {
  creativeAssets?: {
    type: string;
    url: string;
    fileName: string;
    fileSize?: number;
    assetName: string;
    influencerHandle?: string;
    influencerName?: string;
    influencerFollowers?: string;
    whyInfluencer?: string;
    budget?: number;
  }[];
  creativeRequirements?: string[];
}

/**
 * Map functions to transform form data to database schema
 */

// Map Step 1 form data to CampaignWizardSubmission fields
export function mapOverviewToSchema(data: OverviewFormData): Partial<CampaignWizardSubmission> {
  return {
    campaignName: data.name,
    description: data.businessGoal,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    timeZone: data.timeZone,
    // Handle contacts as JSON string if it's an array
    contacts: typeof data.contacts === 'object' 
      ? JSON.stringify(data.contacts) 
      : data.contacts,
    currency: data.currency as any, // Cast to Currency enum
    totalBudget: typeof data.totalBudget === 'string' 
      ? parseFloat(data.totalBudget) 
      : data.totalBudget,
    socialMediaBudget: typeof data.socialMediaBudget === 'string' 
      ? parseFloat(data.socialMediaBudget) 
      : data.socialMediaBudget,
    platform: data.platform as any, // Cast to Platform enum
    influencerHandle: data.influencerHandle,
  };
}

// Map Step 2 form data to CampaignWizardSubmission fields
export function mapObjectivesToSchema(data: ObjectivesFormData): Partial<CampaignWizardSubmission> {
  return {
    mainMessage: data.mainMessage,
    hashtags: data.hashtags,
    memorability: data.memorability,
    keyBenefits: data.keyBenefits,
    expectedAchievements: data.expectedAchievements,
    purchaseIntent: data.purchaseIntent,
    brandPerception: data.brandPerception,
    primaryKPI: data.primaryKPI as KPI,
    secondaryKPIs: data.secondaryKPIs as KPI[],
    features: data.features as Feature[],
  };
}

// Map Step 3 form data to Audience-related tables
export function mapAudienceToSchema(data: AudienceFormData): {
  audience: Partial<Audience>;
  locations: Partial<AudienceLocation>[];
  genders: Partial<AudienceGender>[];
  screeningQuestions: Partial<AudienceScreeningQuestion>[];
  languages: Partial<AudienceLanguage>[];
  competitors: Partial<AudienceCompetitor>[];
} {
  if (!data.audience) {
    return {
      audience: {},
      locations: [],
      genders: [],
      screeningQuestions: [],
      languages: [],
      competitors: []
    };
  }

  const audienceData = data.audience;
  
  // Main audience data
  const audience: Partial<Audience> = {
    age1824: audienceData.ageDistribution?.age1824 || 0,
    age2534: audienceData.ageDistribution?.age2534 || 0,
    age3544: audienceData.ageDistribution?.age3544 || 0,
    age4554: audienceData.ageDistribution?.age4554 || 0,
    age5564: audienceData.ageDistribution?.age5564 || 0,
    age65plus: audienceData.ageDistribution?.age65plus || 0,
    otherGender: audienceData.otherGender || '',
    educationLevel: audienceData.educationLevel || '',
    jobTitles: Array.isArray(audienceData.jobTitles) 
      ? audienceData.jobTitles.join(', ') 
      : (audienceData.jobTitles || ''),
    incomeLevel: typeof audienceData.incomeLevel === 'string' 
      ? audienceData.incomeLevel 
      : String(audienceData.incomeLevel || ''),
  };

  // Related collections
  const locations = (audienceData.location || []).map(location => ({
    location
  }));

  const genders = (audienceData.gender || []).map(gender => ({
    gender
  }));

  const screeningQuestions = (audienceData.screeningQuestions || []).map(question => ({
    question
  }));

  const languages = (audienceData.languages || []).map(language => ({
    language
  }));

  const competitors = (audienceData.competitors || []).map(competitor => ({
    competitor
  }));

  return {
    audience,
    locations,
    genders,
    screeningQuestions,
    languages,
    competitors
  };
}

// Map Step 4 form data to CreativeAsset and CreativeRequirement tables
export function mapAssetsToSchema(data: AssetsFormData): {
  creativeAssets: Partial<CreativeAsset>[];
  creativeRequirements: { requirement: string }[];
} {
  const creativeAssets = (data.creativeAssets || []).map(asset => ({
    type: asset.type,
    url: asset.url,
    fileName: asset.fileName,
    fileSize: asset.fileSize,
    assetName: asset.assetName,
    influencerHandle: asset.influencerHandle,
    influencerName: asset.influencerName,
    influencerFollowers: asset.influencerFollowers,
    whyInfluencer: asset.whyInfluencer,
    budget: asset.budget,
  }));

  const creativeRequirements = (data.creativeRequirements || []).map(requirement => ({
    requirement
  }));

  return {
    creativeAssets,
    creativeRequirements
  };
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
    ...mapObjectivesToSchema(data)
  };
  
  const { 
    audience: audienceData,
    locations,
    genders,
    screeningQuestions,
    languages,
    competitors
  } = mapAudienceToSchema(data);
  
  const {
    creativeAssets,
    creativeRequirements
  } = mapAssetsToSchema(data);

  // Return the transaction builder function that accepts a transaction
  return async (tx: any) => {
    // 1. Update main campaign record
    const updatedCampaign = await tx.campaignWizardSubmission.update({
      where: { id: campaignId },
      data: campaignData
    });

    // 2. Handle audience data if present
    if (Object.keys(audienceData).length > 0) {
      // Check if audience record exists
      const existingAudience = await tx.audience.findFirst({
        where: { campaignId }
      });

      if (existingAudience) {
        // Update existing audience record
        await tx.audience.update({
          where: { id: existingAudience.id },
          data: audienceData
        });

        // Handle audience relations
        
        // Locations: Delete and recreate
        if (locations.length > 0) {
          await tx.audienceLocation.deleteMany({
            where: { audienceId: existingAudience.id }
          });
          
          for (const location of locations) {
            await tx.audienceLocation.create({
              data: {
                ...location,
                audienceId: existingAudience.id
              }
            });
          }
        }

        // Genders: Delete and recreate
        if (genders.length > 0) {
          await tx.audienceGender.deleteMany({
            where: { audienceId: existingAudience.id }
          });
          
          for (const gender of genders) {
            await tx.audienceGender.create({
              data: {
                ...gender,
                audienceId: existingAudience.id
              }
            });
          }
        }

        // Screening Questions: Delete and recreate
        if (screeningQuestions.length > 0) {
          await tx.audienceScreeningQuestion.deleteMany({
            where: { audienceId: existingAudience.id }
          });
          
          for (const question of screeningQuestions) {
            await tx.audienceScreeningQuestion.create({
              data: {
                ...question,
                audienceId: existingAudience.id
              }
            });
          }
        }

        // Languages: Delete and recreate
        if (languages.length > 0) {
          await tx.audienceLanguage.deleteMany({
            where: { audienceId: existingAudience.id }
          });
          
          for (const language of languages) {
            await tx.audienceLanguage.create({
              data: {
                ...language,
                audienceId: existingAudience.id
              }
            });
          }
        }

        // Competitors: Delete and recreate
        if (competitors.length > 0) {
          await tx.audienceCompetitor.deleteMany({
            where: { audienceId: existingAudience.id }
          });
          
          for (const competitor of competitors) {
            await tx.audienceCompetitor.create({
              data: {
                ...competitor,
                audienceId: existingAudience.id
              }
            });
          }
        }
      } else {
        // Create new audience record with relations
        const newAudience = await tx.audience.create({
          data: {
            ...audienceData,
            campaignId
          }
        });

        // Create relations for the new audience
        if (locations.length > 0) {
          for (const location of locations) {
            await tx.audienceLocation.create({
              data: {
                ...location,
                audienceId: newAudience.id
              }
            });
          }
        }

        if (genders.length > 0) {
          for (const gender of genders) {
            await tx.audienceGender.create({
              data: {
                ...gender,
                audienceId: newAudience.id
              }
            });
          }
        }

        if (screeningQuestions.length > 0) {
          for (const question of screeningQuestions) {
            await tx.audienceScreeningQuestion.create({
              data: {
                ...question,
                audienceId: newAudience.id
              }
            });
          }
        }

        if (languages.length > 0) {
          for (const language of languages) {
            await tx.audienceLanguage.create({
              data: {
                ...language,
                audienceId: newAudience.id
              }
            });
          }
        }

        if (competitors.length > 0) {
          for (const competitor of competitors) {
            await tx.audienceCompetitor.create({
              data: {
                ...competitor,
                audienceId: newAudience.id
              }
            });
          }
        }
      }
    }

    // 3. Handle creative assets if present
    if (creativeAssets.length > 0) {
      // Delete existing assets
      await tx.creativeAsset.deleteMany({
        where: { submissionId: campaignId }
      });
      
      // Create new assets
      for (const asset of creativeAssets) {
        await tx.creativeAsset.create({
          data: {
            ...asset,
            submissionId: campaignId
          }
        });
      }
    }

    // 4. Handle creative requirements if present
    if (creativeRequirements.length > 0) {
      // Delete existing requirements
      await tx.creativeRequirement.deleteMany({
        where: { submissionId: campaignId }
      });
      
      // Create new requirements
      for (const requirement of creativeRequirements) {
        await tx.creativeRequirement.create({
          data: {
            ...requirement,
            submissionId: campaignId
          }
        });
      }
    }

    return updatedCampaign;
  };
} 