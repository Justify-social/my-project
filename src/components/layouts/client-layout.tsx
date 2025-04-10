'use client';

import React, { useEffect, useState } from "react";
import { Header } from '@/components/ui/navigation/header';
import { Sidebar } from '@/components/ui/navigation/sidebar';
import { useSidebar } from "@/providers/SidebarProvider";
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icon } from '@/components/ui/icon/icon';
import Link from "next/link";
import Image from "next/image";
import SidebarUIComponents from "@/components/ui/navigation/sidebar-ui-components";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
}

interface ClientLayoutProps {
  children: React.ReactNode;
}

// Inner component that uses the SidebarProvider
const ClientLayoutInner: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  const { isOpen: isSidebarProviderOpen, toggle: toggleSidebarProvider } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // If there's no user and we're not loading, redirect to login
    if (!isLoading && !user && pathname !== '/api/auth/login') {
      router.replace('/api/auth/login');
      return;
    }
  }, [isLoading, user, router, pathname]);

  // Show the auth spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner label="Loading Justify..." />;
  }

  // Show error with login button if authentication fails
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center font-work-sans">
        <div className="text-center text-red-600 font-work-sans">
          <p className="font-work-sans">Authentication error. Please try again.</p>
          <button
            onClick={() => router.push('/api/auth/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-work-sans">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Only render the layout if we have a user
  if (!user) {
    return null;
  }

  // --- Navigation Definitions (SSOT) ---
  const sidebarItems: SidebarItemDef[] = [
    { id: 'home', label: 'Home', href: '/', icon: 'appHome' },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: 'appCampaigns',
      children: [
        { id: 'campaigns-list', label: 'List', href: '/campaigns' },
        { id: 'campaigns-wizard', label: 'Wizard', href: '/campaigns/wizard' }
      ]
    },
    {
      id: 'brand-lift',
      label: "Brand Lift",
      icon: "appBrandLift",
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
        }
      ]
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
        }
      ]
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
        }
      ]
    },
    { id: 'mmm', href: "/mmm", label: "MMM", icon: "appMmm" },
    { id: 'help', href: "/help", label: "Help", icon: "appHelp" },
    { id: 'billing', href: "/billing", label: "Billing", icon: "appBilling" },
  ];

  const settingsItemDef: SidebarItemDef = {
    id: 'settings', label: "Settings", href: "/settings", icon: "appSettings"
  };

  // Derive flat navItems for Header/MobileMenu (Main App)
  const mainNavItemsForMenu: NavItemDef[] = sidebarItems
    .filter(item => typeof item.href === 'string') // Only top-level linkable items
    .map(item => ({
      id: item.id,
      label: item.label,
      href: item.href as string,
      iconId: item.icon || 'faCircleLight' // Ensure iconId format
    }));

  // Add settings to the main menu items list
  const allMainNavItemsForMenu = [
    ...mainNavItemsForMenu,
    {
      id: settingsItemDef.id,
      label: settingsItemDef.label,
      href: settingsItemDef.href as string,
      iconId: settingsItemDef.icon || 'faGearLight'
    }
  ];

  // Define Debug Tool Navigation Items
  const debugNavItems: NavItemDef[] = [
    { id: 'debug-atom', label: 'Atom', href: '/debug-tools/ui-components?tab=components&category=atom', iconId: 'faAtomLight' },
    { id: 'debug-molecule', label: 'Molecule', href: '/debug-tools/ui-components?tab=components&category=molecule', iconId: 'faDnaLight' },
    { id: 'debug-organism', label: 'Organism', href: '/debug-tools/ui-components?tab=components&category=organism', iconId: 'faBacteriumLight' },
    { id: 'debug-icons', label: 'Icons', href: '/debug-tools/ui-components?tab=icons', iconId: 'faStarLight' },
  ];

  // --- End Navigation Definitions ---

  // Determine if we are on the UI components debug page
  const isUIComponentsPage = pathname.startsWith('/debug-tools/ui-components');

  // Select the correct items for the Mobile Menu based on the page
  const mobileMenuItems = isUIComponentsPage ? debugNavItems : allMainNavItemsForMenu;
  // Decide if settings item should be shown in mobile menu for debug page (optional)
  // For now, let's assume settings are not relevant in the debug mobile menu
  const mobileSettingsItem = !isUIComponentsPage ? {
    id: settingsItemDef.id,
    label: settingsItemDef.label,
    href: settingsItemDef.href as string,
    iconId: settingsItemDef.icon || 'faGearLight'
  } : undefined; // Pass undefined if on debug page

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-white font-work-sans">
        <Header
          companyName="Justify"
          remainingCredits={100}
          notificationsCount={3}
          onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
          // Pass the conditionally selected items to Header -> MobileMenu
          navItems={mobileMenuItems}
          // Pass conditional settings item (or handle lack of it in MobileMenu)
          settingsNavItem={mobileSettingsItem}
        />

        {/* Conditionally render the correct sidebar */}
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 transition-all duration-300">
          {isUIComponentsPage ? (
            // Pass the defined debugNavItems to the component
            <SidebarUIComponents navItems={debugNavItems} />
          ) : (
            <Sidebar
              // Pass the original nested structure to the main sidebar
              items={[...sidebarItems, settingsItemDef]} // Include settings in main sidebar
              activePath={pathname}
              onItemClick={() => setIsMobileOpen(false)}
              title="Justify"
            />
          )}
        </div>

        {/* Main content area */}
        <div className={`transition-margin duration-200 md:ml-64 pt-16 font-work-sans`}>
          <main className="p-4 md:p-6 bg-white min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

// Export the ClientLayoutInner directly since SidebarProvider is now in RootLayout
const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return <ClientLayoutInner>{children}</ClientLayoutInner>;
};

export default ClientLayout;