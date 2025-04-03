export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

// Default navigation items
export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'faHome'
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: 'faFolder'
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: 'faChartLine'
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: 'faComment'
  },
];

// Settings navigation item
export const settingsNavItem: NavItem = {
  label: 'Settings',
  href: '/settings',
  icon: 'faCog'
}; 