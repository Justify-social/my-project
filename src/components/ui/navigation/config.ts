export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

// Default navigation items
export const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: 'appHome'
  },
  {
    label: 'Campaigns',
    href: '/campaigns',
    icon: 'appCampaigns'
  },
  {
    label: 'Creative Testing',
    href: '/creative-testing',
    icon: 'appCreativeAssetTesting'
  },
  {
    label: 'Brand Health',
    href: '/brand-health',
    icon: 'appBrandHealth'
  },
];

// Settings navigation item
export const settingsNavItem: NavItem = {
  label: 'Settings',
  href: '/settings',
  icon: 'appSettings'
}; 