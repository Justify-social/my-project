// Using CommonJS require syntax
const { PrismaClient } = require('@prisma/client');
const prisma = require('../lib/prisma');

/**
 * @typedef {Object} ModelStatus
 * @property {string} model
 * @property {boolean} exists
 * @property {number} [count]
 * @property {string} [error]
 */

/**
 * @typedef {Object} ValidationResult
 * @property {ModelStatus[]} validModels
 * @property {ModelStatus[]} invalidModels
 */

/**
 * Validates all models defined in the Prisma schema against the database.
 * This is helpful for diagnosing missing tables or schema mismatches.
 * @returns {Promise<ValidationResult>}
 */
async function validateSchema() {
  // Get all models from Prisma client
  const models = Object.keys(prisma).filter(key => 
    typeof prisma[key] === 'object' && 
    prisma[key] !== null &&
    !['$on', '$connect', '$disconnect', '$use', '$transaction', '$executeRaw', '$queryRaw'].includes(key)
  );
  
  console.log(`Validating ${models.length} models against the database...`);
  
  // Test each model with a simple query
  const results = await Promise.all(models.map(async (model) => {
    try {
      // Try to count records for this model
      const count = await prisma[model].count();
      return { 
        model, 
        exists: true, 
        count 
      };
    } catch (error) {
      return { 
        model, 
        exists: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }));
  
  // Split into valid and invalid models
  return {
    validModels: results.filter(r => r.exists),
    invalidModels: results.filter(r => !r.exists)
  };
}

/**
 * Validates a specific model and returns detailed information.
 * @param {string} modelName 
 * @returns {Promise<ModelStatus>}
 */
async function validateModel(modelName) {
  try {
    if (!(modelName in prisma)) {
      return {
        model: modelName,
        exists: false,
        error: `Model ${modelName} is not defined in the Prisma client`
      };
    }
    
    const count = await prisma[modelName].count();
    return { 
      model: modelName, 
      exists: true, 
      count 
    };
  } catch (error) {
    return { 
      model: modelName, 
      exists: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Creates a sample campaign to verify the database works correctly.
 * @returns {Promise<Object>}
 */
async function createSampleCampaign() {
  try {
    // Try to access the CampaignWizard model
    if (!('campaignWizard' in prisma)) {
      return {
        success: false,
        error: "CampaignWizard model is not available in the Prisma client"
      };
    }
    
    // Create a sample campaign to test the CampaignWizard model
    const campaign = await prisma.campaignWizard.create({
      data: {
        id: crypto.randomUUID(),
        name: "Test Campaign",
        businessGoal: "Testing database functionality",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
        timeZone: "UTC",
        primaryContact: {
          firstName: "John",
          surname: "Doe",
          email: "john@example.com",
          position: "Manager"
        },
        secondaryContact: {
          firstName: "Jane",
          surname: "Smith",
          email: "jane@example.com",
          position: "Director"
        },
        budget: {
          currency: "USD",
          totalBudget: 10000,
          socialMediaBudget: 5000
        },
        updatedAt: new Date(),
        status: "DRAFT",
        currentStep: 1,
        isComplete: false,
        step1Complete: true,
        step2Complete: false,
        step3Complete: false,
        step4Complete: false,
        secondaryKPIs: [],
        features: [],
        locations: [],
        competitors: [],
        assets: [],
        requirements: []
      }
    });
    
    return {
      success: true,
      campaign
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
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
        firstName: "John",
        surname: "Doe",
        email: "john@example.com",
        position: "Manager"
      }
    });
    
    // Create a secondary contact
    const secondaryContact = await prisma.secondaryContact.create({
      data: {
        firstName: "Jane",
        surname: "Smith",
        email: "jane@example.com",
        position: "Director"
      }
    });
    
    // Now create the submission with references to the contacts
    const submission = await prisma.campaignWizardSubmission.create({
      data: {
        campaignName: "Test Submission",
        description: "Testing database functionality",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
        timeZone: "UTC",
        contacts: "John Doe, Jane Smith",
        currency: "USD",
        totalBudget: 10000,
        socialMediaBudget: 5000,
        platform: "Instagram",
        influencerHandle: "@testinfluencer",
        primaryContactId: primaryContact.id,
        secondaryContactId: secondaryContact.id,
        mainMessage: "This is a test message",
        hashtags: "#test #campaign",
        memorability: "High memorability",
        keyBenefits: "Testing benefits",
        expectedAchievements: "Expected achievements",
        purchaseIntent: "High intent",
        brandPerception: "Positive perception",
        primaryKPI: "brandAwareness",
        secondaryKPIs: ["adRecall", "consideration"],
        features: ["BRAND_LIFT", "CREATIVE_ASSET_TESTING"],
        submissionStatus: "draft"
      }
    });
    
    return {
      success: true,
      submission,
      primaryContact,
      secondaryContact
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

module.exports = {
  validateSchema,
  validateModel,
  createSampleCampaign,
  createSampleSubmission
}; 