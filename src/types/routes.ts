/**
 * Route Type Definitions
 * 
 * This file provides TypeScript type safety for the application's routes.
 */

// Route parameters for dynamic routes
export type RouteParams = {
};

// Route paths organized by feature domain
export type RoutePaths = {
  auth: {
    'accept-invitation': string;
    subscribe: string;
  };
  dashboard: {
    'brand-health': string;
    'brand-lift': string;
    'creative-testing': string;
    dashboard: string;
    help: string;
    mmm: string;
    reports: string;
  };
  campaigns: {
    campaigns: string;
    influencer: string;
    'influencer-marketplace': string;
  };
  settings: {
    billing: string;
    pricing: string;
    settings: string;
  };
  admin: {
    admin: string;
    'debug-tools': string;
  };
};

// Helper function to build typesafe route paths
export const routes: RoutePaths = {
  auth: {
    'accept-invitation': `/auth/accept-invitation/`,
    subscribe: `/auth/subscribe/`,
  },
  dashboard: {
    'brand-health': `/dashboard/brand-health/`,
    'brand-lift': `/dashboard/brand-lift/`,
    'creative-testing': `/dashboard/creative-testing/`,
    dashboard: `/dashboard/dashboard/`,
    help: `/dashboard/help/`,
    mmm: `/dashboard/mmm/`,
    reports: `/dashboard/reports/`,
  },
  campaigns: {
    campaigns: `/campaigns/campaigns/`,
    influencer: `/campaigns/influencer/`,
    'influencer-marketplace': `/campaigns/influencer-marketplace/`,
  },
  settings: {
    billing: `/settings/billing/`,
    pricing: `/settings/pricing/`,
    settings: `/settings/settings/`,
  },
  admin: {
    admin: `/admin/admin/`,
    'debug-tools': `/admin/debug-tools/`,
  },
};

export default routes;
