import {
  PrismaClient,
  SubmissionStatus,
  BrandLiftStudyStatus,
  SurveyQuestionType,
  SurveyOverallApprovalStatus,
  SurveyApprovalCommentStatus,
  Platform,
  KPI,
  Currency,
  Position,
  Feature
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Restore deleteMany calls
  await prisma.surveyApprovalComment.deleteMany();
  await prisma.surveyApprovalStatus.deleteMany();
  await prisma.surveyOption.deleteMany();
  await prisma.surveyQuestion.deleteMany();
  await prisma.brandLiftReport.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.brandLiftStudy.deleteMany();
  console.log('Previous Brand Lift data cleared.');

  // Create Primary Contacts first
  const contact1 = await prisma.primaryContact.create({
    data: { firstName: 'Seed', surname: 'User1', email: 'seed1@example.com', position: Position.Manager }, // Use Enum
  });
  const contact2 = await prisma.primaryContact.create({
    data: { firstName: 'Seed', surname: 'User2', email: 'seed2@example.com', position: Position.Director }, // Use Enum
  });

  // --- Create Sample CampaignWizardSubmissions ---
  const campaign1 = await prisma.campaignWizardSubmission.create({
    data: {
      campaignName: 'Q1 Awareness Push',
      description: 'Seed data campaign 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      timeZone: 'UTC',
      contacts: 'Placeholder Contact Info',
      currency: Currency.USD, // Use Enum
      totalBudget: 10000,
      socialMediaBudget: 5000,
      platform: Platform.INSTAGRAM, // Use Enum
      influencerHandle: '@seed_influencer1',
      mainMessage: 'Main message for Q1 push',
      hashtags: '#BrandX #Q1Push',
      memorability: 'High',
      keyBenefits: 'Benefit 1, Benefit 2',
      expectedAchievements: 'Achievement 1',
      purchaseIntent: 'Medium',
      brandPerception: 'Positive',
      primaryKPI: KPI.BRAND_AWARENESS, // Use Enum
      secondaryKPIs: [KPI.AD_RECALL], // Use Enum
      features: [Feature.BRAND_LIFT], // Use Enum
      submissionStatus: SubmissionStatus.submitted, // Use Enum
      primaryContact: { connect: { id: contact1.id } }
      // Assume userId is optional or add: userId: 'clerk_user_id_placeholder_1'
    },
  });

  const campaign2 = await prisma.campaignWizardSubmission.create({
    data: {
      campaignName: 'Summer Product Launch',
      description: 'Seed data campaign 2',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      timeZone: 'PST',
      contacts: 'Placeholder Contact Info 2',
      currency: Currency.GBP, // Use Enum
      totalBudget: 25000,
      socialMediaBudget: 15000,
      platform: Platform.YOUTUBE, // Use Enum
      influencerHandle: '@seed_influencer2',
      mainMessage: 'Main message for Summer Launch',
      hashtags: '#BrandX #SummerLaunch',
      memorability: 'Medium',
      keyBenefits: 'Benefit A, Benefit B',
      expectedAchievements: 'Achievement X',
      purchaseIntent: 'High',
      brandPerception: 'Innovative',
      primaryKPI: KPI.PURCHASE_INTENT, // Use Enum
      secondaryKPIs: [KPI.CONSIDERATION], // Use Enum
      features: [Feature.BRAND_LIFT, Feature.CREATIVE_ASSET_TESTING], // Use Enum
      submissionStatus: SubmissionStatus.submitted, // Use Enum
      primaryContact: { connect: { id: contact2.id } }
      // Assume userId is optional or add: userId: 'clerk_user_id_placeholder_2'
    },
  });
  console.log('Created campaigns: ' + campaign1.id + ', ' + campaign2.id);

  const study1 = await prisma.brandLiftStudy.create({
    data: {
      name: 'Q1 Awareness Study - Draft',
      submissionId: campaign1.id,
      status: BrandLiftStudyStatus.DRAFT, // Use Enum
      funnelStage: 'Top Funnel',
      primaryKpi: 'Brand Awareness',
      secondaryKpis: ['Ad Recall'],
      organizationId: 'org_placeholder',
    },
  });
  const study2 = await prisma.brandLiftStudy.create({
    data: {
      name: 'Summer Launch Study - Pending',
      submissionId: campaign2.id,
      status: BrandLiftStudyStatus.PENDING_APPROVAL, // Use Enum
      funnelStage: 'Bottom Funnel',
      primaryKpi: 'Purchase Intent',
      secondaryKpis: ['Consideration'],
      organizationId: 'org_placeholder',
    },
  });
  console.log('Created studies: ' + study1.id + ', ' + study2.id);

  const question1Study2 = await prisma.surveyQuestion.create({
    data: {
      studyId: study2.id,
      text: 'How familiar are you with BrandX after seeing our summer ads?',
      questionType: SurveyQuestionType.SINGLE_CHOICE, // Use Enum
      order: 1,
      isRandomized: false,
      isMandatory: true,
      kpiAssociation: 'Brand Awareness',
      options: {
        create: [
          { text: 'Very familiar', order: 1 },
          { text: 'Somewhat familiar', order: 2 },
          { text: 'Not familiar at all', order: 3 },
        ],
      },
    },
  });

  const question2Study2 = await prisma.surveyQuestion.create({
    data: {
      studyId: study2.id,
      text: 'How likely are you to purchase BrandX this summer?',
      questionType: SurveyQuestionType.SINGLE_CHOICE, // Use Enum
      order: 2,
      isRandomized: false,
      isMandatory: true,
      kpiAssociation: 'Purchase Intent',
      options: {
        create: [
          { text: 'Very likely', order: 1 },
          { text: 'Somewhat likely', order: 2 },
          { text: 'Not likely', order: 3 },
        ],
      },
    },
  });
  console.log('Added questions to study ' + study2.id);

  const approvalStatusStudy2 = await prisma.surveyApprovalStatus.create({
    data: {
      studyId: study2.id,
      status: SurveyOverallApprovalStatus.PENDING_REVIEW, // Use Enum
      requestedSignOff: false,
    },
  });

  const comment1Study2 = await prisma.surveyApprovalComment.create({
    data: {
      approvalStatusId: approvalStatusStudy2.id,
      questionId: question1Study2.id,
      authorId: 'clerk_user_id_reviewer_1',
      text: 'Could we rephrase option 3 to be less negative?',
      status: SurveyApprovalCommentStatus.OPEN, // Use Enum
    },
  });

  const comment2Study2 = await prisma.surveyApprovalComment.create({
    data: {
      approvalStatusId: approvalStatusStudy2.id,
      authorId: 'clerk_user_id_reviewer_2',
      text: 'Looks good overall, approved from my side.',
      status: SurveyApprovalCommentStatus.RESOLVED, // Use Enum
      resolutionNote: 'Approved by Reviewer 2',
    },
  });
  console.log('Added approval status and comments to study ' + study2.id);

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
