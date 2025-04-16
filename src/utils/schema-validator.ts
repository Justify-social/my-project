// Using ES imports
import {
  Prisma,
  PrismaClient as _PrismaClient,
  Position,
  Currency,
  Platform,
  KPI,
  Feature,
  SubmissionStatus,
  Status,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto'; // Import randomUUID

/**
 * Type definition for ModelStatus
 */
interface ModelStatus {
  model: string;
  exists: boolean;
  error?: string;
}

/**
 * Type definition for ValidationResult
 */
interface ValidationResult {
  validModels: ModelStatus[];
  invalidModels: ModelStatus[];
}

/**
 * Validates all models defined in the Prisma schema against the database.
 * This is helpful for diagnosing missing tables or schema mismatches.
 * @returns {Promise<ValidationResult>}
 */
async function validateSchema(): Promise<ValidationResult> {
  // Add return type
  // Get actual model names from DMMF
  const models = Prisma.dmmf.datamodel.models.map(m => m.name);

  console.log(`Validating ${models.length} models against the database...`);

  // Test each model with a simple query
  const results: ModelStatus[] = await Promise.all(
    models.map(async (model): Promise<ModelStatus> => {
      // Type the results array and map return
      try {
        // Use findFirst as a safe check - accessing prisma[model] dynamically
        // @ts-expect-error - Explicitly ignore implicit any for dynamic model access in validation
        await prisma[model].findFirst({});
        return {
          model,
          exists: true,
        };
      } catch (error) {
        return {
          model,
          exists: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );

  // Split into valid and invalid models
  return {
    validModels: results.filter(r => r.exists),
    invalidModels: results.filter(r => !r.exists),
  };
}

/**
 * Validates a specific model and returns detailed information.
 * @param {string} modelName
 * @returns {Promise<ModelStatus>}
 */
async function validateModel(modelName: string): Promise<ModelStatus> {
  // Add parameter and return type
  try {
    // Check against actual model names from DMMF
    const actualModels = Prisma.dmmf.datamodel.models.map(m => m.name);
    if (!actualModels.includes(modelName)) {
      return {
        model: modelName,
        exists: false,
        error: `Model ${modelName} is not defined in the Prisma schema`,
      };
    }

    // Use findFirst as a safe check
    // @ts-expect-error - Explicitly ignore implicit any for dynamic model access in validation
    await prisma[modelName].findFirst({});
    return {
      model: modelName,
      exists: true,
    };
  } catch (error) {
    return {
      model: modelName,
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Creates a sample campaign to verify the database works correctly.
 * @returns {Promise<Object>}
 */
async function createSampleCampaign() {
  try {
    // Access check already handled by validateModel/validateSchema if used prior

    // Create a sample campaign to test the CampaignWizard model
    const campaign = await prisma.campaignWizard.create({
      data: {
        id: randomUUID(), // Use imported function
        name: 'Test Campaign',
        businessGoal: 'Testing database functionality',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        timeZone: 'UTC',
        primaryContact: {
          firstName: 'John',
          surname: 'Doe',
          email: 'john@example.com',
          position: Position.Manager, // Use Enum
        },
        secondaryContact: {
          firstName: 'Jane',
          surname: 'Smith',
          email: 'jane@example.com',
          position: Position.Director, // Use Enum
        },
        budget: {
          currency: Currency.USD, // Use Enum
          totalBudget: 10000,
          socialMediaBudget: 5000,
        },
        updatedAt: new Date(),
        status: Status.DRAFT, // Use Enum
        currentStep: 1,
        isComplete: false,
        step1Complete: true,
        step2Complete: false,
        step3Complete: false,
        step4Complete: false,
        secondaryKPIs: [], // Empty array is valid for enum array
        features: [], // Empty array is valid for enum array
        locations: [],
        competitors: [],
        assets: [],
        requirements: [],
      },
    });

    return {
      success: true,
      campaign,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Creates a sample submission to verify the CampaignWizardSubmission model works correctly.
 * @returns {Promise<Object>}
 */
async function createSampleSubmission() {
  try {
    // First create the required primary contact
    const primaryContact = await prisma.primaryContact.create({
      data: {
        firstName: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        position: Position.Manager, // Use Enum
      },
    });

    // Create a secondary contact
    const secondaryContact = await prisma.secondaryContact.create({
      data: {
        firstName: 'Jane',
        surname: 'Smith',
        email: 'jane@example.com',
        position: Position.Director, // Use Enum
      },
    });

    // Now create the submission with references to the contacts
    const submission = await prisma.campaignWizardSubmission.create({
      data: {
        campaignName: 'Test Submission',
        description: 'Testing database functionality',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        timeZone: 'UTC',
        contacts: 'John Doe, Jane Smith',
        currency: Currency.USD, // Use Enum
        totalBudget: 10000,
        socialMediaBudget: 5000,
        platform: Platform.INSTAGRAM, // Correct Enum Case
        influencerHandle: '@testinfluencer',
        primaryContactId: primaryContact.id,
        secondaryContactId: secondaryContact.id,
        mainMessage: 'This is a test message',
        hashtags: '#test #campaign',
        memorability: 'High memorability',
        keyBenefits: 'Testing benefits',
        expectedAchievements: 'Expected achievements',
        purchaseIntent: 'High intent',
        brandPerception: 'Positive perception',
        primaryKPI: KPI.BRAND_AWARENESS, // Correct Enum Case
        secondaryKPIs: [KPI.AD_RECALL, KPI.CONSIDERATION], // Correct Enum Case
        features: [Feature.BRAND_LIFT, Feature.CREATIVE_ASSET_TESTING],
        submissionStatus: SubmissionStatus.draft,
      },
    });

    return {
      success: true,
      submission,
      primaryContact,
      secondaryContact,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Use ES module exports
export { validateSchema, validateModel, createSampleCampaign, createSampleSubmission };
