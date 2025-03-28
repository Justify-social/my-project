export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: { label: string; href: string }[];
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "/icons/app/Home.svg" },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: "/icons/app/Campaigns.svg",
    children: [
      { label: "List", href: "/campaigns" },
      { label: "Wizard", href: "/campaigns/wizard/step-1" },
    ],
  },
  {
    label: "Creative Testing",
    href: "/creative-testing",
    icon: "/icons/app/Creative_Asset_Testing.svg",
    children: [
      { label: "List", href: "/creative-testing" },
      { label: "Reports", href: "/creative-testing/reports" },
    ],
  },
  {
    label: "Brand Lift",
    href: "/brand-lift",
    icon: "/icons/app/Brand_Lift.svg",
    children: [
      { label: "List", href: "/brand-lift" },
      { label: "Reports", href: "/brand-lift/reports" },
    ],
  },
  { label: "Brand Health", href: "/brand-health", icon: "/icons/app/Brand_Health.svg" },
  {
    label: "Influencers",
    href: "/influencers/marketplace",
    icon: "/icons/app/Influencers.svg",
    children: [
      { label: "Marketplace", href: "/influencers/marketplace" },
      { label: "List", href: "/influencers/influencer-list" },
    ],
  },
  {
    label: "MMM",
    href: "/mmm",
    icon: "/icons/app/MMM.svg",
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
    icon: "/icons/app/Reports.svg",
    children: [
      { label: "Insight", href: "/reports/insight" },
      { label: "Dashboard", href: "/reports/dashboard" },
    ],
  },
  { label: "Billing", href: "/billing", icon: "/icons/app/Billing.svg" },
  { label: "Help", href: "/help", icon: "/icons/app/Help.svg" },
];

export const settingsNavItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: "/icons/app/Settings.svg",
}; 