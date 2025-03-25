// Using CommonJS require syntax to avoid module issues
const path = require('path');
require('module-alias').addAlias('@', path.join(__dirname, '../../'));

const { validateSchema, validateModel, createSampleCampaign, createSampleSubmission } = require('../utils/schema-validator');

async function main() {
  console.log('Starting database validation...');
  
  // 1. Validate schema against database
  console.log('\n=== Validating Schema ===');
  const schemaResult = await validateSchema();
  
  console.log(`\nValid Models (${schemaResult.validModels.length}):`);
  schemaResult.validModels.forEach(model => {
    console.log(`- ${model.model}: ${model.count} records`);
  });
  
  console.log(`\nInvalid Models (${schemaResult.invalidModels.length}):`);
  schemaResult.invalidModels.forEach(model => {
    console.log(`- ${model.model}: ${model.error}`);
  });
  
  // 2. Validate specific models of interest
  console.log('\n=== Validating Specific Models ===');
  const campaignWizardResult = await validateModel('campaignWizard');
  console.log('CampaignWizard:', campaignWizardResult.exists ? 
    `Exists (${campaignWizardResult.count} records)` : 
    `Does not exist (${campaignWizardResult.error})`);
  
  const submissionResult = await validateModel('campaignWizardSubmission');
  console.log('CampaignWizardSubmission:', submissionResult.exists ? 
    `Exists (${submissionResult.count} records)` : 
    `Does not exist (${submissionResult.error})`);
  
  // 3. Test campaign creation
  console.log('\n=== Testing Campaign Creation ===');
  const campaignResult = await createSampleCampaign();
  if (campaignResult.success) {
    console.log('✓ Successfully created test campaign');
  } else {
    console.log('✗ Failed to create test campaign');
    console.log(`Error: ${campaignResult.error}`);
  }
  
  // 4. Test submission creation
  console.log('\n=== Testing Submission Creation ===');
  const submissionTestResult = await createSampleSubmission();
  if (submissionTestResult.success) {
    console.log('✓ Successfully created test submission');
  } else {
    console.log('✗ Failed to create test submission');
    console.log(`Error: ${submissionTestResult.error}`);
  }
  
  console.log('\nDatabase validation complete!');
}

main()
  .catch((e) => {
    console.error('Validation failed with error:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  }); 