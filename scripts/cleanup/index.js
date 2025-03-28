/**
 * Cleanup and maintenance scripts
 * 
 * This index file exports all scripts in the cleanup category
 * for easier importing and usage.
 */

import consolidateScripts from './consolidate-scripts.js';
import debugToolsUnification from './debug-tools-unification.js';
import deprecationWarnings from './deprecation-warnings.js';
import examplesCircularDepFix from './examples-circular-dep-fix.js';
import findBackups from './find-backups.js';
import importPathUpdater from './import-path-updater.js';
import indexCampaigns from './index-campaigns.js';
import removeBackups from './remove-backups.js';
import strayUtilitiesConsolidation from './stray-utilities-consolidation.js';

module.exports = {
  consolidateScripts,
  debugToolsUnification,
  deprecationWarnings,
  examplesCircularDepFix,
  findBackups,
  importPathUpdater,
  indexCampaigns,
  removeBackups,
  strayUtilitiesConsolidation,
};
