/**
 * Documentation generation and management scripts
 * 
 * This index file exports all scripts in the documentation category
 * for easier importing and usage.
 */

import algoliaClient from './algolia-client.js';
import cleanupBackups from './cleanup-backups.js';
import copyDocFiles from './copy-doc-files.js';
import documentationUpdater from './documentation-updater.js';
import generateScriptsDocs from './generate-scripts-docs.js';
import implementDynamicImports from './implement-dynamic-imports.js';
import legacyDirectoryHandler from './legacy-directory-handler.js';
import schemaAudit from './schema-audit.js';
import standardImportsResolver from './standard-imports-resolver.js';
import updateProgress from './update-progress.js';

module.exports = {
  algoliaClient,
  cleanupBackups,
  copyDocFiles,
  documentationUpdater,
  generateScriptsDocs,
  implementDynamicImports,
  legacyDirectoryHandler,
  schemaAudit,
  standardImportsResolver,
  updateProgress,
};
