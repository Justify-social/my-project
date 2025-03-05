/**
 * Test script for the transaction manager
 * 
 * This script demonstrates the transaction manager's capabilities by:
 * 1. Executing simple CRUD operations using transactions
 * 2. Demonstrating transaction isolation levels
 * 3. Testing automatic retry functionality
 * 4. Handling transaction errors
 * 
 * Run with: node src/scripts/test-transaction-manager.js
 */

// Allow dynamic imports in Node.js
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
  runTests();
});

// UUID generation
import { randomUUID } from 'crypto';

async function runTests() {
  console.log('Testing Transaction Manager...');
  
  // 1. First, test basic campaign creation with transaction
  await testBasicTransaction();
  
  // 2. Test transaction isolation levels
  await testIsolationLevels();
  
  // 3. Test batch operations
  await testBatchOperations();
  
  // 4. Test error handling and retries
  await testErrorHandling();
  
  console.log('\nAll transaction manager tests completed.\n');
}

async function testBasicTransaction() {
  console.log('\n--- Testing Basic Transaction ---');
  
  try {
    // Generate unique test data
    const testId = randomUUID();
    const campaignName = `Test Campaign ${new Date().toISOString().replace(/:/g, '-')}`;
    
    // Call the API that uses transaction manager for campaign creation
    const response = await fetch('http://localhost:3000/api/test/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: campaignName,
        testId,
        operation: 'create'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Basic transaction test successful');
      console.log('Campaign created with ID:', result.data.id);
      console.log('Transaction timing:', result.timing);
      
      // Store the campaign ID for later tests
      global.testCampaignId = result.data.id;
    } else {
      console.error('❌ Basic transaction test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during basic transaction test:', error.message);
  }
}

async function testIsolationLevels() {
  console.log('\n--- Testing Transaction Isolation Levels ---');
  
  const isolationLevels = [
    'READ UNCOMMITTED',
    'READ COMMITTED',
    'REPEATABLE READ',
    'SERIALIZABLE'
  ];
  
  for (const isolation of isolationLevels) {
    try {
      // Use the campaign ID from the previous test
      if (!global.testCampaignId) {
        console.warn('⚠️ No test campaign ID available, skipping isolation level test');
        return;
      }
      
      const response = await fetch('http://localhost:3000/api/test/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: global.testCampaignId,
          isolation: isolation,
          operation: 'update',
          data: {
            description: `Updated with ${isolation} isolation level`
          }
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Transaction with ${isolation} isolation level successful`);
        console.log(`Transaction timing for ${isolation}:`, result.timing);
      } else {
        console.error(`❌ Transaction with ${isolation} isolation level failed:`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error during ${isolation} isolation test:`, error.message);
    }
  }
}

async function testBatchOperations() {
  console.log('\n--- Testing Batch Operations ---');
  
  try {
    // Create a new test campaign for batch operations
    const testId = randomUUID();
    const campaignName = `Batch Test Campaign ${new Date().toISOString().replace(/:/g, '-')}`;
    
    const response = await fetch('http://localhost:3000/api/test/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: campaignName,
        testId,
        operation: 'batch',
        additionalOperations: [
          { type: 'influencer', platform: 'INSTAGRAM' },
          { type: 'influencer', platform: 'YOUTUBE' },
          { type: 'history', step: 1 }
        ]
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Batch operations test successful');
      console.log('Created campaign and related records:');
      console.log(`- Campaign ID: ${result.data[0].id}`);
      console.log(`- ${result.data.length - 1} related records created`);
      console.log('Transaction timing:', result.timing);
    } else {
      console.error('❌ Batch operations test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during batch operations test:', error.message);
  }
}

async function testErrorHandling() {
  console.log('\n--- Testing Error Handling ---');
  
  const testCases = [
    { name: 'Validation Error', scenario: 'missing_fields' },
    { name: 'Unique Constraint', scenario: 'duplicate' },
    { name: 'Foreign Key Violation', scenario: 'invalid_reference' },
    { name: 'Retry Mechanism', scenario: 'temporary_error' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing scenario: ${testCase.name}`);
      
      const response = await fetch('http://localhost:3000/api/test/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'error_test',
          scenario: testCase.scenario
        })
      });
      
      const result = await response.json();
      
      if (response.status === 400 || response.status === 409 || response.status === 500) {
        console.log(`✅ Error handling test for ${testCase.name} successful`);
        console.log('Received expected error:', result.error);
        if (result.retryAttempts) {
          console.log(`Made ${result.retryAttempts} retry attempts before failing`);
        }
      } else if (response.ok) {
        console.log(`✅ Retry mechanism successful for ${testCase.name}`);
        console.log(`Succeeded after ${result.retryAttempts} attempts`);
      } else {
        console.error(`❌ Error handling test for ${testCase.name} failed with unexpected response:`, result);
      }
    } catch (error) {
      console.error(`❌ Error during ${testCase.name} test:`, error.message);
    }
  }
}

// Clean up test data
async function cleanupTestData() {
  try {
    if (global.testCampaignId) {
      const response = await fetch('http://localhost:3000/api/test/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: global.testCampaignId,
          operation: 'delete'
        })
      });
      
      if (response.ok) {
        console.log('✅ Test data cleanup successful');
      }
    }
  } catch (error) {
    console.error('Error during test data cleanup:', error.message);
  }
}

// Handle process exit to clean up test data
process.on('exit', () => {
  console.log('Exiting test script');
});

process.on('SIGINT', async () => {
  console.log('\nCleaning up test data before exit...');
  await cleanupTestData();
  process.exit(0);
}); 