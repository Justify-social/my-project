#!/bin/bash

# Bulk Lint Fix Execution Script
# Generated on: 2025-03-27T13:02:20.275Z
#
# This script will attempt to fix multiple lint issues in sequence.
# It will pause between operations to allow inspection of changes.
#
# Usage:
#   bash ./bulk-fix.sh

set -e
YELLOW="\033[1;33m"
GREEN="\033[1;32m"
RED="\033[1;31m"
BLUE="\033[1;34m"
RESET="\033[0m"

echo -e "${BLUE}Bulk Lint Fixing Script${RESET}"
echo "Starting sequential fixes..."
echo

# 1. Fix CommonJS require() Imports
echo -e "${YELLOW}\n===== FIXING: Fix CommonJS require() Imports =====${RESET}"
echo "A `require()` style import is forbidden."
echo "Fixing 575 occurrences across 159 files..."
echo -e "${BLUE}Use the lint-fixer.js script to automatically convert require() imports:${RESET}"

echo "$ node scripts/consolidated/linting/lint-fixer.js --file .eslintrc.js"
node scripts/consolidated/linting/lint-fixer.js --file .eslintrc.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file config/cypress/cypress.config.js"
node scripts/consolidated/linting/lint-fixer.js --file config/cypress/cypress.config.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file config/eslint/eslintrc.js"
node scripts/consolidated/linting/lint-fixer.js --file config/eslint/eslintrc.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file config/jest/jest.config.js"
node scripts/consolidated/linting/lint-fixer.js --file config/jest/jest.config.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file config/jest/jest.setup.js"
node scripts/consolidated/linting/lint-fixer.js --file config/jest/jest.setup.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file config/next/next.config.js"
node scripts/consolidated/linting/lint-fixer.js --file config/next/next.config.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file config/postcss/postcss.config.mjs"
node scripts/consolidated/linting/lint-fixer.js --file config/postcss/postcss.config.mjs
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file config/tailwind/tailwind.config.js"
node scripts/consolidated/linting/lint-fixer.js --file config/tailwind/tailwind.config.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file config/tailwind/tailwind.config.ts"
node scripts/consolidated/linting/lint-fixer.js --file config/tailwind/tailwind.config.ts
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file cypress.config.js"
node scripts/consolidated/linting/lint-fixer.js --file cypress.config.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file cypress/fixtures/create-test-image.js"
node scripts/consolidated/linting/lint-fixer.js --file cypress/fixtures/create-test-image.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file jest.config.js"
node scripts/consolidated/linting/lint-fixer.js --file jest.config.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file jest.setup.js"
node scripts/consolidated/linting/lint-fixer.js --file jest.setup.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file next.config.js"
node scripts/consolidated/linting/lint-fixer.js --file next.config.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file postcss.config.mjs"
node scripts/consolidated/linting/lint-fixer.js --file postcss.config.mjs
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/check-script-imports.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/check-script-imports.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/cleanup-deprecated-scripts.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/cleanup-deprecated-scripts.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/cleanup-final.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/cleanup-final.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/consolidate-scripts.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/consolidate-scripts.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/debug-tools-unification.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/debug-tools-unification.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/examples-circular-dep-fix.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/examples-circular-dep-fix.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/import-path-updater.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/import-path-updater.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/index-campaigns.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/index-campaigns.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/index.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/index.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/remove-backups.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/remove-backups.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/stray-utilities-consolidation.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/stray-utilities-consolidation.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/tracking-summary.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/cleanup/tracking-summary.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/consolidate-scripts.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/consolidate-scripts.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/create-indexes.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/create-indexes.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/feature-component-migration.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/feature-component-migration.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/index.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/index.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-card.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-card.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-layouts.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-layouts.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-legacy-feature-components.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-legacy-feature-components.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-navigation.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-navigation.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-standalone-components.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-standalone-components.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-table.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-table.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-tabs.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-tabs.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-ui-component.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/migrate-ui-component.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/set-admin.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/set-admin.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/update-imports-campaigns.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/update-imports-campaigns.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/update-imports-settings.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/db/update-imports-settings.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/algolia-client.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/algolia-client.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/cleanup-backups.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/cleanup-backups.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/copy-doc-files.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/copy-doc-files.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/documentation-updater.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/documentation-updater.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/generate-scripts-docs.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/generate-scripts-docs.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/implement-dynamic-imports.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/implement-dynamic-imports.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/index.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/index.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/legacy-directory-handler.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/legacy-directory-handler.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/schema-audit.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/schema-audit.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/standard-imports-resolver.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/standard-imports-resolver.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/update-progress.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/documentation/update-progress.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/audit-icons.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/audit-icons.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/backup-icon-files.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/backup-icon-files.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/check-debug-icons.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/check-debug-icons.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/check-deprecated-files.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/check-deprecated-files.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/check-icon-formatting.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/check-icon-formatting.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/cleanup-test-routes.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/cleanup-test-routes.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/consolidate-icon-test-files.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/consolidate-icon-test-files.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/create-eslint-rules.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/create-eslint-rules.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/download-icons.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/download-icons.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/enhance-icon-validation.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/enhance-icon-validation.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-font-consistency.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-font-consistency.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-icon-data-path.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-icon-data-path.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-icon-group-classes.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-icon-group-classes.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-icon-issues.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-icon-issues.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-icon-svgs.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-icon-svgs.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-typescript-errors.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/fix-typescript-errors.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/generate-icon-data.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/generate-icon-data.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/icon-circular-dep-fix.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/icon-circular-dep-fix.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/icon-grid-circular-dep-fix.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/icon-grid-circular-dep-fix.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/index.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/index.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/migrate-components.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/migrate-components.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/migrate-paths.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/migrate-paths.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/migrate-to-ui.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/migrate-to-ui.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/missing-imports-resolver.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/missing-imports-resolver.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/move-icons.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/move-icons.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/remove-deprecated-files.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/remove-deprecated-files.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/remove-legacy-redirections.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/remove-legacy-redirections.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/run-all-fixes.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/run-all-fixes.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/standardize-icon-theming.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/standardize-icon-theming.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/test-icon-structure.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/test-icon-structure.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-core-imports.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-core-imports.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-download-icons.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-download-icons.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-generate-icon-data.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-generate-icon-data.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-icon-imports.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-icon-imports.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-icon-paths.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-icon-paths.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-import-paths.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-import-paths.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-imports.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-imports.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-paths.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-paths.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-structure.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/update-structure.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/verify-core.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/verify-core.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/verify-icon-fix.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/verify-icon-fix.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/verify-icons.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/verify-icons.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/verify-modules.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/icons/verify-modules.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/implement-consolidation.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/implement-consolidation.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/index.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/index.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/bulk-fix-planner.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/bulk-fix-planner.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/check-db.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/check-db.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/component-dependency-analyzer.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/component-dependency-analyzer.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/find-any-types.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/find-any-types.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/find-hook-issues.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/find-hook-issues.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/find-img-tags.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/find-img-tags.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/fix-any-types.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/fix-any-types.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/fix-img-tags.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/fix-img-tags.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/generate-scripts-docs.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/generate-scripts-docs.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/index.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/index.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/lint-error-prioritizer.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/lint-error-prioritizer.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/lint-fixer.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/linting/lint-fixer.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/remove-original-scripts.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/remove-original-scripts.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/reorganize-utils.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/reorganize-utils.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/app-directory-migration.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/app-directory-migration.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/centralize-config.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/centralize-config.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/consolidate-test-scripts.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/consolidate-test-scripts.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/create-campaign.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/create-campaign.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/create-test-data.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/create-test-data.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/feature-component-identification.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/feature-component-identification.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/final-unification.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/final-unification.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/final-verification.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/final-verification.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/find-any-types.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/find-any-types.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/find-hook-issues.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/find-hook-issues.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/find-img-tags.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/find-img-tags.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/find-missing-readmes.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/find-missing-readmes.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/fix-any-types.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/fix-any-types.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/fix-img-tags.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/fix-img-tags.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/fix-linter-issues.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/fix-linter-issues.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/implement-dev-experience.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/implement-dev-experience.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/index.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/index.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/measure-bundle-size.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/measure-bundle-size.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/migrate-datepicker.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/migrate-datepicker.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/migrate-pagination.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/migrate-pagination.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/migrate-tests.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/migrate-tests.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/rename-files.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/rename-files.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/test-algolia-search.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/test-algolia-search.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/test-api-endpoints.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/test-api-endpoints.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/test-campaign-submission.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/test-campaign-submission.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/test-campaign.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/test-campaign.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/update-imports-dashboard.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/update-imports-dashboard.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/update-imports-users.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/update-imports-users.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/update-references.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/update-references.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/validate-build.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/validate-build.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/verify-imports.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/testing/verify-imports.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/update-script-references.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/update-script-references.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/utils/final-verification-report.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/utils/final-verification-report.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/utils/index.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/utils/index.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/utils/verify-no-backups.js"
node scripts/consolidated/linting/lint-fixer.js --file scripts/consolidated/utils/verify-no-backups.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/components/features/settings/branding/branding-page-test.tsx"
node scripts/consolidated/linting/lint-fixer.js --file src/components/features/settings/branding/branding-page-test.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/components/features/settings/team/team-management-page-test.tsx"
node scripts/consolidated/linting/lint-fixer.js --file src/components/features/settings/team/team-management-page-test.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/components/features/users/profile/profile-settings-page-test.tsx"
node scripts/consolidated/linting/lint-fixer.js --file src/components/features/users/profile/profile-settings-page-test.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/utils/enum-transformers.test.ts"
node scripts/consolidated/linting/lint-fixer.js --file src/utils/enum-transformers.test.ts
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/utils/schema-validator.ts"
node scripts/consolidated/linting/lint-fixer.js --file src/utils/schema-validator.ts
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file tailwind.config.js"
node scripts/consolidated/linting/lint-fixer.js --file tailwind.config.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file tailwind.config.ts"
node scripts/consolidated/linting/lint-fixer.js --file tailwind.config.ts
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file test-npm-only.js"
node scripts/consolidated/linting/lint-fixer.js --file test-npm-only.js
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file tests/integration/branding-page-test.tsx"
node scripts/consolidated/linting/lint-fixer.js --file tests/integration/branding-page-test.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file tests/integration/profile-settings-page-test.tsx"
node scripts/consolidated/linting/lint-fixer.js --file tests/integration/profile-settings-page-test.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file tests/integration/team-management-page-test.tsx"
node scripts/consolidated/linting/lint-fixer.js --file tests/integration/team-management-page-test.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file tests/migration.js"
node scripts/consolidated/linting/lint-fixer.js --file tests/migration.js
echo
echo -e "${GREEN}Completed: Fix CommonJS require() Imports${RESET}"
echo

# 2. Fix Unused Variables
echo -e "${YELLOW}\n===== FIXING: Fix Unused Variables =====${RESET}"
echo "'AnimatePresence' is defined but never used. Allowed unused vars must match /^_/u."
echo "Fixing 744 occurrences across 238 files..."
echo -e "${BLUE}Use eslint --fix to automatically prefix unused variables:${RESET}"

echo "$ npx eslint --config eslint.config.mjs --fix backup-content/progress/page.tsx"
npx eslint --config eslint.config.mjs --fix backup-content/progress/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix backup-content/survey-approval/page.tsx"
npx eslint --config eslint.config.mjs --fix backup-content/survey-approval/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix backup-content/survey-preview/page.tsx"
npx eslint --config eslint.config.mjs --fix backup-content/survey-preview/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix BUILD/settings/backup/branding/page.tsx"
npx eslint --config eslint.config.mjs --fix BUILD/settings/backup/branding/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix BUILD/settings/backup/components/NavigationTabs.tsx"
npx eslint --config eslint.config.mjs --fix BUILD/settings/backup/components/NavigationTabs.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix BUILD/settings/backup/page.tsx"
npx eslint --config eslint.config.mjs --fix BUILD/settings/backup/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix BUILD/settings/backup/team-management/page.tsx"
npx eslint --config eslint.config.mjs --fix BUILD/settings/backup/team-management/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix middleware.ts"
npx eslint --config eslint.config.mjs --fix middleware.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/check-script-imports.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/check-script-imports.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/cleanup-deprecated-scripts.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/cleanup-deprecated-scripts.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/cleanup-final.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/cleanup-final.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/consolidate-scripts.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/consolidate-scripts.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/debug-tools-unification.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/debug-tools-unification.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/examples-circular-dep-fix.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/examples-circular-dep-fix.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/import-path-updater.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/import-path-updater.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/remove-backups.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/remove-backups.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/stray-utilities-consolidation.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/cleanup/stray-utilities-consolidation.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/consolidate-scripts.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/consolidate-scripts.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/db/feature-component-migration.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/db/feature-component-migration.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/db/migrate-ui-component.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/db/migrate-ui-component.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/cleanup-backups.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/cleanup-backups.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/documentation-updater.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/documentation-updater.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/generate-scripts-docs.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/generate-scripts-docs.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/implement-dynamic-imports.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/implement-dynamic-imports.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/legacy-directory-handler.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/documentation/legacy-directory-handler.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/audit-icons.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/audit-icons.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/backup-icon-files.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/backup-icon-files.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/check-debug-icons.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/check-debug-icons.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/check-deprecated-files.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/check-deprecated-files.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/check-icon-formatting.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/check-icon-formatting.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/consolidate-icon-test-files.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/consolidate-icon-test-files.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/create-eslint-rules.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/create-eslint-rules.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/download-icons.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/download-icons.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/enhance-icon-validation.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/enhance-icon-validation.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-font-consistency.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-font-consistency.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-icon-group-classes.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-icon-group-classes.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-icon-issues.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-icon-issues.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-icon-svgs.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-icon-svgs.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-typescript-errors.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/fix-typescript-errors.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/icon-circular-dep-fix.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/icon-circular-dep-fix.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/icon-grid-circular-dep-fix.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/icon-grid-circular-dep-fix.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/migrate-components.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/migrate-components.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/migrate-paths.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/migrate-paths.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/migrate-to-ui.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/migrate-to-ui.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/missing-imports-resolver.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/missing-imports-resolver.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/move-icons.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/move-icons.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/standardize-icon-theming.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/standardize-icon-theming.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/test-icon-structure.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/test-icon-structure.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-core-imports.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-core-imports.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-icon-imports.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-icon-imports.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-icon-paths.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-icon-paths.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-import-paths.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-import-paths.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-imports.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-imports.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-paths.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-paths.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-structure.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/update-structure.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/verify-icon-fix.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/verify-icon-fix.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/verify-icons.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/icons/verify-icons.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/implement-consolidation.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/implement-consolidation.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/bulk-fix-planner.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/bulk-fix-planner.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/component-dependency-analyzer.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/component-dependency-analyzer.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/fix-any-types.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/fix-any-types.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/generate-scripts-docs.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/generate-scripts-docs.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/lint-fixer.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/linting/lint-fixer.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/remove-original-scripts.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/remove-original-scripts.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/app-directory-migration.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/app-directory-migration.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/centralize-config.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/centralize-config.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/create-campaign.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/create-campaign.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/feature-component-identification.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/feature-component-identification.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/final-verification.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/final-verification.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/fix-any-types.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/fix-any-types.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/measure-bundle-size.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/measure-bundle-size.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/migrate-datepicker.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/migrate-datepicker.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/migrate-pagination.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/migrate-pagination.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/test-api-endpoints.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/test-api-endpoints.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/test-campaign-submission.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/test-campaign-submission.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/test-database-operations.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/test-database-operations.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/update-references.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/update-references.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/verify-imports.js"
npx eslint --config eslint.config.mjs --fix scripts/consolidated/testing/verify-imports.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/__tests__/settings/shared/settings-page-skeleton-test.tsx"
npx eslint --config eslint.config.mjs --fix src/__tests__/settings/shared/settings-page-skeleton-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(admin)/admin/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(admin)/admin/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/api-verification/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/api-verification/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/api/validate-campaign/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/api/validate-campaign/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/font-awesome-fixes/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/font-awesome-fixes/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/test-kpi-icons/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(admin)/debug-tools/test-kpi-icons/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/[id]/backup/page.original.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/[id]/backup/page.original.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/[id]/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/[id]/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/loading.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/loading.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/ServerCampaigns.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/ServerCampaigns.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/wizard/step-1/FormContent.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/wizard/step-1/FormContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/wizard/step-2/FormContent.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/wizard/step-2/FormContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/wizard/step-3/FormContent.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/campaigns/wizard/step-3/FormContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/[id]/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/[id]/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/create/content/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/create/content/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/create/influencers/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/create/influencers/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/create/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/create/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/create/review/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/create/review/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/campaigns/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(campaigns)/influencer-marketplace/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(dashboard)/dashboard/DashboardContent.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(dashboard)/dashboard/DashboardContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(dashboard)/help/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(dashboard)/help/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(settings)/pricing/layout.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(settings)/pricing/layout.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/(settings)/pricing/PricingContent.tsx"
npx eslint --config eslint.config.mjs --fix src/app/(settings)/pricing/PricingContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/admin/users/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/admin/users/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/asset-proxy/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/asset-proxy/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/auth/callback/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/auth/callback/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/campaigns/[id]/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/campaigns/[id]/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/campaigns/[id]/steps/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/campaigns/[id]/steps/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/campaigns/[id]/wizard/[step]/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/campaigns/[id]/wizard/[step]/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/campaigns/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/campaigns/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/docs/[filename]/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/docs/[filename]/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/health/db/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/health/db/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/icons/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/icons/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/influencers/marketplace/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/influencers/marketplace/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/settings/branding/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/settings/branding/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/settings/password/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/settings/password/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/settings/team/invitation/[id]/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/settings/team/invitation/[id]/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/settings/team/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/settings/team/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/settings/team/setup/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/settings/team/setup/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/stripe/create-checkout-session/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/stripe/create-checkout-session/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/test-models/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/test-models/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/test/transaction/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/test/transaction/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/uploadthing/core.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/uploadthing/core.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/user/set-onboarding-true/route.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/user/set-onboarding-true/route.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/api/wizard/campaign.ts"
npx eslint --config eslint.config.mjs --fix src/app/api/wizard/campaign.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/error.tsx"
npx eslint --config eslint.config.mjs --fix src/app/error.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/global-error.tsx"
npx eslint --config eslint.config.mjs --fix src/app/global-error.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/layout.tsx"
npx eslint --config eslint.config.mjs --fix src/app/layout.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/app/page.tsx"
npx eslint --config eslint.config.mjs --fix src/app/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/analytics/mmm/SankeyDiagram.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/analytics/mmm/SankeyDiagram.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/assets/upload/CampaignAssetUploader.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/assets/upload/CampaignAssetUploader.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/assets/upload/EnhancedAssetPreview.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/assets/upload/EnhancedAssetPreview.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/influencers/index.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/influencers/index.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/FormExample.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/FormExample.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step1Content.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step1Content.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step2Content.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step2Content.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step3Content.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step3Content.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step4Content.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step4Content.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step5Content.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/campaigns/wizard/steps/Step5Content.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/core/loading/index.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/core/loading/index.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/core/loading/skeleton.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/core/loading/skeleton.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/core/search/SearchResults.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/core/search/SearchResults.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/dashboard/notifications/NotificationPreferencesSection.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/dashboard/notifications/NotificationPreferencesSection.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/navigation/Header.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/navigation/Header.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/navigation/MobileMenu.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/navigation/MobileMenu.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/navigation/Sidebar.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/navigation/Sidebar.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/account/page.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/account/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/branding-page-test.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/branding-page-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/branding-skeleton-test.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/branding-skeleton-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/BrandLiftCharts.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/BrandLiftCharts.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/BrandLiftProgressContent.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/BrandLiftProgressContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/BrandLiftReportContent.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/BrandLiftReportContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/CreativePreview.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/CreativePreview.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/FileUpload.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/FileUpload.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/FontSelector.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/FontSelector.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/page.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/PlatformSwitcher.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/PlatformSwitcher.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SelectedCampaignContent.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SelectedCampaignContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SurveyApprovalContent.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SurveyApprovalContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SurveyDesignContent.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SurveyDesignContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SurveyOptionCard.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SurveyOptionCard.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SurveyPreviewContent.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/branding/SurveyPreviewContent.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/AddMemberModal.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/AddMemberModal.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/DeleteConfirmationModal.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/DeleteConfirmationModal.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/MembersList.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/MembersList.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/team-management-skeleton-test.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/team-management-skeleton-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/TeamManagementDebug.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/settings/team/TeamManagementDebug.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/page.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/page.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/PersonalInfoSection.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/PersonalInfoSection.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/profile-settings-page-test.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/profile-settings-page-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/profile-settings-skeleton-test.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/profile-settings-skeleton-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/ProfilePictureSection.tsx"
npx eslint --config eslint.config.mjs --fix src/components/features/users/profile/ProfilePictureSection.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/Influencers/AdvancedSearch/index.tsx"
npx eslint --config eslint.config.mjs --fix src/components/Influencers/AdvancedSearch/index.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/Influencers/InfluencerCard.tsx"
npx eslint --config eslint.config.mjs --fix src/components/Influencers/InfluencerCard.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/Influencers/MarketplaceList/index.tsx"
npx eslint --config eslint.config.mjs --fix src/components/Influencers/MarketplaceList/index.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/mmm/CustomerJourney/SankeyDiagram.tsx"
npx eslint --config eslint.config.mjs --fix src/components/mmm/CustomerJourney/SankeyDiagram.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/Navigation/Header.tsx"
npx eslint --config eslint.config.mjs --fix src/components/Navigation/Header.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/Navigation/MobileMenu.tsx"
npx eslint --config eslint.config.mjs --fix src/components/Navigation/MobileMenu.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/Navigation/Sidebar.tsx"
npx eslint --config eslint.config.mjs --fix src/components/Navigation/Sidebar.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/Search/SearchResults.tsx"
npx eslint --config eslint.config.mjs --fix src/components/Search/SearchResults.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/asset-card/asset-preview.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/asset-card/asset-preview.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/calendar.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/calendar.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/calendar/calendar-dashboard.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/calendar/calendar-dashboard.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/card.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/card.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/cards/upcoming-campaigns-card.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/cards/upcoming-campaigns-card.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/date-picker/DatePicker.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/date-picker/DatePicker.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/date-picker/styles/date-picker.styles.ts"
npx eslint --config eslint.config.mjs --fix src/components/ui/date-picker/styles/date-picker.styles.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/forms/form-controls.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/forms/form-controls.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/icons/core/SvgIcon.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/icons/core/SvgIcon.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/icons/examples/IconGrid.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/icons/examples/IconGrid.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/icons/test/icon-tester-backup.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/icons/test/icon-tester-backup.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/icons/test/IconTester.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/icons/test/IconTester.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/layout/Card.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/layout/Card.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/layout/Table.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/layout/Table.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/loading-skeleton-examples.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/loading-skeleton-examples.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/loading-skeleton/index.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/loading-skeleton/index.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/loading-skeleton/skeleton.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/loading-skeleton/skeleton.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/navigation/Tabs.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/navigation/Tabs.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/pagination/types/index.ts"
npx eslint --config eslint.config.mjs --fix src/components/ui/pagination/types/index.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/skeleton.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/skeleton.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/spinner-examples.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/spinner-examples.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/spinner/index.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/spinner/index.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/table.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/table.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/table/Table.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/table/Table.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/tabs.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/tabs.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/ui/tabs/Tabs.tsx"
npx eslint --config eslint.config.mjs --fix src/components/ui/tabs/Tabs.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/upload/CampaignAssetUploader.tsx"
npx eslint --config eslint.config.mjs --fix src/components/upload/CampaignAssetUploader.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/upload/EnhancedAssetPreview.tsx"
npx eslint --config eslint.config.mjs --fix src/components/upload/EnhancedAssetPreview.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/components/Wizard/examples/FormExample.tsx"
npx eslint --config eslint.config.mjs --fix src/components/Wizard/examples/FormExample.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/hooks/use-campaign-details.ts"
npx eslint --config eslint.config.mjs --fix src/hooks/use-campaign-details.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/lib/algolia.ts"
npx eslint --config eslint.config.mjs --fix src/lib/algolia.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/lib/api-verification.ts"
npx eslint --config eslint.config.mjs --fix src/lib/api-verification.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/lib/data-mapping/campaign-service.ts"
npx eslint --config eslint.config.mjs --fix src/lib/data-mapping/campaign-service.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/lib/data-mapping/db-logger.ts"
npx eslint --config eslint.config.mjs --fix src/lib/data-mapping/db-logger.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/lib/data-mapping/schema-mapping.ts"
npx eslint --config eslint.config.mjs --fix src/lib/data-mapping/schema-mapping.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/lib/data-mapping/validation.ts"
npx eslint --config eslint.config.mjs --fix src/lib/data-mapping/validation.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/lib/icon-diagnostic.ts"
npx eslint --config eslint.config.mjs --fix src/lib/icon-diagnostic.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/lib/icon-loader.ts"
npx eslint --config eslint.config.mjs --fix src/lib/icon-loader.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/lib/uploadthing.ts"
npx eslint --config eslint.config.mjs --fix src/lib/uploadthing.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/middleware/api/validate-api.ts"
npx eslint --config eslint.config.mjs --fix src/middleware/api/validate-api.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/middleware/validate-request.ts"
npx eslint --config eslint.config.mjs --fix src/middleware/validate-request.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/services/asset-service.ts"
npx eslint --config eslint.config.mjs --fix src/services/asset-service.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/services/brand-lift-service.ts"
npx eslint --config eslint.config.mjs --fix src/services/brand-lift-service.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/services/campaign-service.ts"
npx eslint --config eslint.config.mjs --fix src/services/campaign-service.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/utils/api-response-formatter.ts"
npx eslint --config eslint.config.mjs --fix src/utils/api-response-formatter.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/utils/date-service.ts"
npx eslint --config eslint.config.mjs --fix src/utils/date-service.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/utils/db-monitoring.ts"
npx eslint --config eslint.config.mjs --fix src/utils/db-monitoring.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/utils/form-adapters.ts"
npx eslint --config eslint.config.mjs --fix src/utils/form-adapters.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix src/utils/schema-validator.ts"
npx eslint --config eslint.config.mjs --fix src/utils/schema-validator.ts
echo
echo "$ npx eslint --config eslint.config.mjs --fix tests/integration/branding-page-test.tsx"
npx eslint --config eslint.config.mjs --fix tests/integration/branding-page-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix tests/integration/profile-settings-page-test.tsx"
npx eslint --config eslint.config.mjs --fix tests/integration/profile-settings-page-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix tests/migration.js"
npx eslint --config eslint.config.mjs --fix tests/migration.js
echo
echo "$ npx eslint --config eslint.config.mjs --fix tests/settings/branding/branding-skeleton-test.tsx"
npx eslint --config eslint.config.mjs --fix tests/settings/branding/branding-skeleton-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix tests/settings/profile/profile-settings-skeleton-test.tsx"
npx eslint --config eslint.config.mjs --fix tests/settings/profile/profile-settings-skeleton-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix tests/settings/shared/settings-page-skeleton-test.tsx"
npx eslint --config eslint.config.mjs --fix tests/settings/shared/settings-page-skeleton-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix tests/settings/team-management/team-management-skeleton-test.tsx"
npx eslint --config eslint.config.mjs --fix tests/settings/team-management/team-management-skeleton-test.tsx
echo
echo "$ npx eslint --config eslint.config.mjs --fix tests/unit/src/__tests__/settings/shared/settings-page-skeleton-test.tsx"
npx eslint --config eslint.config.mjs --fix tests/unit/src/__tests__/settings/shared/settings-page-skeleton-test.tsx
echo
echo -e "${GREEN}Completed: Fix Unused Variables${RESET}"
echo

# 3. Fix @typescript-eslint/no-unused-expressions Violations
echo -e "${YELLOW}\n===== FIXING: Fix @typescript-eslint/no-unused-expressions Violations =====${RESET}"
echo "Expected an assignment or function call and instead saw an expression."
echo "Fixing 10 occurrences across 10 files..."
echo -e "${BLUE}Manual fix required. Review each occurrence and fix according to the rule:${RESET}"

echo -e "${RED}MANUAL FIX REQUIRED${RESET}"
echo "# Manual inspection and fixes required for 10 files"
echo -e "\nFiles to fix:"
echo "- cypress/e2e/layout/branding.cy.js"
echo "- cypress/e2e/layout/no-hydration-error-cy.js"
echo "- src/app/(admin)/admin/page.tsx"
echo "- src/app/(auth)/subscribe/page.tsx"
echo "- src/app/(campaigns)/campaigns/page.tsx"
echo "- ... and more files (5 additional)"

# Pausing for manual fixes
read -p "Press Enter when manual fixes are complete (or Ctrl+C to abort)..."
echo -e "${GREEN}Completed: Fix @typescript-eslint/no-unused-expressions Violations${RESET}"
echo

# 4. Fix Undefined Component References
echo -e "${YELLOW}\n===== FIXING: Fix Undefined Component References =====${RESET}"
echo "'LoadingSpinner' is not defined."
echo "Fixing 6 occurrences across 6 files..."
echo -e "${BLUE}Use the lint-fixer.js script with --file option to automatically add imports:${RESET}"

echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/app/(campaigns)/campaigns/ServerCampaigns.tsx"
node scripts/consolidated/linting/lint-fixer.js --file src/app/(campaigns)/campaigns/ServerCampaigns.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/app/(campaigns)/influencer-marketplace/[id]/page.tsx"
node scripts/consolidated/linting/lint-fixer.js --file src/app/(campaigns)/influencer-marketplace/[id]/page.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/app/(campaigns)/influencer-marketplace/campaigns/page.tsx"
node scripts/consolidated/linting/lint-fixer.js --file src/app/(campaigns)/influencer-marketplace/campaigns/page.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/components/features/campaigns/influencers/index.tsx"
node scripts/consolidated/linting/lint-fixer.js --file src/components/features/campaigns/influencers/index.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/components/features/settings/team/MembersList.tsx"
node scripts/consolidated/linting/lint-fixer.js --file src/components/features/settings/team/MembersList.tsx
echo
echo "$ node scripts/consolidated/linting/lint-fixer.js --file src/components/Influencers/MarketplaceList/index.tsx"
node scripts/consolidated/linting/lint-fixer.js --file src/components/Influencers/MarketplaceList/index.tsx
echo
echo -e "${GREEN}Completed: Fix Undefined Component References${RESET}"
echo

# 5. Fix React Hooks Rules Violations
echo -e "${YELLOW}\n===== FIXING: Fix React Hooks Rules Violations =====${RESET}"
echo "React Hook "useState" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function."
echo "Fixing 5 occurrences across 3 files..."
echo -e "${BLUE}These errors require manual fixing. Look for conditional hook calls and refactor:${RESET}"

echo -e "${RED}MANUAL FIX REQUIRED${RESET}"
echo "# Manual fix required - Hooks cannot be called conditionally"
echo "# For each file, refactor to ensure hooks are called unconditionally:"
echo -e "\nFiles to fix:"
echo "- src/app/(dashboard)/dashboard/DashboardContent.tsx"
echo "- src/components/features/campaigns/wizard/steps/Step4Content.tsx"
echo "- src/components/ui/icons/core/SvgIcon.tsx"

# Pausing for manual fixes
read -p "Press Enter when manual fixes are complete (or Ctrl+C to abort)..."
echo -e "${GREEN}Completed: Fix React Hooks Rules Violations${RESET}"
echo

# 6. Fix Unsafe Function Types
echo -e "${YELLOW}\n===== FIXING: Fix Unsafe Function Types =====${RESET}"
echo "The `Function` type accepts any function-like value.
Prefer explicitly defining any function parameters and return type."
echo "Fixing 14 occurrences across 2 files..."
echo -e "${BLUE}Manual fix required. Replace generic Function type with explicit signatures:${RESET}"

echo -e "${RED}MANUAL FIX REQUIRED${RESET}"
echo "# For each occurrence, replace `Function` with an explicit function type"
echo "# Example: `Function` → `(arg1: string, arg2: number) => void`"
echo -e "\nFiles to fix:"
echo "- src/components/features/campaigns/wizard/steps/Step1Content.tsx"
echo "- src/types/prisma-extensions.ts"

# Pausing for manual fixes
read -p "Press Enter when manual fixes are complete (or Ctrl+C to abort)..."
echo -e "${GREEN}Completed: Fix Unsafe Function Types${RESET}"
echo

# 7. Fix @typescript-eslint/no-empty-object-type Violations
echo -e "${YELLOW}\n===== FIXING: Fix @typescript-eslint/no-empty-object-type Violations =====${RESET}"
echo "The `{}` ("empty object") type allows any non-nullish value, including literals like `0` and `""`.
- If that's what you want, disable this lint rule with an inline comment or configure the 'allowObjectTypes' rule option.
- If you want a type meaning "any object", you probably want `object` instead.
- If you want a type meaning "any value", you probably want `unknown` instead."
echo "Fixing 3 occurrences across 3 files..."
echo -e "${BLUE}Manual fix required. Review each occurrence and fix according to the rule:${RESET}"

echo -e "${RED}MANUAL FIX REQUIRED${RESET}"
echo "# Manual inspection and fixes required for 3 files"
echo -e "\nFiles to fix:"
echo "- src/app/(campaigns)/campaigns/[id]/backup/page.original.tsx"
echo "- src/app/(campaigns)/campaigns/[id]/page.tsx"
echo "- src/components/ui/forms/form-controls.tsx"

# Pausing for manual fixes
read -p "Press Enter when manual fixes are complete (or Ctrl+C to abort)..."
echo -e "${GREEN}Completed: Fix @typescript-eslint/no-empty-object-type Violations${RESET}"
echo

# 8. Fix Explicit any Types
echo -e "${YELLOW}\n===== FIXING: Fix Explicit any Types =====${RESET}"
echo "Unexpected any. Specify a different type."
echo "Fixing 314 occurrences across 92 files..."
echo -e "${BLUE}Manual fix required. Each any type needs to be replaced with a more specific type:${RESET}"

echo -e "${RED}MANUAL FIX REQUIRED${RESET}"
echo "# Consider the context and replace `any` with more specific types"
echo "# Example: `any` → `string | number` or a custom type/interface"
echo -e "\nFiles to fix:"
echo "- backup-content/page.tsx"
echo "- backup-content/survey-approval/page.tsx"
echo "- BUILD/settings/backup/page.tsx"
echo "- BUILD/settings/backup/team-management/page.tsx"
echo "- BUILD/settings/backup/test-upload/page.tsx"
echo "- ... and more files (87 additional)"

# Pausing for manual fixes
read -p "Press Enter when manual fixes are complete (or Ctrl+C to abort)..."
echo -e "${GREEN}Completed: Fix Explicit any Types${RESET}"
echo

# 9. Fix syntax-error Violations
echo -e "${YELLOW}\n===== FIXING: Fix syntax-error Violations =====${RESET}"
echo "Parsing error: Invalid character."
echo "Fixing 13 occurrences across 13 files..."
echo -e "${BLUE}Manual fix required. Review each occurrence and fix according to the rule:${RESET}"

echo -e "${RED}MANUAL FIX REQUIRED${RESET}"
echo "# Manual inspection and fixes required for 13 files"
echo -e "\nFiles to fix:"
echo "- scripts/consolidated/cleanup/deprecation-warnings.js"
echo "- src/app/(admin)/not-found.tsx"
echo "- src/app/(auth)/not-found.tsx"
echo "- src/app/(campaigns)/campaigns/wizard/step-1/types.ts"
echo "- src/app/(campaigns)/campaigns/wizard/step-2/types.ts"
echo "- ... and more files (8 additional)"

# Pausing for manual fixes
read -p "Press Enter when manual fixes are complete (or Ctrl+C to abort)..."
echo -e "${GREEN}Completed: Fix syntax-error Violations${RESET}"
echo

# 10. Fix @typescript-eslint/ban-ts-comment Violations
echo -e "${YELLOW}\n===== FIXING: Fix @typescript-eslint/ban-ts-comment Violations =====${RESET}"
echo "Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free."
echo "Fixing 3 occurrences across 3 files..."
echo -e "${BLUE}Manual fix required. Review each occurrence and fix according to the rule:${RESET}"

echo -e "${RED}MANUAL FIX REQUIRED${RESET}"
echo "# Manual inspection and fixes required for 3 files"
echo -e "\nFiles to fix:"
echo "- src/app/api/health/db/route.ts"
echo "- src/components/features/analytics/mmm/SankeyDiagram.tsx"
echo "- src/components/mmm/CustomerJourney/SankeyDiagram.tsx"

# Pausing for manual fixes
read -p "Press Enter when manual fixes are complete (or Ctrl+C to abort)..."
echo -e "${GREEN}Completed: Fix @typescript-eslint/ban-ts-comment Violations${RESET}"
echo

echo -e "${GREEN}All fixes applied!${RESET}"
echo "Run ESLint again to verify fixes:"
echo "  npx eslint --config eslint.config.mjs ."
