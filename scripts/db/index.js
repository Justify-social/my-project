/**
 * Database operations and migration scripts
 * 
 * This index file exports all scripts in the db category
 * for easier importing and usage.
 */

import featureComponentMigration from './feature-component-migration.js';
import migrateCard from './migrate-card.js';
import migrateLayouts from './migrate-layouts.js';
import migrateLegacyFeatureComponents from './migrate-legacy-feature-components.js';
import migrateNavigation from './migrate-navigation.js';
import migrateStandaloneComponents from './migrate-standalone-components.js';
import migrateTable from './migrate-table.js';
import migrateTabs from './migrate-tabs.js';
import migrateUiComponent from './migrate-ui-component.js';
import setAdmin from './set-admin.js';
import updateImportsCampaigns from './update-imports-campaigns.js';
import updateImportsSettings from './update-imports-settings.js';

module.exports = {
  featureComponentMigration,
  migrateCard,
  migrateLayouts,
  migrateLegacyFeatureComponents,
  migrateNavigation,
  migrateStandaloneComponents,
  migrateTable,
  migrateTabs,
  migrateUiComponent,
  setAdmin,
  updateImportsCampaigns,
  updateImportsSettings,
};
