import { z } from 'zod';
import {
  // Platform as PrismaPlatform, // REMOVED: Unused import
  KPI as PrismaKPI,
  Feature as PrismaFeature,
  Status as PrismaStatus, // For CampaignWizard status
  Currency as PrismaCurrency,
  Position as PrismaPosition,
  // CreativeAssetType as PrismaCreativeAssetType // Already defined locally if needed
} from '@prisma/client';
// Import the SSOT PlatformEnum
import { PlatformEnum } from '@/types/enums';
import { checkCampaignNameExists } from '@/lib/actions/campaigns'; // Placeholder import
import { logger as _logger } from '@/utils/logger'; // Import logger - Prefixed

//---------------------------------------------------------------------------
// Prisma Enum Definitions & Zod Schemas
//---------------------------------------------------------------------------

/** Base Currency Enum (from Prisma) */
export const CurrencyEnum = z.nativeEnum(PrismaCurrency);
/** Campaign Status Enum (from Prisma) */
export const StatusEnum = z.nativeEnum(PrismaStatus);
/** Key Performance Indicator Enum (from Prisma) */
export const KPIEnum = z.nativeEnum(PrismaKPI);
/** Campaign Feature Enum (from Prisma) */
export const FeatureEnum = z.nativeEnum(PrismaFeature);

/** Extended Feature Enum that includes both Prisma features and additional string literals */
export const ExtendedFeatureEnum = z.union([
  FeatureEnum,
  z.literal('INFLUENCERS'), // Additional feature not yet in Prisma enum
]);
/** Contact Position Enum (from Prisma) */
export const PositionEnum = z.nativeEnum(PrismaPosition);
/** Creative Asset Type Enum (from Prisma) */
export const CreativeAssetTypeEnum = z.enum(['image', 'video']);
/** Submission Status Enum (from Prisma) */
export const SubmissionStatusEnum = z.enum(['draft', 'submitted']);

//---------------------------------------------------------------------------
// Zod Schemas for Complex / JSON Types (Based on schema.prisma)
//---------------------------------------------------------------------------

/** Schema for Contact object (used in primary/secondary contacts). */
export const ContactSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    surname: z.string().min(1, { message: 'Surname is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    position: PositionEnum.optional(),
  })
  .passthrough(); // Add passthrough here

/** Schema for Budget object (used within DraftCampaignData). Handles string input cleanup. */
export const BudgetSchema = z
  .object({
    currency: CurrencyEnum.nullable().optional(),
    total: z.number().nullable().optional(),
    socialMedia: z.number().nullable().optional(),
  })
  .nullable()
  .default(null); // Ensure a default if not provided, even if null

/** Schema for Influencer object (used in DraftCampaignData). */
export const InfluencerSchema = z
  .object({
    id: z.string().optional(),
    platform: z.nativeEnum(PlatformEnum),
    handle: z.string().min(1, { message: 'Influencer handle is required' }),
    platformId: z.string().nullable().optional(),
    campaignId: z.string().optional(),
    createdAt: z
      .string()
      .datetime({ offset: true, message: 'Invalid ISO date string' })
      .nullable()
      .optional(),
    updatedAt: z
      .string()
      .datetime({ offset: true, message: 'Invalid ISO date string' })
      .nullable()
      .optional(),

    // Rich display data for UI restoration
    name: z.string().nullable().optional(), // Display name (e.g., "Leo Messi")
    avatarUrl: z.string().nullable().optional(), // Profile image URL
    isVerified: z.boolean().nullable().optional(), // Verification status (blue checkmark)
    followersCount: z.number().nullable().optional(), // Follower count for display
    engagementRate: z.number().nullable().optional(), // Engagement rate percentage

    // Contact & Profile Information
    email: z.string().nullable().optional(), // Contact email for collaborations
    bio: z.string().nullable().optional(), // Profile bio/description
    location: z.string().nullable().optional(), // Location/country
    website: z.string().nullable().optional(), // Personal/business website
    language: z.string().nullable().optional(), // Primary language of content

    // Content & Audience Analytics
    category: z.string().nullable().optional(), // Content category/niche
    contentTypes: z.array(z.string()).nullable().optional(), // Types of content they create
    postingFrequency: z.string().nullable().optional(), // How often they post
    averageLikes: z.number().nullable().optional(), // Average likes per post
    averageComments: z.number().nullable().optional(), // Average comments per post
    averageShares: z.number().nullable().optional(), // Average shares per post
    averageReach: z.number().nullable().optional(), // Average reach per post
    averageImpressions: z.number().nullable().optional(), // Average impressions per post

    // Audience Demographics & Quality
    audienceDemographics: z.any().nullable().optional(), // JSON data for flexibility
    audienceQuality: z.string().nullable().optional(), // HIGH/MEDIUM/LOW quality score
    fakeFollowerPercent: z.number().nullable().optional(), // Percentage of fake followers

    // Business & Collaboration
    rateCard: z.any().nullable().optional(), // JSON pricing data
    brandCollaborations: z.any().nullable().optional(), // JSON collaboration history
    preferredBrands: z.array(z.string()).nullable().optional(), // Preferred brand types
    blacklistedBrands: z.array(z.string()).nullable().optional(), // Brands they won't work with

    // Performance Metrics
    ctr: z.number().nullable().optional(), // Click-through rate
    cpm: z.number().nullable().optional(), // Cost per mille
    cpc: z.number().nullable().optional(), // Cost per click
    conversionRate: z.number().nullable().optional(), // Conversion rate
    brandLiftMetrics: z.any().nullable().optional(), // JSON brand lift data

    // Platform-specific data
    instagramData: z.any().nullable().optional(), // JSON Instagram metrics
    youtubeData: z.any().nullable().optional(), // JSON YouTube metrics
    tiktokData: z.any().nullable().optional(), // JSON TikTok metrics

    // Marketplace & Discovery
    isMarketplaceVisible: z.boolean().nullable().optional(), // Show in marketplace
    marketplaceRating: z.number().nullable().optional(), // Rating from campaigns
    responseTime: z.string().nullable().optional(), // Response time to inquiries
    lastActiveDate: z.string().datetime({ offset: true }).nullable().optional(), // Last active

    // Campaign Performance Tracking
    totalCampaigns: z.number().nullable().optional(), // Total campaigns completed
    averageRating: z.number().nullable().optional(), // Average rating from brands
    completionRate: z.number().nullable().optional(), // Campaign completion rate
  })
  .passthrough(); // Added passthrough for safety, review if needed

/** Schema for draft Asset object (used within DraftCampaignData assets array). */
export const DraftAssetSchema = z
  .object({
    id: z.string().optional(), // Client-side temporary ID or key
    fieldId: z.string().optional(), // Required for useFieldArray keyName
    name: z.string().optional(),
    type: CreativeAssetTypeEnum.optional(),
    url: z.string().url().optional(), // Changed from .optional().nullable()
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    description: z.string().optional(),
    temp: z.boolean().optional(),
    rationale: z.string().optional(),
    budget: z.number().positive({ message: 'Budget must be positive' }).optional().nullable(),
    associatedInfluencerIds: z.array(z.string()).optional(),

    // Mux-specific fields
    internalAssetId: z.number().optional(), // Our DB CreativeAsset ID
    muxAssetId: z.string().optional(), // Mux Asset ID
    muxPlaybackId: z.string().optional(), // Mux Playback ID (once ready)
    muxProcessingStatus: z.string().optional(), // e.g., 'AWAITING_UPLOAD', 'MUX_PROCESSING', 'READY', 'ERROR'

    // User linkage
    userId: z.string().optional(), // Internal User ID (UUID) of the uploader

    // New fields
    createdAt: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .optional()
      .or(z.date().nullable().optional()),
    updatedAt: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .optional()
      .or(z.date().nullable().optional()),
    isPrimaryForBrandLiftPreview: z.boolean().nullable().optional(),
  })
  .passthrough(); // Use passthrough instead of strict

/** TypeScript type inferred from DraftAssetSchema. */
export type DraftAsset = z.infer<typeof DraftAssetSchema>; // EXPORT DraftAsset type

/** Schema for Demographics object (used within DraftCampaignData). */
export const DemographicsSchema = z
  .object({
    age18_24: z.number().int().min(0).max(100).optional().default(0),
    age25_34: z.number().int().min(0).max(100).optional().default(0),
    age35_44: z.number().int().min(0).max(100).optional().default(0),
    age45_54: z.number().int().min(0).max(100).optional().default(0),
    age55_64: z.number().int().min(0).max(100).optional().default(0),
    age65plus: z.number().int().min(0).max(100).optional().default(0),
    /** Selected genders. */
    genders: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
  })
  .passthrough(); // Use passthrough instead of strict

/** Schema for Location object (used within DraftCampaignData locations array). */
export const LocationSchema = z
  .object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  })
  .passthrough(); // Use passthrough instead of strict

//---------------------------------------------------------------------------
// Main Zod Schema for Draft Campaign Data (WizardContext State)
//---------------------------------------------------------------------------

/** Base schema definition for the Campaign Wizard's draft state. */
export const DraftCampaignDataBaseSchema = z
  .object({
    /** Unique identifier for the draft campaign (UUID). */
    id: z.string().optional(), // This is the CampaignWizard UUID
    /** Timestamp of creation. */
    createdAt: z.string().datetime().nullable().optional().or(z.date()).optional(),
    /** Timestamp of last update. */
    updatedAt: z.string().datetime().nullable().optional().or(z.date()).optional(),
    /** Current step the user is on in the wizard. */
    currentStep: z.number().default(1),
    /** Flag indicating if the wizard has been fully completed. */
    isComplete: z.boolean().default(false),
    /** Current status of the campaign draft. */
    status: StatusEnum.default('DRAFT'),

    // --- Step 1 Data ---
    /** Name of the campaign. */
    name: z.string().min(1, { message: 'Campaign name is required' }),
    /** High-level business goal for the campaign. */
    businessGoal: z.string().nullable().optional(),
    /** NEW: Brand name for the campaign. */
    brand: z.string().min(1, { message: 'Brand name is required' }),
    /** NEW: Website URL for the campaign/brand. */
    website: z.string().url({ message: 'Invalid website URL' }).nullable().optional(),
    /** Campaign start date (string format from API). */
    startDate: z
      .string()
      .datetime({ offset: true, message: 'Invalid ISO date string' })
      .nullable()
      .optional(),
    /** Campaign end date (string format from API). */
    endDate: z
      .string()
      .datetime({ offset: true, message: 'Invalid ISO date string' })
      .nullable()
      .optional(),
    /** Timezone for the campaign schedule. */
    timeZone: z.string().nullable().optional(),
    /** Primary contact person for the campaign. */
    primaryContact: ContactSchema.nullable().optional(),
    /** Secondary contact person for the campaign. */
    secondaryContact: z.preprocess(
      val => {
        const contact = val as Partial<z.infer<typeof ContactSchema>> | null;
        if (
          contact &&
          typeof contact === 'object' &&
          !contact.firstName &&
          !contact.surname &&
          !contact.email
        ) {
          return null;
        }
        return val;
      },
      ContactSchema.nullable().optional() // Uses base schema
    ),
    /** Additional contacts (if applicable). */
    additionalContacts: z.array(ContactSchema).default([]).nullable().optional(), // Allow null/undefined, default to [] if omitted during parse
    /** Budget details for the campaign. */
    budget: BudgetSchema, // Already defaults to null
    /** List of influencers associated with the campaign (Key changed to match API). */
    Influencer: z.array(InfluencerSchema).default([]).nullable().optional(),
    /** Flag indicating Step 1 completion. */
    step1Complete: z.boolean().default(false),

    // --- Step 2 Data ---
    /** Primary Key Performance Indicator (KPI) for the campaign. */
    primaryKPI: KPIEnum.nullable().optional(),
    /** Secondary KPIs for the campaign. */
    secondaryKPIs: z.array(KPIEnum).default([]).nullable().optional(),
    /** Messaging details (structure assumed, verify with Step 2 form). */
    messaging: z
      .object({
        mainMessage: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
        keyBenefits: z.array(z.string()).optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
    /** Expected outcomes (Define known string fields). */
    expectedOutcomes: z
      .object({
        memorability: z.string().optional(),
        purchaseIntent: z.string().optional(),
        brandPerception: z.string().optional(),
        // Add other known fields if applicable
      })
      .passthrough()
      .nullable()
      .optional(),
    /** Selected features for the campaign (e.g., Brand Lift). */
    features: z.array(ExtendedFeatureEnum).default([]).nullable().optional(),
    /** Flag indicating Step 2 completion. */
    step2Complete: z.boolean().default(false),

    // --- Step 3 Data ---
    /** Audience demographic details (using refined schema). */
    demographics: DemographicsSchema.nullable().optional(),
    /** Audience location details. */
    locations: z.array(LocationSchema).default([]).nullable().optional(),
    /** Audience targeting criteria (Define known array fields). */
    targeting: z
      .object({
        interests: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        // Add other known fields if applicable
      })
      .passthrough()
      .nullable()
      .optional(),
    /** List of competitor brands/handles. */
    competitors: z.array(z.string()).default([]).nullable().optional(),
    /** Target platforms for the campaign (e.g., Instagram, TikTok). Added for Marketplace filtering. */
    targetPlatforms: z.array(z.nativeEnum(PlatformEnum)).default([]).nullable().optional(),
    /** Flag indicating Step 3 completion. */
    step3Complete: z.boolean().default(false),

    // --- Step 4 Data ---
    /** List of creative assets uploaded for the campaign. */
    assets: z.array(DraftAssetSchema).default([]).nullable().optional(),
    /** Creative guidelines or instructions. */
    guidelines: z.string().nullable().optional(),
    /** Specific creative requirements (structure assumed, verify with Step 4 form). */
    requirements: z
      .array(z.object({ description: z.string(), mandatory: z.boolean() }))
      .default([])
      .nullable()
      .optional(),
    /** Additional notes for Step 4. */
    notes: z.string().nullable().optional(),
    /** Flag indicating Step 4 completion. */
    step4Complete: z.boolean().default(false),

    // --- Relations / Other ---
    /** ID of the user who owns the campaign draft. */
    userId: z.string().nullable().optional(),

    // Add submissionId if it's part of the wizard's state
    submissionId: z.number().int().nullable().optional(), // Foreign key to CampaignWizardSubmission, now also nullable

    // --- Frontend Flow State (Not Persisted in CampaignWizard model) ---
    /** IDs of influencers selected in the marketplace during the wizard flow. */
    selectedInfluencerIds: z.array(z.string()).optional(),
    /** Flag indicating the user navigated to the marketplace from the wizard. */
    isFindingInfluencers: z.boolean().optional(),
  })
  .passthrough(); // Apply passthrough to the main base schema

/** Refined Zod schema for Draft Campaign Data, adding cross-field validations. */
export const DraftCampaignDataSchema = DraftCampaignDataBaseSchema
  // Refine dates (now comparing strings)
  .refine(
    data => {
      try {
        // Ensure dates are valid ISO strings before comparison
        if (
          data.startDate &&
          typeof data.startDate === 'string' &&
          data.endDate &&
          typeof data.endDate === 'string' &&
          z.string().datetime({ offset: true }).safeParse(data.startDate).success &&
          z.string().datetime({ offset: true }).safeParse(data.endDate).success
        ) {
          // Compare Date objects created from strings
          return new Date(data.endDate) >= new Date(data.startDate);
        }
      } catch {
        return false;
      }
      return true; // Allow validation if one or both dates are missing/invalid or not strings
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  )
  // Refine budget
  .refine(
    data => {
      const budget = data.budget;
      // Explicitly check if budget itself exists, is an object, and then if its properties are numbers
      if (
        budget &&
        typeof budget === 'object' &&
        budget !== null &&
        'socialMedia' in budget &&
        typeof budget.socialMedia === 'number' &&
        'total' in budget &&
        typeof budget.total === 'number'
      ) {
        return budget.socialMedia <= budget.total;
      }
      return true;
    },
    {
      message: 'Social media budget cannot exceed total budget',
      path: ['budget', 'socialMedia'],
    }
  )
  .refine(
    data => {
      if (
        data.demographics &&
        typeof data.demographics === 'object' &&
        data.demographics !== null &&
        // Add 'in' checks for each age property before accessing
        'age18_24' in data.demographics &&
        'age25_34' in data.demographics &&
        'age35_44' in data.demographics &&
        'age45_54' in data.demographics &&
        'age55_64' in data.demographics &&
        'age65plus' in data.demographics
      ) {
        const sum =
          (data.demographics.age18_24 || 0) +
          (data.demographics.age25_34 || 0) +
          (data.demographics.age35_44 || 0) +
          (data.demographics.age45_54 || 0) +
          (data.demographics.age55_64 || 0) +
          (data.demographics.age65plus || 0);
        return sum === 0 || Math.abs(sum - 100) < 0.01;
      }
      return true;
    },
    {
      message: 'Total age distribution must equal 100%',
      path: ['demographics', 'age18_24'],
    }
  )
  // ADD ASYNC NAME VALIDATION (Reverted approach without ctx)
  .refine(
    async data => {
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        return true;
      }
      // If we are validating data that already has an ID (i.e., an existing draft being loaded),
      // skip the remote name existence check for this particular schema parsing path.
      // The name duplication check is more relevant when creating a new campaign
      // or when explicitly validating a name change in a form.
      if (data.id) {
        return true;
      }
      try {
        const exists = await checkCampaignNameExists(data.name); // data.name is now confirmed string
        return !exists; // Return true if name does NOT exist (passes validation)
      } catch (error) {
        // If check fails, treat as validation failure
        // The message below will be shown
        _logger.error('Async name validation failed:', error);
        return false;
      }
    },
    {
      // This message now applies if name exists OR if the check fails
      message: "A campaign with this name already exists or couldn't be verified.",
      path: ['name'],
    }
  );

/** TypeScript type inferred from DraftCampaignDataSchema, representing the wizard's state. */
export type DraftCampaignData = z.infer<typeof DraftCampaignDataSchema>;

//---------------------------------------------------------------------------
// Zod Schema for Final Submission Payload (POST /api/campaigns)
//---------------------------------------------------------------------------
// NOTE: CRITICAL - This schema MUST be verified and aligned with the exact
// structure expected by the backend API endpoint (`POST /api/campaigns`).
// The current structure is an educated guess based on DraftCampaignData and potential relations.

/** Schema for Primary Contact in the submission payload. */
export const PrimaryContactSubmissionSchema = ContactSchema; // Reuse ContactSchema
/** Schema for Secondary Contact (optional) in the submission payload. */
export const SecondaryContactSubmissionSchema = ContactSchema.optional();

/** Schema for Audience Location in the submission payload. */
export const AudienceLocationSubmissionSchema = z.object({
  country: z.string(),
  proportion: z.number(),
});
/** Schema for Audience Gender distribution in the submission payload. */
export const AudienceGenderSubmissionSchema = z.object({
  gender: z.string(), // Consider specific enum if applicable (e.g., 'Male', 'Female', 'Non-binary')
  proportion: z.number(),
});
/** Schema for Audience Screening Questions in the submission payload. */
export const AudienceScreeningQuestionSubmissionSchema = z.object({
  question: z.string(),
});
/** Schema for Audience Languages in the submission payload. */
export const AudienceLanguageSubmissionSchema = z.object({
  language: z.string(),
});
/** Schema for Audience Competitors in the submission payload. */
export const AudienceCompetitorSubmissionSchema = z.object({
  name: z.string(),
});

/** Schema for the Audience object within the submission payload. */
export const AudienceSubmissionSchema = z.object({
  ageRangeMin: z.number(),
  ageRangeMax: z.number(),
  keywords: z.array(z.string()),
  interests: z.array(z.string()),
  // Age distribution fields (align with Step 5 aggregation logic)
  age1824: z.number().default(0),
  age2534: z.number().default(0),
  age3544: z.number().default(0),
  age4554: z.number().default(0),
  age5564: z.number().default(0),
  age65plus: z.number().default(0),
  // Relational data (verify expected structure - IDs or nested objects?)
  competitors: z.array(AudienceCompetitorSubmissionSchema).optional(),
  gender: z.array(AudienceGenderSubmissionSchema).optional(), // Matches Prisma relation name
  languages: z.array(AudienceLanguageSubmissionSchema).optional(),
  geographicSpread: z.array(AudienceLocationSubmissionSchema).optional(), // Matches Prisma relation name
  screeningQuestions: z.array(AudienceScreeningQuestionSubmissionSchema).optional(),
});

/** Schema for Creative Assets within the submission payload. */
export const CreativeAssetSubmissionSchema = z.object({
  // NOTE: Verify fields required by the backend to create CreativeAsset records.
  name: z.string(),
  description: z.string().optional(), // Made optional
  url: z.string().url(),
  type: CreativeAssetTypeEnum,
  fileSize: z.number().optional(), // Made optional
  dimensions: z.string().optional(),
  duration: z.number().optional(),
  format: z.string().optional(), // Made optional
  // Potentially add fields from Step 5 normalization if needed by API
  // e.g., whyInfluencer: z.string().optional(), budget: z.number().optional(),
});

/** Schema for Creative Requirements within the submission payload. */
export const CreativeRequirementSubmissionSchema = z.object({
  description: z.string(),
  mandatory: z.boolean(),
});

/** Main schema for the final submission payload (POST /api/campaigns). */
export const SubmissionPayloadSchema = z
  .object({
    // Fields likely directly on CampaignWizardSubmission or Campaign model
    campaignName: z.string(),
    brand: z.string().min(1, { message: 'Brand name is required for submission' }),
    businessGoal: z.string(),
    description: z.string(), // Matches businessGoal from draft?
    startDate: z.string(), // Expecting ISO date string? Needs backend verification.
    endDate: z.string(), // Expecting ISO date string? Needs backend verification.
    timeZone: z.string(),
    currency: CurrencyEnum,
    totalBudget: z.number(),
    socialMediaBudget: z.number(),
    // TODO: Fix Platform definition - Needs verification against backend API. Using z.string() temporarily.
    platform: z.string().optional(), // Temporary fix to unblock build
    // Step 2 data (verify field names with backend)
    mainMessage: z.string(),
    hashtags: z.string(), // Or array? Verify.
    memorability: z.string(),
    keyBenefits: z.string(),
    expectedAchievements: z.string(), // This field name seems less likely, verify.
    purchaseIntent: z.string(),
    brandPerception: z.string(), // This was under audience in Step 5? Verify location.
    primaryKPI: KPIEnum,
    secondaryKPIs: z.array(KPIEnum),
    features: z.array(ExtendedFeatureEnum),

    submissionStatus: SubmissionStatusEnum.optional().default('submitted'), // Set by backend?
    userId: z.string().optional(), // Likely set by backend based on auth context

    // Relational data (VERIFY structure: Does API expect full objects or just IDs?)
    primaryContact: PrimaryContactSubmissionSchema,
    secondaryContact: SecondaryContactSubmissionSchema, // Optional
    audience: AudienceSubmissionSchema, // Expects single Audience object to create?
    creativeAssets: z.array(CreativeAssetSubmissionSchema),
    creativeRequirements: z.array(CreativeRequirementSubmissionSchema),

    // Influencers are part of DraftCampaignData, how are they submitted?
    // Maybe just the handle/platform from Step 1 budget section is needed?
    // Or maybe an array of influencer IDs/handles?
    influencerHandle: z.string().optional(), // Added based on DraftCampaignData budget section, VERIFY!
    // influencers: z.array(z.object({ platform: PlatformSchema, handle: z.string() })).optional(), // Alternative? VERIFY!
  })
  .refine(
    data => {
      // Add cross-field validation specific to submission if needed
      // Example: budget validation (already present in Draft schema, but good practice to re-validate)
      if (typeof data.socialMediaBudget === 'number' && typeof data.totalBudget === 'number') {
        return data.socialMediaBudget <= data.totalBudget;
      }
      return true; // Or false if these fields are mandatory for this check
    },
    {
      message: 'Social media budget cannot exceed total budget',
      path: ['socialMediaBudget'],
    }
  );

/** TypeScript type inferred from SubmissionPayloadSchema. */
export type SubmissionPayloadData = z.infer<typeof SubmissionPayloadSchema>;

//---------------------------------------------------------------------------
// Step-Specific Validation Schemas (for RHF `useForm` resolver)
// These pick/extend relevant fields from the main Draft schema for step-by-step validation.
//---------------------------------------------------------------------------

// --- Step 1 ---
/** BASE schema for Step 1: Basic Info - Only field definitions */
export const Step1BaseSchema = DraftCampaignDataBaseSchema.pick({
  name: true,
  businessGoal: true,
  brand: true,
  website: true,
  startDate: true,
  endDate: true,
  timeZone: true,
  primaryContact: true,
  secondaryContact: true,
  additionalContacts: true,
  budget: true,
  Influencer: true,
  targetPlatforms: true,
});

/** FULL Validation schema for Step 1: Basic Info (Used in UI) */
export const Step1ValidationSchema = Step1BaseSchema.extend({
  primaryContact: ContactSchema.refine(contact => contact !== null, {
    message: 'Primary contact is required.',
  }),
}).refine(data => data.Influencer && data.Influencer.length >= 1, {
  message: 'Please add at least one influencer',
  path: ['Influencer'],
});

// Define Step1FormData explicitly for useForm typing clarity
export type Step1FormData = {
  name: string;
  businessGoal?: string | null;
  brand: string;
  website?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  timeZone?: string | null;
  primaryContact: z.infer<typeof ContactSchema>;
  secondaryContact?: z.infer<typeof ContactSchema> | null;
  additionalContacts: Array<z.infer<typeof ContactSchema>>;
  budget?: z.infer<typeof BudgetSchema> | null;
  Influencer: Array<z.infer<typeof InfluencerSchema>>;
  targetPlatforms?: PlatformEnum[]; // Use the enum directly
};

// --- Step 2 ---
/** BASE schema for Step 2: Objectives - Only field definitions */
export const Step2BaseSchema = DraftCampaignDataBaseSchema.pick({
  primaryKPI: true,
  secondaryKPIs: true,
  messaging: true,
  expectedOutcomes: true,
  features: true,
});
/** FULL Validation schema for Step 2: Objectives (Used in UI) */
export const Step2ValidationSchema = Step2BaseSchema.extend({
  // Ensure primaryKPI is selected
  primaryKPI: KPIEnum.nullable().refine(val => val != null, { message: 'Primary KPI is required' }),
});
/** TypeScript type for Step 2 form data. */
export type Step2FormData = z.infer<typeof Step2ValidationSchema>;

// --- Step 3 ---
/** BASE schema for Step 3: Audience - Only field definitions */
export const Step3BaseSchema = DraftCampaignDataBaseSchema.pick({
  demographics: true,
  locations: true,
  targeting: true,
  competitors: true,
});
/** FULL Validation schema for Step 3: Audience (Used in UI) */
export const Step3ValidationSchema = Step3BaseSchema.refine(
  data => {
    // Refinement for age distribution sum (copied from previous schema)
    if (data.demographics) {
      const sum =
        (data.demographics.age18_24 || 0) +
        (data.demographics.age25_34 || 0) +
        (data.demographics.age35_44 || 0) +
        (data.demographics.age45_54 || 0) +
        (data.demographics.age55_64 || 0) +
        (data.demographics.age65plus || 0);
      return sum === 0 || Math.abs(sum - 100) < 0.01;
    }
    return true;
  },
  {
    message: 'Total age distribution must equal 100%',
    path: ['demographics', 'age18_24'],
  }
);
/** TypeScript type for Step 3 form data. */
export type Step3FormData = z.infer<typeof Step3ValidationSchema>;

// --- Step 4 ---
/** BASE schema for Step 4: Assets & Guidelines - Only field definitions */
export const Step4BaseSchema = DraftCampaignDataBaseSchema.pick({
  assets: true,
  guidelines: true,
  requirements: true,
  notes: true,
  step4Complete: true,
});

/** FULL Validation schema for Step 4: Assets & Guidelines (Used in UI) */
export const Step4ValidationSchema = Step4BaseSchema.extend({
  assets: z.array(DraftAssetSchema).default([]),
  guidelines: z.string().optional().nullable(),
  requirements: z.array(z.object({ description: z.string(), mandatory: z.boolean() })).default([]),
  notes: z.string().optional().nullable(),
  step4Complete: z.boolean().optional().default(true),
}).refine(
  data => {
    // Make sure there's at least one asset
    return data.assets && data.assets.length > 0;
  },
  {
    message: 'At least one asset is required to complete this step.',
    path: ['assets'], // Path for error message
  }
);

/** TypeScript type for Step 4 form data. */
export type Step4FormData = z.infer<typeof Step4ValidationSchema>;

// --- Step 5 ---
// No specific validation schema needed for the form itself, as Step 5 is primarily for review.
// Base schema can just reference status or other fields if needed for partial save
export const Step5BaseSchema = DraftCampaignDataBaseSchema.pick({
  status: true /*, potentially other final fields */,
});
export const Step5ValidationSchema = Step5BaseSchema; // No extra validation for now
export type Step5FormData = z.infer<typeof Step5ValidationSchema>;

//---------------------------------------------------------------------------
// Shared Prop Types for Wizard Components
//---------------------------------------------------------------------------

/** Props for the component responsible for loading step content dynamically. */
export interface StepLoaderProps {
  step: number;
}

/** Common props for individual step content components (Step1Content, Step2Content, etc.). */
export interface StepContentProps {
  /** The current step number being displayed. */
  step: number;
  /** Callback function to navigate to the next step. */
  onNext?: () => void;
  /** Callback function to navigate to the previous step. */
  onBack?: () => void;
  /** Flag indicating if the wizard is in a loading state (e.g., saving/loading data). */
  isLoading?: boolean;
}

/** Common props for wizard navigation components (e.g., ProgressBar, WizardNavigation). */
export interface WizardStepProps {
  /** The currently active step number. */
  currentStep: number;
  /** The total number of steps in the wizard. */
  totalSteps: number;
  /** Callback function to navigate to the next step. */
  onNext?: () => void;
  /** Callback function to navigate to the previous step. */
  onBack?: () => void;
  /** Flag indicating if the wizard is in a loading state. */
  isLoading?: boolean;
}

// Removed deprecated types (FormValues, Contact, Currency, Platform, Position) as they are replaced by Zod schemas and inferred types.
