/**
 * SSOT (Single Source of Truth) Page Object Index
 *
 * This file serves as the central export point for all page objects.
 * Import from here to ensure consistency across all test files.
 *
 * Usage:
 * import { SignInPage, DashboardPage, CampaignsPage } from '../support/page-objects';
 */

// Shared/Base Pages
export { BasePage } from './shared/BasePage.js';

// Authentication Pages
export { SignInPage } from './auth/SignInPage.js';

// Dashboard Pages
export { DashboardPage } from './dashboard/DashboardPage.js';

// Campaign Pages
export { CampaignsPage } from './campaigns/CampaignsPage.js';

/**
 * Page Object Factory - For dynamic page creation
 * Helps maintain consistent instantiation patterns
 *
 * Note: Import page objects directly in tests for better tree-shaking and clarity
 * Example: import { SignInPage, DashboardPage } from '../support/page-objects';
 */
