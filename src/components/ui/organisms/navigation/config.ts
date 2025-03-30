/**
 * Navigation Configuration
 * 
 * This file contains the configuration for the main navigation items.
 */

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: { label: string; href: string }[];
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "appHome" },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: "appCampaigns",
    children: [
      { label: "List", href: "/campaigns" },
      { label: "Wizard", href: "/campaigns/wizard/step-1" },
    ],
  },
  {
    label: "Creative Testing",
    href: "/creative-testing",
    icon: "appCreative_Asset_testing",
    children: [
      { label: "List", href: "/creative-testing" },
      { label: "Reports", href: "/creative-testing/reports" },
    ],
  },
  {
    label: "Brand Lift",
    href: "/brand-lift",
    icon: "appBrand_Lift",
    children: [
      { label: "List", href: "/brand-lift" },
      { label: "Reports", href: "/brand-lift/reports" },
    ],
  },
  { label: "Brand Health", href: "/brand-health", icon: "appBrand_Health" },
  {
    label: "Influencers",
    href: "/influencers/marketplace",
    icon: "appInfluencers",
    children: [
      { label: "Marketplace", href: "/influencers/marketplace" },
      { label: "List", href: "/influencers/influencer-list" },
    ],
  },
  {
    label: "MMM",
    href: "/mmm",
    icon: "appMMM",
    children: [
      { label: "Dashboard", href: "/mmm/dashboard" },
      { label: "Attribution", href: "/mmm/attribution" },
      { label: "Weightings", href: "/mmm/weightings" },
      { label: "Cross-channel", href: "/mmm/cross-channel" },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "appReports",
    children: [
      { label: "Insight", href: "/reports/insight" },
      { label: "Dashboard", href: "/reports/dashboard" },
    ],
  },
  { label: "Billing", href: "/billing", icon: "appBilling" },
  { label: "Help", href: "/help", icon: "appHelp" },
];

export const settingsNavItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: "appSettings",
};

// Default export added by auto-fix script
export default {
  // All configuration from this file
}; 