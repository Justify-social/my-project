/**
 * Tests for Enum Transformation Utilities
 */

// Use CommonJS require syntax
const { EnumTransformers, formatEnumForDisplay } = require('./enum-transformers');
// We'll handle the Prisma client types differently in CommonJS
// For testing we'll create mock types to avoid importing from @prisma/client
const mockTypes = {
  KPI: ['AD_RECALL', 'BRAND_AWARENESS', 'CONSIDERATION', 'MESSAGE_ASSOCIATION', 'UNKNOWN_KPI'],
  Platform: ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'UNKNOWN_PLATFORM'],
  Currency: ['USD', 'GBP', 'EUR'],
  Feature: ['CREATIVE_ASSET_TESTING', 'BRAND_LIFT', 'BRAND_HEALTH', 'MIXED_MEDIA_MODELING']
};

// IMPORTANT: In a real scenario, this would be set by the environment
// process.env.NODE_ENV = 'development';
// For testing purposes, we'll keep debug logs enabled via enabling a debug flag in the utility

// Test KPI transformers
console.log('--- TESTING KPI TRANSFORMERS ---');
console.log('Frontend to Backend:');
const kpisToTest = ['adRecall', 'brandAwareness', 'consideration', 'messageAssociation', 'unknown'];
kpisToTest.forEach(kpi => {
  const backendKpi = EnumTransformers.kpiToBackend(kpi);
  console.log(`${kpi} => ${backendKpi}`);
});

console.log('\nBackend to Frontend:');
const backendKpisToTest = mockTypes.KPI;
backendKpisToTest.forEach(kpi => {
  const frontendKpi = EnumTransformers.kpiFromBackend(kpi);
  console.log(`${kpi} => ${frontendKpi}`);
});

// Test Platform transformers
console.log('\n--- TESTING PLATFORM TRANSFORMERS ---');
console.log('Frontend to Backend:');
const platformsToTest = ['Instagram', 'YouTube', 'TikTok', 'Unknown'];
platformsToTest.forEach(platform => {
  const backendPlatform = EnumTransformers.platformToBackend(platform);
  console.log(`${platform} => ${backendPlatform}`);
});

console.log('\nBackend to Frontend:');
const backendPlatformsToTest = mockTypes.Platform;
backendPlatformsToTest.forEach(platform => {
  const frontendPlatform = EnumTransformers.platformFromBackend(platform);
  console.log(`${platform} => ${frontendPlatform}`);
});

// Test Currency transformers
console.log('\n--- TESTING CURRENCY TRANSFORMERS ---');
console.log('Frontend to Backend:');
const currenciesToTest = ['USD', 'GBP', 'EUR', 'unknown'];
currenciesToTest.forEach(currency => {
  const backendCurrency = EnumTransformers.currencyToBackend(currency);
  console.log(`${currency} => ${backendCurrency}`);
});

// Test recursive object transformation
console.log('\n--- TESTING RECURSIVE OBJECT TRANSFORMATION ---');
const testObject = {
  name: 'Test Campaign',
  primaryKPI: 'brandAwareness',
  secondaryKPIs: ['adRecall', 'consideration'],
  platform: 'Instagram',
  currency: 'USD',
  features: ['BRAND_LIFT', 'CREATIVE_ASSET_TESTING'],
  nestedObject: {
    primaryKPI: 'messageAssociation',
    platform: 'YouTube'
  },
  arrayOfObjects: [
    { kpi: 'adRecall', platform: 'TikTok' },
    { kpi: 'brandAwareness', platform: 'Instagram' }
  ]
};

console.log('Original Object:');
console.log(JSON.stringify(testObject, null, 2));

const transformedObject = EnumTransformers.transformObjectToBackend(testObject);
console.log('\nTransformed to Backend:');
console.log(JSON.stringify(transformedObject, null, 2));

const backToFrontend = EnumTransformers.transformObjectFromBackend(transformedObject);
console.log('\nTransformed Back to Frontend:');
console.log(JSON.stringify(backToFrontend, null, 2));

// Test formatEnumForDisplay utility
console.log('\n--- TESTING FORMAT ENUM FOR DISPLAY ---');
const displayTests = ['BRAND_AWARENESS', 'AD_RECALL', 'MIXED_MEDIA_MODELING', 'Regular Text'];
displayTests.forEach(value => {
  const displayValue = formatEnumForDisplay(value);
  console.log(`${value} => ${displayValue}`);
});

console.log('\n--- TEST COMPLETE ---');

// Add validation checks
console.log('\n--- VALIDATION CHECKS ---');

// Check round-trip consistency
const roundTripCheck = (original) => {
  const transformed = EnumTransformers.transformObjectToBackend(original);
  const roundTrip = EnumTransformers.transformObjectFromBackend(transformed);
  return JSON.stringify(original) === JSON.stringify(roundTrip);
};

console.log(`Round-trip test passed: ${roundTripCheck(testObject) ? 'YES' : 'NO'}`);

// Check that special keys are transformed
const transformCheck = (key, value, expectedTransformed) => {
  const obj = { [key]: value };
  const transformed = EnumTransformers.transformObjectToBackend(obj);
  return JSON.stringify(transformed[key]) === JSON.stringify(expectedTransformed);
};

console.log(`KPI transform check passed: ${
  transformCheck('primaryKPI', 'brandAwareness', 'BRAND_AWARENESS') ? 'YES' : 'NO'
}`);

console.log(`Platform transform check passed: ${
  transformCheck('platform', 'Instagram', 'INSTAGRAM') ? 'YES' : 'NO'
}`);

console.log(`Feature transform check passed: ${
  transformCheck('features', ['BRAND_LIFT'], ['BRAND_LIFT']) ? 'YES' : 'NO'
}`); 