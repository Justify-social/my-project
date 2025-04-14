# Custom Scripts Documentation

This document lists and describes the custom scripts defined in `package.json` for the project. The purpose is to provide clarity on each script's functionality, aiding in maintenance and potential simplification of the build and development processes.

## Table of Contents

- [Development Scripts](#development-scripts)
- [Build Scripts](#build-scripts)
- [Test Scripts](#test-scripts)
- [Linting Scripts](#linting-scripts)
- [Icon Management Scripts](#icon-management-scripts)
- [UI Component Scripts](#ui-component-scripts)
- [Configuration Scripts](#configuration-scripts)
- [Codebase Health Scripts](#codebase-health-scripts)
- [Documentation Scripts](#documentation-scripts)
- [Cleanup Scripts](#cleanup-scripts)
- [Other Scripts](#other-scripts)

## Development Scripts

- **dev**: Starts the Next.js development server.
- **start**: Starts the Next.js production server.

## Build Scripts

- **build**: Builds the application for production, including generating icon registry modules.
- **build:registry**: Builds the UI component registry.

## Test Scripts

- **test**: Runs both unit and integration tests.
- **test:all**: Runs all tests including unit, integration, end-to-end, and API tests.
- **test:watch**: Runs Jest in watch mode for continuous testing.
- **test:coverage**: Runs Jest with coverage reporting.
- **test:unit**: Runs only unit tests.
- **test:integration**: Runs only integration tests.
- **test:e2e**: Runs end-to-end tests with Cypress.
- **test:api**: Tests API endpoints.
- **test:api:ci**: Tests API endpoints in CI environment.
- **test:local**: Tests local source code.
- **test:algolia**: Tests Algolia search functionality.

## Linting Scripts

- **lint**: Runs Next.js linting.
- **lint:all**: Runs both linting and formatting fixes.
- **lint:fix**: Fixes ESLint issues.
- **lint:format**: Formats code using Prettier.
- **lint:check-format**: Checks code formatting with Prettier.
- **lint:any**: Fixes specific ESLint rule for 'any' type.
- **lint:unused-vars**: Fixes unused variables.
- **lint:update-config**: Updates ESLint configuration.
- **lint:clean**: Cleans up linting issues in codebase.
- **lint:clean:script**: Shell script for cleaning linting issues.
- **lint-staged**: Runs linting on staged files.

## Icon Management Scripts

- **icons**: Downloads and checks icons.
- **icons:download**: Downloads all icon types.
- **icons:download:light**: Downloads light icons.
- **icons:download:solid**: Downloads solid icons.
- **icons:download:brands**: Downloads brand icons.
- **icons:check**: Audits icon files.
- **icons:check:light**: Checks light icons.
- **icons:check:solid**: Checks solid icons.
- **icons:lock**: Locks registry files (shell script).
- **icons:unlock**: Unlocks registry files for editing.
- **icons:validate:ssot**: Validates icon ID single source of truth.
- **icons:validate:registry**: Validates icon registry.
- **icons:fix:imports**: Fixes icon imports (shell script).
- **icons:archive**: Archives registry backups (shell script).
- **icons:render:test**: Verifies icon rendering.
- **icons:merge**: Merges icon registries.

## UI Component Scripts

- **ui**: Validates UI component paths and analyzes usage.
- **ui:validate-paths**: Validates component paths.
- **ui:analyze-usage**: Analyzes component usage.
- **ui:backup**: Backs up UI components.
- **ui:cleanup-backups**: Cleans up UI component backups.
- **validate:components**: Validates components.
- **docs:ui**: Generates UI documentation.
- **ui:generate-test**: Generates test for UI components.

## Configuration Scripts

- **config**: Organizes and migrates configuration.
- **config:organize**: Organizes configuration files.
- **config:migrate**: Migrates configuration.
- **config:symlinks**: Creates configuration symlinks (shell script).
- **validate:config**: Validates configuration.

## Codebase Health Scripts

- **codebase**: Checks naming consistency and finds redundant files.
- **codebase:check-naming**: Checks naming consistency in codebase.
- **codebase:find-redundant**: Finds redundant files.
- **codebase:clean-redundant**: Cleans redundant files.
- **codebase:health**: Runs comprehensive health checks including linting and codebase checks.

## Documentation Scripts

- **docs:generate**: Generates documentation for scripts (currently non-functional).

## Cleanup Scripts

- **cleanup**: Runs cleanup tasks for deprecated and final cleanup.
- **cleanup:deprecated**: Cleans up deprecated scripts.
- **cleanup:final**: Performs final cleanup.
- **clean**: Verifies no backups exist.
- **clean:fix**: Fixes backup issues.

## Other Scripts

- **analyze**: Builds with bundle analyzer enabled.
- **measure-bundle**: Measures bundle size.
- **create-test-fixtures**: Creates test image fixtures.
- **postinstall**: Generates Prisma client.
- **generate:campaign**: Generates Prisma schema for campaign wizard.
- **migrate:campaign**: Applies migration for campaign wizard schema.
- **prepare**: Sets up Husky for Git hooks.
- **index-campaigns**: Indexes campaigns for search.
- **algolia**: Indexes and reindexes Algolia search data.
- **algolia:index**: Indexes sample campaigns.
- **algolia:reindex**: Reindexes campaigns via API call.
- **cypress**: Runs Cypress tests.
- **cypress:open**: Opens Cypress test runner.
