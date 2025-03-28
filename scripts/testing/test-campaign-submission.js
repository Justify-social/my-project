// Test script to create a campaign submission with the updated schema
import PrismaClient from '@prisma/client';
const prisma = new PrismaClient();

async function createTestCampaignSubmission() {
  try {
    console.log('Creating test campaign submission...');
    
    // Step 1: Create primary and secondary contacts
    const primaryContact = await prisma.primaryContact.create({
      data: {
        firstName: 'John',
        surname: 'Test',
        email: 'john.test@example.com',
        position: 'Manager',
      }
    });
    
    const secondaryContact = await prisma.secondaryContact.create({
      data: {
        firstName: 'Jane',
        surname: 'Test',
        email: 'jane.test@example.com',
        position: 'Director',
      }
    });
    
    console.log('Created contacts with IDs:', primaryContact.id, secondaryContact.id);
    
    // Step 2: Create the campaign submission
    const submission = await prisma.campaignWizardSubmission.create({
      data: {
        campaignName: 'Test Campaign ' + Date.now(),
        description: 'This is a test campaign submission',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
        timeZone: 'UTC',
        contacts: 'John Test, Jane Test',
        currency: 'USD',
        totalBudget: 15000,
        socialMediaBudget: 5000,
        platform: 'INSTAGRAM',
        influencerHandle: '@testinfluencer',
        primaryContactId: primaryContact.id,
        secondaryContactId: secondaryContact.id,
        mainMessage: 'This is our main message',
        hashtags: '#test #campaign',
        memorability: 'High visual impact and memorable messaging',
        keyBenefits: 'Increased brand awareness, higher engagement',
        expectedAchievements: 'Reach 1M users, 10% engagement rate',
        purchaseIntent: 'Drive 5% increase in purchase intent',
        brandPerception: 'Improve brand perception by 15%',
        primaryKPI: 'BRAND_AWARENESS',
        secondaryKPIs: ['CONSIDERATION', 'MESSAGE_ASSOCIATION'],
        features: ['BRAND_LIFT', 'CREATIVE_ASSET_TESTING'],
        submissionStatus: 'draft',
      }
    });
    
    console.log('Created campaign submission with ID:', submission.id);
    
    // Step 3: Create audience
    const audience = await prisma.audience.create({
      data: {
        campaignId: submission.id,
        ageRangeMin: 25,
        ageRangeMax: 35,
        keywords: ['marketing', 'social media', 'digital'],
        interests: ['fashion', 'technology'],
      }
    });
    
    console.log('Created audience with ID:', audience.id);
    
    // Step 4: Create audience locations
    const locations = await Promise.all([
      prisma.audienceLocation.create({
        data: {
          audienceId: audience.id,
          country: 'United States',
          proportion: 0.7,
        }
      }),
      prisma.audienceLocation.create({
        data: {
          audienceId: audience.id,
          country: 'Canada',
          proportion: 0.3,
        }
      })
    ]);
    
    console.log('Created audience locations');
    
    // Step 5: Create creative assets
    const asset = await prisma.creativeAsset.create({
      data: {
        submissionId: submission.id,
        name: 'Test Image',
        description: 'Sample image for the campaign',
        url: 'https://example.com/test-image.jpg',
        type: 'image',
        fileSize: 1024000,
        format: 'jpg',
      }
    });
    
    console.log('Created creative asset with ID:', asset.id);
    
    // Step 6: Create creative requirements
    const requirement = await prisma.creativeRequirement.create({
      data: {
        submissionId: submission.id,
        description: 'Must include brand logo in all assets',
        mandatory: true,
      }
    });
    
    console.log('Created creative requirement with ID:', requirement.id);
    
    console.log('Test data creation completed successfully!');
    
    return {
      submission,
      primaryContact,
      secondaryContact,
      audience,
      locations,
      asset,
      requirement
    };
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestCampaignSubmission()
  .then(result => {
    console.log('All test data created successfully!');
  })
  .catch(error => {
    console.error('Fatal error during test data creation:', error);
    process.exit(1);
  }); 