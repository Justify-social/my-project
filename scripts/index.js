/**
 * Script Index
 * 
 * This file serves as an entry point for accessing all scripts in the project.
 * Scripts are organized by category for easier access and management.
 */

// Icon Management Scripts
const iconManagement = {
  auditIcons: require('./icon-management/audit-icons'),
  checkDebugIcons: require('./icon-management/check-debug-icons'),
  checkIconFormatting: require('./icon-management/check-icon-formatting'),
  downloadIcons: require('./icon-management/download-icons'),
  enhanceIconValidation: require('./icon-management/enhance-icon-validation'),
  fixFontConsistency: require('./icon-management/fix-font-consistency'),
  fixIconGroupClasses: require('./icon-management/fix-icon-group-classes'),
  fixIconIssues: require('./icon-management/fix-icon-issues'),
  fixIconSvgs: require('./icon-management/fix-icon-svgs'),
  generateIconData: require('./icon-management/generate-icon-data'),
  standardizeIconTheming: require('./icon-management/standardize-icon-theming'),
  verifyIcons: require('./icon-management/verify-icons')
};

// Database Scripts
const database = {
  setAdmin: require('./database/set-admin'),
  checkDb: require('./database/check-db'),
  validateDatabase: './database/validate-database.ts', // TS file, require at runtime
  testDatabaseOperations: require('./database/test-database-operations')
};

// Campaign Scripts
const campaign = {
  indexCampaigns: require('./campaign/index-campaigns'),
  indexCampaignsTs: './campaign/index-campaigns.ts', // TS file, require at runtime
  indexSampleCampaigns: './campaign/index-sample-campaigns.ts', // TS file, require at runtime
  testCampaignCreation: require('./campaign/test-campaign-creation'),
  testCampaignSubmission: require('./campaign/test-campaign-submission'),
  createCampaign: require('./campaign/createCampaign'),
  testCampaign: require('./campaign/testCampaign')
};

// Testing Scripts
const testing = {
  testAlgoliaSearch: require('./testing/test-algolia-search'),
  measureBundleSize: require('./testing/measure-bundle-size'),
  testApiEndpoints: require('./testing/test-api-endpoints'),
  testTransactionManager: require('./testing/test-transaction-manager'),
  testAuth: './testing/test-auth.ts', // TS file, require at runtime
  testDiscovery: './testing/test-discovery.ts' // TS file, require at runtime
};

// Validation Scripts
const validation = {
  fixTypescriptErrors: require('./validation/fix-typescript-errors'),
  findAnyTypes: require('./validation/find-any-types'),
  findHookIssues: require('./validation/find-hook-issues'),
  findImgTags: require('./validation/find-img-tags'),
  fixAnyTypes: require('./validation/fix-any-types'),
  fixImgTags: require('./validation/fix-img-tags'),
  fixLinterIssues: require('./validation/fix-linter-issues'),
  schemaAudit: require('./validation/schema-audit'),
  verifyIconFix: require('./validation/verify-icon-fix'),
  updateIconImports: require('./validation/update-icon-imports'),
  verifyFontAwesomeFix: require('./validation/verify-font-awesome-fix'),
  validateBuild: require('./validation/validate-build')
};

// Utility Scripts
const utilities = {
  algoliaClient: require('./utilities/algolia-client'),
  copyDocFiles: require('./utilities/copy-doc-files'),
  createTestData: require('./utilities/create-test-data'),
  seedCampaign: './utilities/seed-campaign.ts' // TS file, require at runtime
};

module.exports = {
  iconManagement,
  database,
  campaign,
  testing,
  validation,
  utilities
};

/**
 * Usage examples:
 * 
 * // Import the entire index
 * const scripts = require('./scripts');
 * scripts.iconManagement.auditIcons();
 * 
 * // Import a specific category
 * const { database } = require('./scripts');
 * database.setAdmin();
 * 
 * // Import a specific script
 * const auditIcons = require('./scripts').iconManagement.auditIcons;
 * auditIcons();
 */ 