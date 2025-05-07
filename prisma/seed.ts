import { PrismaClient, SubmissionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Temporarily comment out Brand Lift deleteMany calls
  // await prisma.surveyApprovalComment.deleteMany();
  // await prisma.surveyApprovalStatus.deleteMany();
  // await prisma.surveyOption.deleteMany();
  // await prisma.surveyQuestion.deleteMany();
  // await prisma.brandLiftReport.deleteMany();
  // await prisma.surveyResponse.deleteMany();
  // await prisma.brandLiftStudy.deleteMany();
  console.log('Previous Brand Lift data cleared (skipped).');

  // Create Primary Contacts first
  const contact1 = await prisma.primaryContact.create({
    data: { firstName: 'Seed', surname: 'User1', email: 'seed1@example.com', position: 'Manager' },
  });
  const contact2 = await prisma.primaryContact.create({
    data: { firstName: 'Seed', surname: 'User2', email: 'seed2@example.com', position: 'Director' },
  });

  // --- Create Sample CampaignWizardSubmissions ---
  const campaign1 = await prisma.campaignWizardSubmission.create({
    data: {
      campaignName: 'Q1 Awareness Push',
      // Remove fields not present in the actual CampaignWizardSubmission model
      // objective: 'Increase Brand Awareness',
      // kpis: ['Brand Awareness', 'Ad Recall'],
      // targetAudience: '18-34, UK',
      // platforms: ['TikTok', 'Instagram'],
      // status: 'COMPLETED',
      // TODO: Add ACTUAL required fields based on schema.prisma
      // Example placeholder for potentially required fields:
      description: 'Seed data campaign 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      timeZone: 'UTC',
      contacts: 'Placeholder Contact Info', // Assuming this is a simple String field now
      currency: 'USD',
      totalBudget: 10000,
      socialMediaBudget: 5000,
      platform: 'INSTAGRAM', // Use actual enum value
      influencerHandle: '@seed_influencer1',
      mainMessage: 'Main message for Q1 push',
      hashtags: '#BrandX #Q1Push',
      memorability: 'High',
      keyBenefits: 'Benefit 1, Benefit 2',
      expectedAchievements: 'Achievement 1',
      purchaseIntent: 'Medium',
      brandPerception: 'Positive',
      primaryKPI: 'BRAND_AWARENESS',
      secondaryKPIs: ['AD_RECALL'],
      features: ['BRAND_LIFT'],
      submissionStatus: 'submitted', // Use actual enum value
      primaryContact: {
        // Connect to created contact
        connect: { id: contact1.id },
      },
      // Add relations if needed, e.g., primaryContactId or userId
    },
  });

  const campaign2 = await prisma.campaignWizardSubmission.create({
    data: {
      campaignName: 'Summer Product Launch',
      // Remove fields not present in the actual CampaignWizardSubmission model
      // objective: 'Drive Purchase Intent',
      // kpis: ['Purchase Intent', 'Consideration'],
      // targetAudience: '25-45, US',
      // platforms: ['YouTube', 'Facebook'],
      // status: 'COMPLETED',
      // TODO: Add ACTUAL required fields based on schema.prisma
      description: 'Seed data campaign 2',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      timeZone: 'PST',
      contacts: 'Placeholder Contact Info 2', // Assuming this is a simple String field now
      currency: 'GBP',
      totalBudget: 25000,
      socialMediaBudget: 15000,
      platform: 'YOUTUBE', // Use actual enum value
      influencerHandle: '@seed_influencer2',
      mainMessage: 'Main message for Summer Launch',
      hashtags: '#BrandX #SummerLaunch',
      memorability: 'Medium',
      keyBenefits: 'Benefit A, Benefit B',
      expectedAchievements: 'Achievement X',
      purchaseIntent: 'High',
      brandPerception: 'Innovative',
      primaryKPI: 'PURCHASE_INTENT',
      secondaryKPIs: ['CONSIDERATION'],
      features: ['BRAND_LIFT', 'CREATIVE_ASSET_TESTING'],
      submissionStatus: 'submitted', // Use actual enum value
      primaryContact: {
        // Connect to created contact
        connect: { id: contact2.id },
      },
      // Add relations if needed
    },
  });
  console.log('Created campaigns: ' + campaign1.id + ', ' + campaign2.id);

  // Temporarily comment out Brand Lift study creation/interaction
  // const study1 = await prisma.brandLiftStudy.create({ ... });
  // const study2 = await prisma.brandLiftStudy.create({ ... });
  // console.log('Created studies: ' + study1.id + ', ' + study2.id);
  // const question1Study2 = await prisma.surveyQuestion.create({ ... });
  // const question2Study2 = await prisma.surveyQuestion.create({ ... });
  // console.log('Added questions to study ' + study2.id);
  // const approvalStatusStudy2 = await prisma.surveyApprovalStatus.create({ ... });
  // const comment1Study2 = await prisma.surveyApprovalComment.create({ ... });
  // const comment2Study2 = await prisma.surveyApprovalComment.create({ ... });
  // console.log('Added approval status and comments to study ' + study2.id);

  console.log('Seeding finished.');
}

main()
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
