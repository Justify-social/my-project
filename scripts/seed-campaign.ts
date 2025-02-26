const { PrismaClient, Currency, Platform, KPI, Feature, Position, SubmissionStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script...');

  try {
    // Create primary contact
    const primaryContact = await prisma.primaryContact.create({
      data: {
        firstName: 'Olivia',
        surname: 'Turner',
        email: 'olivia.turner@thewritecompany.com',
        position: Position.Manager,
      },
    });

    console.log('Created primary contact:', primaryContact.id);

    // Create secondary contact
    const secondaryContact = await prisma.secondaryContact.create({
      data: {
        firstName: 'Thomas',
        surname: 'Crowley',
        email: 'thomas.crowley@thewritecompany.com',
        position: Position.Director,
      },
    });

    console.log('Created secondary contact:', secondaryContact.id);

    // Create campaign with all required fields
    const campaign = await prisma.campaignWizardSubmission.create({
      data: {
        campaignName: 'Winter Promotion',
        description: 'Leveraging digital-first attitude with enticing creative material, highlight product benefits, inspiring call-to-action, and driving sales and loyalty with advanced creative and powerful messages.',
        startDate: new Date('2023-12-15'),
        endDate: new Date('2024-02-28'),
        timeZone: 'GMT (UTC+0)',
        contacts: 'Brand Marketing Team',
        currency: Currency.USD,
        totalBudget: 120000,
        socialMediaBudget: 60000,
        platform: Platform.Instagram,
        influencerHandle: 'samantha.green',
        primaryContactId: primaryContact.id,
        secondaryContactId: secondaryContact.id,
        mainMessage: 'Enjoy winter with our new collection featuring elegant designs and warm fabrics.',
        hashtags: '#WinterCollection #FashionEssentials',
        memorability: 'High impact visuals with consistent branding elements',
        keyBenefits: 'Premium quality, competitive pricing, sustainable sourcing',
        expectedAchievements: 'Increase in winter sales by 30%, boost in brand recognition',
        purchaseIntent: 'Drive immediate purchases through limited-time offers',
        brandPerception: 'Position as premium yet accessible winter fashion brand',
        primaryKPI: KPI.brandAwareness,
        secondaryKPIs: [KPI.consideration, KPI.purchaseIntent],
        features: [Feature.BRAND_LIFT, Feature.CREATIVE_ASSET_TESTING],
        submissionStatus: SubmissionStatus.draft,
      },
    });

    console.log('Created campaign:', campaign.id);

    // Create audience
    const audience = await prisma.audience.create({
      data: {
        campaignId: campaign.id,
        age1824: 25,
        age2534: 35,
        age3544: 20,
        age4554: 15,
        age5564: 5,
        age65plus: 0,
        otherGender: '',
        educationLevel: 'College',
        jobTitles: 'Professional, Executive, Student',
        incomeLevel: 'Middle to Upper',
        genders: {
          create: [
            { gender: 'Male' },
            { gender: 'Female' },
          ],
        },
        locations: {
          create: [
            { location: 'United States' },
            { location: 'United Kingdom' },
            { location: 'Europe' },
          ],
        },
        languages: {
          create: [
            { language: 'English' },
            { language: 'Spanish' },
            { language: 'French' },
          ],
        },
        screeningQuestions: {
          create: [
            { question: 'Fashion enthusiasts' },
            { question: 'Online shoppers' },
            { question: 'Brand conscious' },
          ],
        },
        competitors: {
          create: [
            { competitor: 'Zara' },
            { competitor: 'H&M' },
            { competitor: 'Uniqlo' },
          ],
        },
      },
    });

    console.log('Created audience:', audience.id);

    // Create creative assets
    const creativeAssets = await Promise.all([
      prisma.creativeAsset.create({
        data: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
          fileName: 'winter_fashion_1.jpg',
          assetName: 'Winter Fashion Showcase',
          fileSize: 1250,
          submissionId: campaign.id,
        },
      }),
      prisma.creativeAsset.create({
        data: {
          type: 'video',
          url: 'https://example.com/winter_collection_video.mp4',
          fileName: 'winter_collection.mp4',
          assetName: 'Winter Collection Video',
          fileSize: 8500,
          submissionId: campaign.id,
        },
      }),
      prisma.creativeAsset.create({
        data: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
          fileName: 'winter_model.jpg',
          assetName: 'Winter Model Showcase',
          fileSize: 980,
          submissionId: campaign.id,
        },
      }),
    ]);

    console.log('Created creative assets:', creativeAssets.map(a => a.id));

    // Create creative requirements
    const creativeRequirements = await Promise.all([
      prisma.creativeRequirement.create({
        data: {
          requirement: 'All videos must be under 60 seconds',
          submissionId: campaign.id,
        },
      }),
      prisma.creativeRequirement.create({
        data: {
          requirement: 'Brand logo must be visible in all assets',
          submissionId: campaign.id,
        },
      }),
      prisma.creativeRequirement.create({
        data: {
          requirement: 'Use winter color palette (blue, white, silver)',
          submissionId: campaign.id,
        },
      }),
    ]);

    console.log('Created creative requirements:', creativeRequirements.map(r => r.id));

    console.log('Seed completed successfully!');
    console.log('You can now view the campaign at http://localhost:3000/campaigns/' + campaign.id);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Execution complete'))
  .catch((e) => {
    console.error('Script execution failed:', e);
    process.exit(1);
  });
