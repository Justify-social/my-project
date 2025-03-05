/**
 * Database Operations Test Script
 * 
 * This script tests various database operations using the transaction manager,
 * demonstrating proper transaction boundaries, error handling, and rollback mechanisms.
 * 
 * Run with: node src/scripts/test-database-operations.js
 */

// Allow dynamic imports in Node.js
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
  runTests();
});

import { randomUUID } from 'crypto';

async function runTests() {
  console.log('\n=== Database Operations Test Suite ===\n');
  
  try {
    // Setup test data
    const testId = randomUUID();
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    
    // 1. Test basic CRUD operations
    await testBasicCrud(testId, timestamp);
    
    // 2. Test transactions with isolation levels
    await testTransactionIsolation(testId, timestamp);
    
    // 3. Test error handling and rollbacks
    await testErrorHandling(testId, timestamp);
    
    // 4. Test batch operations
    await testBatchOperations(testId, timestamp);
    
    console.log('\n=== All tests completed successfully ===\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

async function testBasicCrud(testId, timestamp) {
  console.log('\n--- Testing Basic CRUD Operations ---\n');
  
  // 1. Create a test campaign
  console.log('Creating test campaign...');
  const campaign = await createTestCampaign(testId, timestamp);
  console.log('✅ Created campaign with ID:', campaign.id);
  
  // 2. Read the campaign
  console.log('\nReading campaign data...');
  const readCampaign = await readCampaign(campaign.id);
  console.log('✅ Successfully read campaign data');
  
  // 3. Update the campaign
  console.log('\nUpdating campaign...');
  const updatedCampaign = await updateCampaign(campaign.id, `Updated ${timestamp}`);
  console.log('✅ Updated campaign with new name:', updatedCampaign.name);
  
  // 4. Delete the campaign
  console.log('\nDeleting campaign...');
  await deleteCampaign(campaign.id);
  console.log('✅ Deleted campaign');
  
  // 5. Verify deletion
  try {
    await readCampaign(campaign.id);
    throw new Error('Campaign should be deleted');
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('✅ Verified campaign deletion');
    } else {
      throw error;
    }
  }
}

async function testTransactionIsolation(testId, timestamp) {
  console.log('\n--- Testing Transaction Isolation Levels ---\n');
  
  // Create a test campaign
  const campaign = await createTestCampaign(testId, `IsolationTest_${timestamp}`);
  console.log('✅ Created test campaign for isolation testing with ID:', campaign.id);
  
  // Test different isolation levels
  const isolationLevels = [
    'READ UNCOMMITTED',
    'READ COMMITTED',
    'REPEATABLE READ',
    'SERIALIZABLE'
  ];
  
  for (const isolation of isolationLevels) {
    console.log(`\nTesting ${isolation} isolation level...`);
    
    const response = await fetch('http://localhost:3000/api/test/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: campaign.id,
        isolation: isolation,
        operation: 'update',
        data: {
          description: `Updated with ${isolation} isolation level at ${new Date().toISOString()}`
        }
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Successfully executed transaction with ${isolation} isolation`);
      console.log(`   Duration: ${result.timing.durationMs}ms`);
    } else {
      const errorData = await response.json();
      console.error(`❌ Failed to execute transaction with ${isolation} isolation:`, errorData.error);
    }
  }
  
  // Clean up
  await deleteCampaign(campaign.id);
  console.log('\n✅ Cleaned up isolation test data');
}

async function testErrorHandling(testId, timestamp) {
  console.log('\n--- Testing Error Handling and Rollbacks ---\n');
  
  // Test cases for error handling
  const errorTests = [
    { name: 'Validation Error', scenario: 'missing_fields' },
    { name: 'Unique Constraint', scenario: 'duplicate' },
    { name: 'Foreign Key Violation', scenario: 'invalid_reference' },
    { name: 'Retry Mechanism', scenario: 'temporary_error' }
  ];
  
  for (const test of errorTests) {
    console.log(`\nTesting scenario: ${test.name}...`);
    
    const response = await fetch('http://localhost:3000/api/test/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'error_test',
        scenario: test.scenario,
        testId
      })
    });
    
    const result = await response.json();
    
    if (test.scenario === 'temporary_error' && response.ok) {
      console.log(`✅ Successfully tested retry mechanism. Succeeded after ${result.retryAttempts} attempts.`);
    } else if (!response.ok) {
      console.log(`✅ Successfully tested error handling for ${test.name}`);
      console.log(`   Error: ${result.error}`);
    } else {
      console.error(`❌ Expected error but got success for ${test.name}`);
    }
  }
}

async function testBatchOperations(testId, timestamp) {
  console.log('\n--- Testing Batch Operations ---\n');
  
  console.log('Creating a campaign with related records in a single transaction...');
  
  const response = await fetch('http://localhost:3000/api/test/transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `Batch_${timestamp}`,
      testId,
      operation: 'batch',
      additionalOperations: [
        { type: 'influencer', platform: 'INSTAGRAM' },
        { type: 'influencer', platform: 'YOUTUBE' },
        { type: 'history', step: 1 }
      ]
    })
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('✅ Successfully executed batch operation');
    console.log(`   Created ${result.data.length} records`);
    console.log(`   Main campaign ID: ${result.data[0].id}`);
    console.log(`   Transaction duration: ${result.timing.durationMs}ms`);
    
    // Clean up the created campaign and related records
    await deleteCampaign(result.data[0].id);
    console.log('✅ Cleaned up batch operation test data');
  } else {
    const errorData = await response.json();
    console.error('❌ Failed to execute batch operation:', errorData.error);
  }
}

// Helper functions for database operations

async function createTestCampaign(testId, timestamp) {
  const response = await fetch('http://localhost:3000/api/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      campaignName: `Test_${timestamp}`,
      description: `Test campaign created at ${timestamp}`,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      budgetTotal: 10000,
      budgetSocialMedia: 5000,
      currency: 'USD',
      timezone: 'UTC',
      status: 'DRAFT',
      testId
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create campaign: ${errorData.error}`);
  }
  
  const data = await response.json();
  return data.data;
}

async function readCampaign(id) {
  const response = await fetch(`http://localhost:3000/api/campaigns?id=${id}`, {
    method: 'GET'
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to read campaign: ${errorData.error}`);
  }
  
  return response.json();
}

async function updateCampaign(id, newName) {
  const response = await fetch(`http://localhost:3000/api/campaigns/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      campaignName: newName
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update campaign: ${errorData.error}`);
  }
  
  const data = await response.json();
  
  // Fetch the updated campaign to verify the change
  return readCampaign(id);
}

async function deleteCampaign(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/campaigns/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete campaign: ${errorData.error}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error deleting campaign ${id}:`, error.message);
    throw error;
  }
} 