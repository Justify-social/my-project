export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "/Home.svg" },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: "/Campaigns.svg",
    children: [
      { label: "List", href: "/campaigns" },
      { label: "Wizard", href: "/campaigns/wizard/step-1" },
    ],
  },
  {
    label: "Creative Testing",
    href: "/creative-testing",
    icon: "/Creative_Asset_Testing.svg",
    children: [
      { label: "List", href: "/creative-testing/list" },
      { label: "Reports", href: "/creative-testing/reports" },
    ],
  },
  {
    label: "Brand Lift",
    href: "/brand-lift",
    icon: "/Brand_Lift.svg",
    children: [
      { label: "List", href: "/brand-lift/list" },
      { label: "Reports", href: "/brand-lift/reports" },
    ],
  },
  { label: "Brand Health", href: "/brand-health", icon: "/Brand_Health.svg" },
  {
    label: "Influencers",
    href: "/influencers/marketplace",
    icon: "/Influencers.svg",
    children: [
      { label: "Marketplace", href: "/influencers/marketplace" },
      { label: "List", href: "/influencers" },
    ],
  },
  {
    label: "MMM",
    href: "/mmm",
    icon: "/MMM.svg",
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
    icon: "/Reports.svg",
    children: [
      { label: "Insight", href: "/reports/insight" },
      { label: "Dashboard", href: "/reports/dashboard" },
    ],
  },
  { label: "Billing", href: "/billing", icon: "/Billing.svg" },
  { label: "Help", href: "/help", icon: "/Help.svg" },
];

export const settingsNavItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: "/Settings.svg",
}; 