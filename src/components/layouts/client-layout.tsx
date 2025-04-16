'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/ui/navigation/header';
import { Sidebar } from '@/components/ui/navigation/sidebar';
import { useSidebar } from '@/providers/SidebarProvider';
import { usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Icon } from '@/components/ui/icon/icon';
import Link from 'next/link';
import Image from 'next/image';
import SidebarUIComponents from '@/components/ui/navigation/sidebar-ui-components';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { MobileMenu } from '@/components/ui/navigation/mobile-menu';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';

// Dynamically import the client-side auth components with SSR disabled
const DynamicClientAuth = dynamic(
  () => import('@/components/auth/ClientAuthComponents'),
  { ssr: false }
);

// --- App Icon Mapping (Copied from MobileMenu.tsx) ---
const appIconMap: Record<string, string> = {
  dashboard: 'appHome',
  home: 'appHome',
  campaigns: 'appCampaigns',
  'brand lift': 'appBrandLift',
  'creative testing': 'appCreativeAssetTesting',
  'brand health': 'appBrandHealth',
  influencers: 'appInfluencers',
  mmm: 'appMmm',
  reports: 'appReports',
  settings: 'appSettings',
  'account settings': 'appSettings',
  help: 'appHelp',
  billing: 'appBilling',
};

const getAppIconIdForLabel = (label: string): string | null => {
  return appIconMap[label.toLowerCase()] || null;
};
// ---------------------------------------------------

// --- Define Navigation Item Types ---
// Main Sidebar/Header Structure (allows children)
interface SidebarItemDef {
  id: string;
  label: string;
  href?: string; // Optional for parent items
  icon?: string;
  children?: SidebarChildItemDef[];
}

interface SidebarChildItemDef {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

// Flat structure for MobileMenu and UI Components Sidebar
interface NavItemDef {
  id: string;
  label: string;
  href: string;
  iconId: string; // Use iconId for consistency with MobileMenu and UI Sidebar
  isDisabled?: boolean; // Added to match MobileMenu definition
  badge?: string | number; // Added to match MobileMenu definition
  children?: NavItemDef[]; // Added to match MobileMenu definition
}

interface ClientLayoutProps {
  children: React.ReactNode;
}

// Inner component that uses the SidebarProvider
const ClientLayoutInner: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname() ?? '';
  const { user } = useUser();
  const { isOpen: isSidebarProviderOpen, toggle: toggleSidebarProvider } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- Navigation Definitions (SSOT) ---
  const sidebarItems: SidebarItemDef[] = [
    { id: 'home', label: 'Home', href: '/', icon: 'appHome' },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: 'appCampaigns',
      children: [
        { id: 'campaigns-list', label: 'List', href: '/campaigns' },
        { id: 'campaigns-wizard', label: 'Wizard', href: '/campaigns/wizard/step-1' },
      ],
    },
    {
      id: 'brand-lift',
      label: 'Brand Lift',
      icon: 'appBrandLift',
      children: [
        {
          id: 'brand-lift-list',
          label: 'List',
          href: '/brand-lift',
        },
        {
          id: 'brand-lift-reports',
          label: 'Reports',
          href: '/brand-lift/reports',
        },
      ],
    },
    {
      id: 'creative-testing',
      label: 'Creative Testing',
      icon: 'appCreativeAssetTesting',
      children: [
        {
          id: 'creative-testing-list',
          label: 'List',
          href: '/creative-testing',
        },
        {
          id: 'creative-testing-reports',
          label: 'Reports',
          href: '/creative-testing/reports',
        },
      ],
    },
    {
      id: 'brand-health',
      label: 'Brand Health',
      icon: 'appBrandHealth',
      href: '/brand-health',
    },
    {
      id: 'influencers',
      label: 'Influencers',
      icon: 'appInfluencers',
      children: [
        {
          id: 'influencers-marketplace',
          label: 'Marketplace',
          href: '/influencers/marketplace',
        },
        {
          id: 'influencers-list',
          label: 'List',
          href: '/influencers',
        },
      ],
    },
    { id: 'mmm', href: '/mmm', label: 'MMM', icon: 'appMmm' },
    { id: 'help', href: '/help', label: 'Help', icon: 'appHelp' },
    { id: 'billing', href: '/billing', label: 'Billing', icon: 'appBilling' },
  ];

  const settingsItemDef: SidebarItemDef = {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'appSettings',
  };

  // Function to recursively transform sidebar items for mobile menu
  const transformMenuItemsForMobile = (items: SidebarItemDef[]): NavItemDef[] => {
    return items
      .map(item => {
        // Skip settings here, it's handled separately
        if (item.id === 'settings') return null;

        // Try to map icon using label, fallback to item.icon, then fallback to circle
        const mappedAppIconId = getAppIconIdForLabel(item.label);
        const displayIconId = mappedAppIconId || item.icon || 'faCircleLight';

        const navItem: NavItemDef = {
          id: item.id,
          label: item.label,
          // Use item.href if available, otherwise treat as non-navigable parent
          href: item.href || '#', // Use '#' or similar for non-link parents
          iconId: displayIconId,
          // Recursively transform children if they exist
          children: item.children ? transformMenuItemsForMobile(item.children) : undefined,
        };
        return navItem;
      })
      .filter((item): item is NavItemDef => item !== null); // Filter out null items (settings)
  };

  // Derive navItems for MobileMenu (Main App)
  const allMainNavItemsForMenu: NavItemDef[] = [
    ...transformMenuItemsForMobile(sidebarItems), // Use the corrected transformation
    {
      // Add settings explicitly (ensures only one)
      id: settingsItemDef.id,
      label: settingsItemDef.label,
      href: settingsItemDef.href as string,
      iconId: settingsItemDef.icon || 'faGearLight',
    },
  ];

  // Define Debug Tool Navigation Items (Ensure NavItemDef compatibility)
  const debugNavItems: NavItemDef[] = [
    {
      id: 'debug-atom',
      label: 'Atom',
      href: '/debug-tools/ui-components?tab=components&category=atom',
      iconId: 'faAtomLight',
    },
    {
      id: 'debug-molecule',
      label: 'Molecule',
      href: '/debug-tools/ui-components?tab=components&category=molecule',
      iconId: 'faDnaLight',
    },
    {
      id: 'debug-organism',
      label: 'Organism',
      href: '/debug-tools/ui-components?tab=components&category=organism',
      iconId: 'faBacteriumLight',
    },
    {
      id: 'debug-icons',
      label: 'Icons',
      href: '/debug-tools/ui-components?tab=icons',
      iconId: 'faStarLight',
    },
    {
      id: 'debug-palette',
      label: 'Colour Palette',
      href: '/debug-tools/ui-components?tab=palette',
      iconId: 'faPaletteLight',
    },
    {
      id: 'debug-fonts',
      label: 'Fonts',
      href: '/debug-tools/ui-components?tab=fonts',
      iconId: 'faPencilLight',
    },
  ];

  // --- End Navigation Definitions ---

  // Determine if we are on the UI components debug page
  const isUIComponentsPage = pathname.startsWith('/debug-tools/ui-components');

  // Select the correct items for the Mobile Menu based on the page
  const mobileMenuItems = isUIComponentsPage ? debugNavItems : allMainNavItemsForMenu;
  // Define settingsItem for MobileMenu based on context (only for main app)
  const mobileSettingsItem = !isUIComponentsPage
    ? {
      id: settingsItemDef.id,
      label: settingsItemDef.label,
      href: settingsItemDef.href as string,
      iconId: settingsItemDef.icon || 'faGearLight',
    }
    : undefined;

  return (
    <React.Suspense fallback={<LoadingSkeleton />}>
      <ThemeProvider defaultTheme="light">
        <div className="min-h-screen flex flex-col">
          <Header
            companyName="Justify"
            remainingCredits={100}
            notificationsCount={3}
            onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
            authControls={<DynamicClientAuth />}
          />

          <div className="flex flex-1 overflow-hidden">
            <div
              className={cn(
                'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 transition-all duration-300 z-30',
                'hidden md:block'
              )}
            >
              {isUIComponentsPage ? (
                <SidebarUIComponents navItems={debugNavItems} />
              ) : (
                <Sidebar items={sidebarItems} activePath={pathname} title="Justify" />
              )}
            </div>

            <div
              className={`flex-1 transition-margin duration-200 md:ml-[var(--sidebar-width)] pt-16 font-body overflow-y-auto`}
            >
              <main className="p-4 md:p-6 bg-white min-h-[calc(100vh-4rem)] pb-[65px]">{children}</main>
            </div>
          </div>

          <MobileMenu
            isOpen={isMobileOpen}
            onOpenChange={setIsMobileOpen}
            menuItems={mobileMenuItems}
            remainingCredits={100}
            notificationsCount={3}
            companyName="Justify"
            user={user}
          />
        </div>
      </ThemeProvider>
    </React.Suspense>
  );
};

// Export the ClientLayoutInner directly
const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return <ClientLayoutInner>{children}</ClientLayoutInner>;
};

export default ClientLayout;
