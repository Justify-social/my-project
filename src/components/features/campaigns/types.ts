import { z } from 'zod';

//---------------------------------------------------------------------------
// Prisma Enum Definitions & Zod Schemas
//---------------------------------------------------------------------------

/** Base Currency Enum (from Prisma) */
export const CurrencyEnum = z.enum(['GBP', 'USD', 'EUR']);
/** Campaign Status Enum (from Prisma) */
export const StatusEnum = z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED']);
/** Key Performance Indicator Enum (from Prisma) */
export const KPIEnum = z.enum([
  'AD_RECALL',
  'BRAND_AWARENESS',
  'CONSIDERATION',
  'MESSAGE_ASSOCIATION',
  'BRAND_PREFERENCE',
  'PURCHASE_INTENT',
  'ACTION_INTENT',
  'RECOMMENDATION_INTENT',
  'ADVOCACY',
]);
/** Campaign Feature Enum (from Prisma) */
export const FeatureEnum = z.enum([
  'CREATIVE_ASSET_TESTING',
  'BRAND_LIFT',
  'BRAND_HEALTH',
  'MIXED_MEDIA_MODELING',
]);
/** Contact Position Enum (from Prisma) */
export const PositionEnum = z.enum(['Manager', 'Director', 'VP']);
/** Creative Asset Type Enum (from Prisma) */
export const CreativeAssetTypeEnum = z.enum(['image', 'video']);
/** Submission Status Enum (from Prisma) */
export const SubmissionStatusEnum = z.enum(['draft', 'submitted']);

/** Platform Enum - Backend Format (from Prisma) */
export const PlatformEnumBackend = z.enum(['INSTAGRAM', 'YOUTUBE', 'TIKTOK']);

/** Platform Enum - Frontend Display Format (Example) */
export const PlatformEnumFrontend = z.enum(['Instagram', 'YouTube', 'TikTok']);

/** Zod schema for Platform: transforms frontend input to backend format (UPPERCASE). */
export const PlatformSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.toUpperCase(); // Transform to backend format
  }
  return val;
}, PlatformEnumBackend);

/** Helper function to convert backend Platform enum value to frontend display string. */
export const platformToFrontend = (backendValue: z.infer<typeof PlatformEnumBackend>): z.infer<typeof PlatformEnumFrontend> | undefined => {
  switch (backendValue) {
    case 'INSTAGRAM': return 'Instagram';
    case 'YOUTUBE': return 'YouTube';
    case 'TIKTOK': return 'TikTok';
    default: return undefined;
  }
};

//---------------------------------------------------------------------------
// Zod Schemas for Complex / JSON Types (Based on schema.prisma)
//---------------------------------------------------------------------------

/** Schema for Contact object (used in primary/secondary contacts). */
export const ContactSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  surname: z.string().min(1, { message: "Surname is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  position: PositionEnum.optional(), // Assuming Position is optional here
});

/** Schema for Budget object (used within DraftCampaignData). Handles string input cleanup. */
export const BudgetSchema = z.object({
  currency: CurrencyEnum.default('GBP'),
  /** Total campaign budget. Renamed key to match API response. */
  total: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(/[^\d.-]/g, '')) : val),
    z.number({ invalid_type_error: 'Total budget must be a number' }).nonnegative({ message: 'Total budget cannot be negative' })
  ),
  /** Social media portion of the budget. Renamed key to match API response. */
  socialMedia: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val.replace(/[^\d.-]/g, '')) : val),
    z.number({ invalid_type_error: 'Social media budget must be a number' }).nonnegative({ message: 'Social media budget cannot be negative' })
  ),
});

/** Schema for Influencer object (used in DraftCampaignData). */
export const InfluencerSchema = z.object({
  id: z.string().optional(), // Optional as it might be generated
  platform: PlatformSchema, // Uses the transforming schema
  handle: z.string().min(1, { message: "Influencer handle is required" }),
  platformId: z.string().optional(),
  // TODO: Add other relevant fields if needed for draft state based on Step 1 form
});

/** Schema for draft Asset object (used within DraftCampaignData assets array). */
export const DraftAssetSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: CreativeAssetTypeEnum.optional(), // e.g., 'image', 'video'
  url: z.string().url().optional(),
  // Other fields stored in the draft asset JSON
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  description: z.string().optional(),
  /** Flag to indicate if this is a temporary upload placeholder before final processing. */
  temp: z.boolean().optional(),
}).strict();

/** Schema for Demographics object (used within DraftCampaignData). */
// REVISED SCHEMA for percentage distribution
export const DemographicsSchema = z.object({
  // Define age brackets explicitly
  age18_24: z.number().int().min(0).max(100).optional().default(0),
  age25_34: z.number().int().min(0).max(100).optional().default(0),
  age35_44: z.number().int().min(0).max(100).optional().default(0),
  age45_54: z.number().int().min(0).max(100).optional().default(0),
  age55_64: z.number().int().min(0).max(100).optional().default(0),
  age65plus: z.number().int().min(0).max(100).optional().default(0),
  /** Selected genders. */
  genders: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
}).strict()
  // Add refinement to check if sum is 100
  .refine(data => {
    const sum = (data.age18_24 || 0) +
      (data.age25_34 || 0) +
      (data.age35_44 || 0) +
      (data.age45_54 || 0) +
      (data.age55_64 || 0) +
      (data.age65plus || 0);
    // Allow a small tolerance for floating point issues if needed, but aim for exact 100
    return Math.abs(sum - 100) < 0.01 || sum === 0; // Allow 0 sum if untouched
  }, {
    message: "Total age distribution must equal 100%",
    // Path can point to a general field or the object itself
    path: ["ageDistribution"], // Use a conceptual path if field removed
  });

/** Schema for Location object (used within DraftCampaignData locations array). */
export const LocationSchema = z.object({
  // Expanded based on Step 3 description
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  // Removed proportion as UI is unclear
}).strict(); // Made strict

//---------------------------------------------------------------------------
// Main Zod Schema for Draft Campaign Data (WizardContext State)
//---------------------------------------------------------------------------

/** Base schema definition for the Campaign Wizard's draft state. Add .passthrough() */
const DraftCampaignDataBaseSchema = z.object({
  /** Unique identifier for the draft campaign (UUID). */
  id: z.string().optional(),
  /** Timestamp of creation. */
  createdAt: z.string().datetime().optional().or(z.date()).optional(), // Accept string or Date
  /** Timestamp of last update. */
  updatedAt: z.string().datetime().optional().or(z.date()).optional(), // Accept string or Date
  /** Current step the user is on in the wizard. */
  currentStep: z.number().default(1),
  /** Flag indicating if the wizard has been fully completed. */
  isComplete: z.boolean().default(false),
  /** Current status of the campaign draft. */
  status: StatusEnum.default('DRAFT'),

  // --- Step 1 Data ---
  /** Name of the campaign. */
  name: z.string().min(1, { message: "Campaign name is required" }),
  /** High-level business goal for the campaign. */
  businessGoal: z.string().nullable().optional(), // Made optional and nullable based on data
  /** Campaign start date (string format from API). */
  startDate: z.string().datetime().optional().or(z.date()).optional(), // Accept string or Date
  /** Campaign end date (string format from API). */
  endDate: z.string().datetime().optional().or(z.date()).optional(), // Accept string or Date
  /** Timezone for the campaign schedule. */
  timeZone: z.string().nullable().optional(),
  /** Primary contact person for the campaign. */
  primaryContact: ContactSchema.nullable().optional(),
  /** Secondary contact person for the campaign. */
  secondaryContact: ContactSchema.nullable().optional(),
  /** Additional contacts (if applicable). */
  additionalContacts: z.array(ContactSchema).default([]), // Ensure always array, default empty
  /** Budget details for the campaign. */
  budget: BudgetSchema.nullable().optional(),
  /** List of influencers associated with the campaign (Key changed to match API). */
  Influencer: z.array(InfluencerSchema).optional(), // Changed key from influencers
  /** Flag indicating Step 1 completion. */
  step1Complete: z.boolean().default(false),

  // --- Step 2 Data ---
  /** Primary Key Performance Indicator (KPI) for the campaign. */
  primaryKPI: KPIEnum.nullable().optional(), // Allow null
  /** Secondary KPIs for the campaign. */
  secondaryKPIs: z.array(KPIEnum).nullable().optional(), // Allow null
  /** Messaging details (structure assumed, verify with Step 2 form). */
  messaging: z.object({ // Example structure for JSON messaging
    mainMessage: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    keyBenefits: z.string().optional(),
  }).passthrough().nullable().optional(), // Allow null
  /** Expected outcomes (structure assumed, verify with Step 2 form). */
  expectedOutcomes: z.object({ // Example structure for JSON outcomes
    memorability: z.string().optional(),
    purchaseIntent: z.string().optional(),
    brandPerception: z.string().optional(),
  }).passthrough().nullable().optional(), // Allow null
  /** Selected features for the campaign (e.g., Brand Lift). */
  features: z.array(FeatureEnum).nullable().optional(), // Allow null
  /** Flag indicating Step 2 completion. */
  step2Complete: z.boolean().default(false),

  // --- Step 3 Data ---
  /** Audience demographic details (using refined schema). */
  demographics: DemographicsSchema.nullable().optional(),
  /** Audience location details. */
  locations: z.array(LocationSchema).nullable().optional(), // Allow null
  /** Audience targeting criteria (keywords, interests). */
  targeting: z.object({ // Example structure for JSON targeting
    keywords: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
  }).passthrough().nullable().optional(), // Allow null
  /** List of competitor brands/handles. */
  competitors: z.array(z.string()).nullable().optional(), // Allow null
  /** Flag indicating Step 3 completion. */
  step3Complete: z.boolean().default(false),

  // --- Step 4 Data ---
  /** List of creative assets uploaded for the campaign. */
  assets: z.array(DraftAssetSchema).default([]), // Ensure always array, default empty
  /** Creative guidelines or instructions. */
  guidelines: z.string().nullable().optional(), // Allow null
  /** Specific creative requirements (structure assumed, verify with Step 4 form). */
  requirements: z.array(z.object({ description: z.string(), mandatory: z.boolean() })).default([]), // Ensure always array, default empty
  /** Additional notes for Step 4. */
  notes: z.string().nullable().optional(), // Allow null
  /** Flag indicating Step 4 completion. */
  step4Complete: z.boolean().default(false),

  // --- Relations / Other ---
  /** ID of the user who owns the campaign draft. */
  userId: z.string().nullable().optional(), // Allow null
  // WizardHistory is likely a separate model/relation and not managed directly here
}).passthrough(); // Allow extra fields like isDraft

/** Refined Zod schema for Draft Campaign Data, adding cross-field validations. */
export const DraftCampaignDataSchema = DraftCampaignDataBaseSchema.refine(data => {
  // Refine budget: socialMediaBudget <= totalBudget
  if (data.budget?.socialMedia !== undefined && data.budget?.total !== undefined) {
    return data.budget.socialMedia <= data.budget.total;
  }
  return true;
}, {
  message: "Social media budget cannot exceed total budget",
  path: ["budget", "socialMedia"], // Updated path
}).refine(data => {
  // Refine dates: endDate must be after startDate
  try {
    if (data.startDate && data.endDate) {
      // Basic check; consider date-fns for more robust parsing and timezone handling if needed
      return new Date(data.endDate) > new Date(data.startDate);
    }
  } catch (e) { return false; } // Handle potential invalid date strings during comparison
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

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
export const SubmissionPayloadSchema = z.object({
  // Fields likely directly on CampaignWizardSubmission or Campaign model
  campaignName: z.string(),
  description: z.string(), // Matches businessGoal from draft?
  startDate: z.string(), // Expecting ISO date string? Needs backend verification.
  endDate: z.string(), // Expecting ISO date string? Needs backend verification.
  timeZone: z.string(),
  currency: CurrencyEnum,
  totalBudget: z.number(),
  socialMediaBudget: z.number(),
  platform: PlatformSchema, // Use transforming schema
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
  features: z.array(FeatureEnum),

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

}).refine(data => {
  // Add cross-field validation specific to submission if needed
  // Example: budget validation (already present in Draft schema, but good practice to re-validate)
  return data.socialMediaBudget <= data.totalBudget;
}, {
  message: "Social media budget cannot exceed total budget",
  path: ["socialMediaBudget"],
});

/** TypeScript type inferred from SubmissionPayloadSchema. */
export type SubmissionPayloadData = z.infer<typeof SubmissionPayloadSchema>;

//---------------------------------------------------------------------------
// Step-Specific Validation Schemas (for RHF `useForm` resolver)
// These pick/extend relevant fields from the main Draft schema for step-by-step validation.
//---------------------------------------------------------------------------

// --- Step 1 --- 
/** BASE schema for Step 1: Basic Info - Only field definitions */
export const Step1BaseSchema = z.object({
  name: DraftCampaignDataBaseSchema.shape.name,
  businessGoal: DraftCampaignDataBaseSchema.shape.businessGoal,
  startDate: DraftCampaignDataBaseSchema.shape.startDate,
  endDate: DraftCampaignDataBaseSchema.shape.endDate,
  timeZone: DraftCampaignDataBaseSchema.shape.timeZone,
  primaryContact: DraftCampaignDataBaseSchema.shape.primaryContact,
  secondaryContact: DraftCampaignDataBaseSchema.shape.secondaryContact,
  additionalContacts: DraftCampaignDataBaseSchema.shape.additionalContacts,
  budget: DraftCampaignDataBaseSchema.shape.budget,
  Influencer: DraftCampaignDataBaseSchema.shape.Influencer,
});

/** FULL Validation schema for Step 1: Basic Info (Used in UI) */
export const Step1ValidationSchema = Step1BaseSchema.extend({
  // Apply original refinements from previous .extend()
  primaryContact: ContactSchema.refine(contact => contact && contact.firstName && contact.surname && contact.email, {
    message: "Primary contact details must be complete",
    path: ['firstName'] // Pointing error to firstName field
  }).nullable().optional(), // Keep nullable/optional as in base
  Influencer: InfluencerSchema.array().min(1, "Please add at least one influencer").optional(),
}).refine(data => {
  // Apply original cross-field validation: budget
  if (data.budget?.socialMedia !== undefined && data.budget?.total !== undefined) {
    return data.budget.socialMedia <= data.budget.total;
  }
  return true;
}, {
  message: "Social media budget cannot exceed total budget",
  path: ["budget", "socialMedia"],
}).refine(data => {
  // Apply original cross-field validation: dates
  try {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
  } catch (e) { return false; }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});
/** TypeScript type for Step 1 form data. */
export type Step1FormData = z.infer<typeof Step1ValidationSchema>;

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
  primaryKPI: KPIEnum.nullable().refine(val => val != null, { message: "Primary KPI is required" }),
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
export const Step3ValidationSchema = Step3BaseSchema.refine(data => {
  // Refinement for age distribution sum (copied from previous schema)
  if (data.demographics) {
    const sum = (data.demographics.age18_24 || 0) +
      (data.demographics.age25_34 || 0) +
      (data.demographics.age35_44 || 0) +
      (data.demographics.age45_54 || 0) +
      (data.demographics.age55_64 || 0) +
      (data.demographics.age65plus || 0);
    return sum === 0 || Math.abs(sum - 100) < 0.01;
  }
  return true;
}, {
  message: "Total age distribution must equal 100%",
  path: ['demographics', 'age18_24'],
});
/** TypeScript type for Step 3 form data. */
export type Step3FormData = z.infer<typeof Step3ValidationSchema>;

// --- Step 4 --- 
/** BASE schema for Step 4: Assets & Guidelines - Only field definitions */
export const Step4BaseSchema = z.object({
  assets: DraftCampaignDataBaseSchema.shape.assets,
  guidelines: DraftCampaignDataBaseSchema.shape.guidelines,
  requirements: DraftCampaignDataBaseSchema.shape.requirements,
  notes: DraftCampaignDataBaseSchema.shape.notes,
});
/** FULL Validation schema for Step 4: Assets & Guidelines (Used in UI) */
export const Step4ValidationSchema = Step4BaseSchema.extend({
  guidelines: z.string().optional(),
  assets: DraftAssetSchema.array().optional().refine(assets =>
    !assets || assets.every(asset => !asset.url || z.string().url().safeParse(asset.url).success), {
    message: "Invalid URL format in one of the assets",
    path: [0, 'url']
  })
}).superRefine((data, ctx) => {
  if (data.assets && data.assets.length > 0 && !data.guidelines) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['guidelines'],
      message: "Creative guidelines are required when assets are uploaded.",
    });
  }
});
/** TypeScript type for Step 4 form data. */
export type Step4FormData = z.infer<typeof Step4ValidationSchema>;

// --- Step 5 --- 
// No specific validation schema needed for the form itself, as Step 5 is primarily for review.
// Base schema can just reference status or other fields if needed for partial save
export const Step5BaseSchema = DraftCampaignDataBaseSchema.pick({ status: true /*, potentially other final fields */ });
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
