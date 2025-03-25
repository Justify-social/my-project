/**
 * API Endpoint Test Script
 * 
 * This script tests the functionality, validation, and error handling of 
 * the Campaign Wizard API endpoints.
 * 
 * Usage: node src/scripts/test-api-endpoints.js
 */

const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'test-token'; // Replace with a valid token in production

// Test Data
const TEST_PREFIX = 'TEST_API_';
const TEST_TIMESTAMP = Date.now();
const TEST_CAMPAIGN_NAME = `${TEST_PREFIX}Campaign_${TEST_TIMESTAMP}`;
const TEST_CAMPAIGN_DATA = {
  name: TEST_CAMPAIGN_NAME,
  businessGoal: 'Testing API endpoints',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  timeZone: 'UTC',
  primaryContact: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1 (555) 123-4567',
    position: 'Manager'
  },
  budget: {
    total: 10000,
    currency: 'USD',
    allocation: [
      {
        category: 'Content Creation',
        percentage: 40
      },
      {
        category: 'Media Spend',
        percentage: 60
      }
    ]
  },
  primaryKPI: 'BRAND_AWARENESS',
  secondaryKPIs: ['AD_RECALL', 'PURCHASE_INTENT'],
  features: ['CREATIVE_ASSET_TESTING', 'BRAND_LIFT']
};

// Test Results
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0
};

// Helper Functions
async function fetchWithAuth(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

function logResult(testName, passed, message = '') {
  if (passed) {
    testResults.passed++;
    console.log(chalk.green(`✓ PASS: ${testName}`));
  } else {
    testResults.failed++;
    console.log(chalk.red(`✗ FAIL: ${testName}`));
    if (message) {
      console.log(chalk.red(`  Error: ${message}`));
    }
  }
  testResults.total++;
}

function logSkipped(testName, reason = '') {
  testResults.skipped++;
  testResults.total++;
  console.log(chalk.yellow(`- SKIP: ${testName}`));
  if (reason) {
    console.log(chalk.yellow(`  Reason: ${reason}`));
  }
}

function logSectionHeader(title) {
  console.log('');
  console.log(chalk.bgBlue.white(`▶ ${title}`));
  console.log('');
}

// Test Scenarios
async function testCreateCampaign() {
  logSectionHeader('Testing Campaign Creation');

  // Test valid campaign creation
  console.log('Creating test campaign:', TEST_CAMPAIGN_NAME);
  const response = await fetchWithAuth('/campaigns', {
    method: 'POST',
    body: JSON.stringify(TEST_CAMPAIGN_DATA)
  });

  logResult(
    'Create campaign with valid data',
    response.ok && response.data.success,
    response.ok ? '' : `HTTP ${response.status}: ${JSON.stringify(response.data)}`
  );

  // Save the campaign ID for later tests
  if (response.ok && response.data.success) {
    const campaignId = response.data.data.id;
    console.log(`Created campaign with ID: ${campaignId}`);
    return campaignId;
  }

  return null;
}

async function testValidation() {
  logSectionHeader('Testing Validation');

  // Test missing required field
  const invalidData = { ...TEST_CAMPAIGN_DATA };
  delete invalidData.name;
  
  const response = await fetchWithAuth('/campaigns', {
    method: 'POST',
    body: JSON.stringify(invalidData)
  });

  logResult(
    'Validation: missing required field (name)',
    !response.ok && response.status === 400,
    response.status !== 400 ? `Expected HTTP 400, got ${response.status}` : ''
  );

  // Test invalid date format
  const invalidDateData = { 
    ...TEST_CAMPAIGN_DATA,
    name: `${TEST_PREFIX}InvalidDate_${TEST_TIMESTAMP}`,
    startDate: 'not-a-date' 
  };
  
  const dateResponse = await fetchWithAuth('/campaigns', {
    method: 'POST',
    body: JSON.stringify(invalidDateData)
  });

  logResult(
    'Validation: invalid date format',
    !dateResponse.ok && dateResponse.status === 400,
    dateResponse.status !== 400 ? `Expected HTTP 400, got ${dateResponse.status}` : ''
  );

  // Test invalid enum value
  const invalidEnumData = { 
    ...TEST_CAMPAIGN_DATA,
    name: `${TEST_PREFIX}InvalidEnum_${TEST_TIMESTAMP}`,
    primaryKPI: 'INVALID_KPI' 
  };
  
  const enumResponse = await fetchWithAuth('/campaigns', {
    method: 'POST',
    body: JSON.stringify(invalidEnumData)
  });

  logResult(
    'Validation: invalid enum value',
    !enumResponse.ok && enumResponse.status === 400,
    enumResponse.status !== 400 ? `Expected HTTP 400, got ${enumResponse.status}` : ''
  );
}

async function testGetCampaign(campaignId) {
  logSectionHeader('Testing Campaign Retrieval');

  if (!campaignId) {
    logSkipped('Get campaign by ID', 'No campaign ID available from creation test');
    logSkipped('Get all campaigns', 'Skipped dependent test');
    return;
  }

  // Test get by ID
  const response = await fetchWithAuth(`/campaigns/${campaignId}`, {
    method: 'GET'
  });

  logResult(
    'Get campaign by ID',
    response.ok && response.data.success && response.data.data.id === campaignId,
    response.ok ? '' : `HTTP ${response.status}: ${JSON.stringify(response.data)}`
  );

  // Test get all campaigns
  const listResponse = await fetchWithAuth('/campaigns', {
    method: 'GET'
  });

  const campaignExists = listResponse.ok && 
    listResponse.data.success && 
    Array.isArray(listResponse.data.data.campaigns) &&
    listResponse.data.data.campaigns.some(campaign => campaign.id === campaignId);

  logResult(
    'Get all campaigns',
    campaignExists,
    listResponse.ok ? (
      campaignExists ? '' : 'Created campaign not found in list'
    ) : `HTTP ${listResponse.status}: ${JSON.stringify(listResponse.data)}`
  );
}

async function testUpdateCampaign(campaignId) {
  logSectionHeader('Testing Campaign Update');

  if (!campaignId) {
    logSkipped('Update campaign', 'No campaign ID available from creation test');
    return;
  }

  const updateData = {
    name: `${TEST_CAMPAIGN_NAME}_Updated`,
    businessGoal: 'Updated goal for testing'
  };

  const response = await fetchWithAuth(`/campaigns/${campaignId}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });

  logResult(
    'Update campaign',
    response.ok && response.data.success && response.data.data.name === updateData.name,
    response.ok ? '' : `HTTP ${response.status}: ${JSON.stringify(response.data)}`
  );

  // Verify the update
  const getResponse = await fetchWithAuth(`/campaigns/${campaignId}`, {
    method: 'GET'
  });

  logResult(
    'Verify campaign update',
    getResponse.ok && 
      getResponse.data.success && 
      getResponse.data.data.name === updateData.name &&
      getResponse.data.data.businessGoal === updateData.businessGoal,
    getResponse.ok ? '' : `HTTP ${getResponse.status}: ${JSON.stringify(getResponse.data)}`
  );
}

async function testDeleteCampaign(campaignId) {
  logSectionHeader('Testing Campaign Deletion');

  if (!campaignId) {
    logSkipped('Delete campaign', 'No campaign ID available from creation test');
    logSkipped('Verify deletion', 'Skipped dependent test');
    return;
  }

  const response = await fetchWithAuth(`/campaigns/${campaignId}`, {
    method: 'DELETE'
  });

  logResult(
    'Delete campaign',
    response.ok && response.data.success,
    response.ok ? '' : `HTTP ${response.status}: ${JSON.stringify(response.data)}`
  );

  // Verify the deletion
  const getResponse = await fetchWithAuth(`/campaigns/${campaignId}`, {
    method: 'GET'
  });

  logResult(
    'Verify campaign deletion',
    !getResponse.ok && getResponse.status === 404,
    getResponse.status !== 404 ? `Expected HTTP 404, got ${getResponse.status}` : ''
  );
}

async function testErrorHandling() {
  logSectionHeader('Testing Error Handling');

  // Test non-existent campaign
  const nonExistentId = uuidv4();
  const response = await fetchWithAuth(`/campaigns/${nonExistentId}`, {
    method: 'GET'
  });

  logResult(
    'Error: non-existent resource',
    !response.ok && response.status === 404,
    response.status !== 404 ? `Expected HTTP 404, got ${response.status}` : ''
  );

  // Test invalid JSON payload
  const invalidJsonResponse = await fetch(`${API_BASE_URL}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    },
    body: '{invalid-json'
  });

  let invalidJsonData;
  try {
    invalidJsonData = await invalidJsonResponse.json();
  } catch (error) {
    invalidJsonData = { error: 'Could not parse response' };
  }

  logResult(
    'Error: invalid JSON payload',
    !invalidJsonResponse.ok && invalidJsonResponse.status === 400,
    invalidJsonResponse.status !== 400 ? `Expected HTTP 400, got ${invalidJsonResponse.status}` : ''
  );

  // Test unauthorized access
  const unauthorizedResponse = await fetch(`${API_BASE_URL}/campaigns`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
      // No Authorization header
    }
  });

  logResult(
    'Error: unauthorized access',
    !unauthorizedResponse.ok && (unauthorizedResponse.status === 401 || unauthorizedResponse.status === 403),
    !(unauthorizedResponse.status === 401 || unauthorizedResponse.status === 403) ? 
      `Expected HTTP 401/403, got ${unauthorizedResponse.status}` : ''
  );
}

async function testDatabaseHealth() {
  logSectionHeader('Testing Database Health Endpoint');

  const response = await fetchWithAuth('/health/db', {
    method: 'GET'
  });

  logResult(
    'Database health check',
    response.ok && 
      response.data.success && 
      response.data.data.database && 
      response.data.data.database.connected === true,
    response.ok ? '' : `HTTP ${response.status}: ${JSON.stringify(response.data)}`
  );
}

// Main Test Runner
async function runTests() {
  console.log(chalk.bgCyan.black('▶▶▶ CAMPAIGN WIZARD API ENDPOINT TESTS ◀◀◀'));
  console.log(chalk.cyan(`API Base URL: ${API_BASE_URL}`));
  console.log('');

  try {
    // Run tests in sequence
    const campaignId = await testCreateCampaign();
    await testValidation();
    await testGetCampaign(campaignId);
    await testUpdateCampaign(campaignId);
    await testErrorHandling();
    await testDatabaseHealth();
    await testDeleteCampaign(campaignId);

    // Print test summary
    console.log('');
    console.log(chalk.bgCyan.black('▶▶▶ TEST SUMMARY ◀◀◀'));
    console.log(chalk.cyan(`Total Tests: ${testResults.total}`));
    console.log(chalk.green(`Passed: ${testResults.passed}`));
    console.log(chalk.red(`Failed: ${testResults.failed}`));
    console.log(chalk.yellow(`Skipped: ${testResults.skipped}`));
    console.log('');

    if (testResults.failed > 0) {
      console.log(chalk.red('❌ Some tests failed. Please check the results above.'));
      process.exit(1);
    } else {
      console.log(chalk.green('✅ All tests passed!'));
      process.exit(0);
    }
  } catch (error) {
    console.error(chalk.red('Error running tests:'), error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 