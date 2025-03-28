// createCampaign.js
import PrismaClient from '@prisma/client';
const prisma = new PrismaClient();

async function createCampaign() {
  try {
    // Generate a UUID
    import uuid from 'crypto';.randomUUID();
    
    // Create a campaign
    const campaign = await prisma.campaignWizard.create({
      data: {
        id: uuid,
        name: "Test Campaign",
        businessGoal: "Increase brand awareness",
        startDate: new Date("2023-12-01"),
        endDate: new Date("2023-12-31"),
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
          position: "Coordinator"
        },
        budget: {
          currency: "USD",
          totalBudget: 10000,
          socialMediaBudget: 5000
        },
        
        // Default values for required fields
        status: "DRAFT",
        step1Complete: true,
        step2Complete: false,
        step3Complete: false,
        step4Complete: false,
        currentStep: 1,
        isComplete: false,
        updatedAt: new Date(),
        
        // Initialize empty arrays for array fields
        secondaryKPIs: [],
        features: [],
        locations: [],
        competitors: [],
        assets: [],
        requirements: []
      }
    });
    
    console.log('Campaign created successfully:', campaign.id);
    
    // Create an influencer record
    const influencer = await prisma.influencer.create({
      data: {
        id: require('crypto').randomUUID(),
        platform: "INSTAGRAM",
        handle: "@testinfluencer",
        campaignId: campaign.id,
        updatedAt: new Date()
      }
    });
    
    console.log('Influencer created successfully:', influencer.id);
    
    // Create a history record
    const history = await prisma.wizardHistory.create({
      data: {
        id: require('crypto').randomUUID(),
        wizardId: campaign.id,
        step: 1,
        action: "CREATE",
        changes: { initialCreation: true },
        performedBy: "user",
      }
    });
    
    console.log('History record created successfully:', history.id);
    
    return { campaign, influencer, history };
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createCampaign()
  .then(result => {
    console.log('All operations completed successfully');
  })
  .catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  }); 