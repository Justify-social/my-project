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

// Settings Module Pages
export { SettingsPage } from './settings/SettingsPage.js';
export { TeamManagementPage } from './settings/TeamManagementPage.js';
export { BillingPage } from './settings/BillingPage.js';
export { ProfilePage } from './settings/ProfilePage.js';
export { SuperAdminPage } from './settings/SuperAdminPage.js';

// Brand Lift Module Pages
export { BrandLiftPage } from './brand-lift/BrandLiftPage.js';
export { SurveyDesignPage } from './brand-lift/SurveyDesignPage.js';
export { CampaignSelectionPage } from './brand-lift/CampaignSelectionPage.js';
export { ProgressPage } from './brand-lift/ProgressPage.js';
export { ApprovalPage } from './brand-lift/ApprovalPage.js';

// Admin Tools Module Pages
export { AdminDashboardPage } from './admin/AdminDashboardPage.js';
export { AnalyticsPage } from './admin/AnalyticsPage.js';
export { UIComponentsPage } from './admin/UIComponentsPage.js';
export { DatabaseToolsPage } from './admin/DatabaseToolsPage.js';
export { APIVerificationPage } from './admin/APIVerificationPage.js';

// Marketplace & Influencer Module Pages
export { MarketplacePage } from './marketplace/MarketplacePage.js';
export { InfluencerProfilePage } from './marketplace/InfluencerProfilePage.js';
export { SearchAndFilterPage } from './marketplace/SearchAndFilterPage.js';
export { InfluencerEngagementPage } from './marketplace/InfluencerEngagementPage.js';

/**
 * Page Object Factory - For dynamic page creation
 * Helps maintain consistent instantiation patterns
 *
 * Note: Import page objects directly in tests for better tree-shaking and clarity
 * Example: import { SignInPage, DashboardPage, SettingsPage, BrandLiftPage, MarketplacePage } from '../support/page-objects';
 */
