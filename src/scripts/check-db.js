// Simple script to check database models
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('Checking database models...');
  
  // Get all models available in Prisma client
  const models = Object.keys(prisma).filter(key => 
    typeof prisma[key] === 'object' && 
    prisma[key] !== null &&
    !['$on', '$connect', '$disconnect', '$use', '$transaction', '$executeRaw', '$queryRaw'].includes(key)
  );
  
  console.log(`Found ${models.length} models in the Prisma client:`, models);
  
  // Check for CampaignWizard
  console.log('\nChecking CampaignWizard model:');
  if (models.includes('campaignWizard')) {
    try {
      const count = await prisma.campaignWizard.count();
      console.log(`✅ CampaignWizard model exists with ${count} records`);
    } catch (error) {
      console.error('❌ Error accessing CampaignWizard:', error.message);
    }
  } else {
    console.log('❌ CampaignWizard model not found in Prisma client');
  }
  
  // Check for CampaignWizardSubmission
  console.log('\nChecking CampaignWizardSubmission model:');
  if (models.includes('campaignWizardSubmission')) {
    try {
      const count = await prisma.campaignWizardSubmission.count();
      console.log(`✅ CampaignWizardSubmission model exists with ${count} records`);
    } catch (error) {
      console.error('❌ Error accessing CampaignWizardSubmission:', error.message);
    }
  } else {
    console.log('❌ CampaignWizardSubmission model not found in Prisma client');
  }
  
  // Check all models with a count query
  console.log('\nChecking all models:');
  for (const model of models) {
    try {
      const count = await prisma[model].count();
      console.log(`✅ ${model}: ${count} records`);
    } catch (error) {
      console.error(`❌ ${model}: Error - ${error.message}`);
    }
  }
}

checkDatabase()
  .catch(error => {
    console.error('Script failed:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\nDatabase check complete.');
  }); 