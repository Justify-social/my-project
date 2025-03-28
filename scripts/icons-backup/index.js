/**
 * Icon system management, verification, and migration scripts
 * 
 * This index file exports all scripts in the icons category
 * for easier importing and usage.
 */

import auditIcons from './audit-icons.js';
import backupIconFiles from './backup-icon-files.js';
import checkDebugIcons from './check-debug-icons.js';
import checkDeprecatedFiles from './check-deprecated-files.js';
import checkIconFormatting from './check-icon-formatting.js';
import cleanupTestRoutes from './cleanup-test-routes.js';
import consolidateIconTestFiles from './consolidate-icon-test-files.js';
import createEslintRules from './create-eslint-rules.js';
import downloadIcons from './download-icons.js';
import enhanceIconValidation from './enhance-icon-validation.js';
import fixFontConsistency from './fix-font-consistency.js';
import fixIconDataPath from './fix-icon-data-path.js';
import fixIconGroupClasses from './fix-icon-group-classes.js';
import fixIconIssues from './fix-icon-issues.js';
import fixIconSvgs from './fix-icon-svgs.js';
import fixTypescriptErrors from './fix-typescript-errors.js';
import generateIconData from './generate-icon-data.js';
import iconCircularDepFix from './icon-circular-dep-fix.js';
import iconEslintRules from './icon-eslint-rules.js';
import iconGridCircularDepFix from './icon-grid-circular-dep-fix.js';
import migrateComponents from './migrate-components.js';
import migratePaths from './migrate-paths.js';
import migrateToUi from './migrate-to-ui.js';
import missingImportsResolver from './missing-imports-resolver.js';
import moveIcons from './move-icons.js';
import removeDeprecatedFiles from './remove-deprecated-files.js';
import removeLegacyRedirections from './remove-legacy-redirections.js';
import runAllFixes from './run-all-fixes.js';
import standardizeIconTheming from './standardize-icon-theming.js';
import testIconStructure from './test-icon-structure.js';
import updateCoreImports from './update-core-imports.js';
import updateDownloadIcons from './update-download-icons.js';
import updateGenerateIconData from './update-generate-icon-data.js';
import updateIconImports from './update-icon-imports.js';
import updateIconPaths from './update-icon-paths.js';
import updateImportPaths from './update-import-paths.js';
import updateImports from './update-imports.js';
import updatePaths from './update-paths.js';
import updateStructure from './update-structure.js';
import verifyCore from './verify-core.js';
import verifyFontAwesomeFix from './verify-font-awesome-fix.js';
import verifyIconFix from './verify-icon-fix.js';
import verifyIcons from './verify-icons.js';
import verifyModules from './verify-modules.js';

module.exports = {
  auditIcons,
  backupIconFiles,
  checkDebugIcons,
  checkDeprecatedFiles,
  checkIconFormatting,
  cleanupTestRoutes,
  consolidateIconTestFiles,
  createEslintRules,
  downloadIcons,
  enhanceIconValidation,
  fixFontConsistency,
  fixIconDataPath,
  fixIconGroupClasses,
  fixIconIssues,
  fixIconSvgs,
  fixTypescriptErrors,
  generateIconData,
  iconCircularDepFix,
  iconEslintRules,
  iconGridCircularDepFix,
  migrateComponents,
  migratePaths,
  migrateToUi,
  missingImportsResolver,
  moveIcons,
  removeDeprecatedFiles,
  removeLegacyRedirections,
  runAllFixes,
  standardizeIconTheming,
  testIconStructure,
  updateCoreImports,
  updateDownloadIcons,
  updateGenerateIconData,
  updateIconImports,
  updateIconPaths,
  updateImportPaths,
  updateImports,
  updatePaths,
  updateStructure,
  verifyCore,
  verifyFontAwesomeFix,
  verifyIconFix,
  verifyIcons,
  verifyModules,
};
