// Script to create test data in the database
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

async function createTestData() {
  console.log('Creating test data in the database...');
  
  try {
    // 1. Create a test campaign using CampaignWizard model
    console.log('\nCreating test campaign...');
    const campaign = await prisma.campaignWizard.create({
      data: {
        id: randomUUID(),
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
    
    console.log('✅ Campaign created successfully:', campaign.id);
    
    // 2. Create test contacts
    console.log('\nCreating test contacts...');
    const primaryContact = await prisma.primaryContact.create({
      data: {
        firstName: "Robert",
        surname: "Johnson",
        email: "robert@example.com",
        position: "Manager"
      }
    });
    
    const secondaryContact = await prisma.secondaryContact.create({
      data: {
        firstName: "Sarah",
        surname: "Williams",
        email: "sarah@example.com",
        position: "Director"
      }
    });
    
    console.log('✅ Contacts created successfully');
    
    // 3. Create a test submission
    console.log('\nCreating test submission...');
    const submission = await prisma.campaignWizardSubmission.create({
      data: {
        campaignName: "Test Submission",
        description: "Testing database functionality",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
        timeZone: "UTC",
        contacts: "Robert Johnson, Sarah Williams",
        currency: "USD",
        totalBudget: 10000,
        socialMediaBudget: 5000,
        platform: "INSTAGRAM",
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
        primaryKPI: "BRAND_AWARENESS",
        secondaryKPIs: ["AD_RECALL", "CONSIDERATION"],
        features: ["CREATIVE_ASSET_TESTING", "BRAND_LIFT"],
        submissionStatus: "draft"
      }
    });
    
    console.log('✅ Submission created successfully:', submission.id);
    
    // 4. Create audience data
    console.log('\nCreating test audience data...');
    const audience = await prisma.audience.create({
      data: {
        campaignId: submission.id,
        ageRangeMin: 18,
        ageRangeMax: 35,
        keywords: ["social media", "digital marketing"],
        interests: ["fashion", "technology"],
        geographicSpread: {
          create: [
            { country: "United States", proportion: 0.6 },
            { country: "United Kingdom", proportion: 0.4 }
          ]
        },
        gender: {
          create: [
            { gender: "Male", proportion: 0.5 },
            { gender: "Female", proportion: 0.5 }
          ]
        },
        screeningQuestions: {
          create: [
            { question: "Do you use social media daily?" }
          ]
        },
        languages: {
          create: [
            { language: "English" }
          ]
        },
        competitors: {
          create: [
            { name: "Competitor A" },
            { name: "Competitor B" }
          ]
        }
      }
    });
    
    console.log('✅ Audience data created successfully');
    
    // 5. Create creative assets
    console.log('\nCreating test creative assets...');
    const asset = await prisma.creativeAsset.create({
      data: {
        submissionId: submission.id,
        name: "Test Image",
        description: "Test image asset",
        url: "https://example.com/image.jpg",
        type: "image",
        fileSize: 1024,
        format: "jpg"
      }
    });
    
    console.log('✅ Creative asset created successfully');
    
    // 6. Create creative requirements
    console.log('\nCreating test creative requirements...');
    const requirement = await prisma.creativeRequirement.create({
      data: {
        submissionId: submission.id,
        description: "Must include product in frame",
        mandatory: true
      }
    });
    
    console.log('✅ Creative requirement created successfully');
    
    return {
      campaign,
      primaryContact,
      secondaryContact,
      submission,
      audience,
      asset,
      requirement
    };
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
}

createTestData()
  .catch(error => {
    console.error('Script failed:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\nTest data creation complete.');
  }); 