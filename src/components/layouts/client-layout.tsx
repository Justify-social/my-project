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
import { MobileMenu } from "@/components/ui/navigation/mobile-menu";
import { cn } from "@/lib/utils";

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

  // Function to recursively flatten sidebar items for mobile menu
  const flattenMenuItems = (items: SidebarItemDef[], depth = 0): NavItemDef[] => {
    const flatList: NavItemDef[] = [];
    items.forEach(item => {
      // Filter out the settings item during flattening
      if (item.id === 'settings') return;

      if (item.href) { // Only include items with href directly
        flatList.push({
          id: item.id,
          label: item.label,
          href: item.href,
          iconId: item.icon || 'faCircleLight',
        });
      }
      // Recursive flattening logic (currently commented out)
      // if (item.children) {
      //     flatList = flatList.concat(flattenMenuItems(item.children, depth + 1));
      // }
    });
    return flatList;
  };

  // Derive flat navItems for MobileMenu (Main App)
  const allMainNavItemsForMenu: NavItemDef[] = [
    ...flattenMenuItems(sidebarItems), // Now excludes settings
    { // Add settings explicitly (ensures only one)
      id: settingsItemDef.id,
      label: settingsItemDef.label,
      href: settingsItemDef.href as string,
      iconId: settingsItemDef.icon || 'faGearLight'
    }
  ];

  // Define Debug Tool Navigation Items (Ensure NavItemDef compatibility)
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
  // Define settingsItem for MobileMenu based on context (only for main app)
  const mobileSettingsItem = !isUIComponentsPage ? {
    id: settingsItemDef.id,
    label: settingsItemDef.label,
    href: settingsItemDef.href as string,
    iconId: settingsItemDef.icon || 'faGearLight'
  } : undefined;

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen flex flex-col">
        <Header
          companyName="Justify"
          remainingCredits={100}
          notificationsCount={3}
          onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 transition-all duration-300 z-30",
            "hidden md:block"
          )}>
            {isUIComponentsPage ? (
              <SidebarUIComponents navItems={debugNavItems} />
            ) : (
              <Sidebar
                items={sidebarItems}
                activePath={pathname}
                title="Justify"
              />
            )}
          </div>

          <div className={`flex-1 transition-margin duration-200 md:ml-64 pt-16 font-work-sans overflow-y-auto`}>
            <main className="p-4 md:p-6 bg-white min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
        </div>

        <MobileMenu
          isOpen={isMobileOpen}
          onOpenChange={setIsMobileOpen}
          menuItems={mobileMenuItems}
          settingsItem={mobileSettingsItem}
          remainingCredits={100}
          notificationsCount={3}
          companyName="Justify"
          user={user}
        />
      </div>
    </ThemeProvider>
  );
};

// Export the ClientLayoutInner directly since SidebarProvider is now in RootLayout
const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return <ClientLayoutInner>{children}</ClientLayoutInner>;
};

export default ClientLayout;

// Helper Function (if needed elsewhere, move to utils)
function safeGet<T, K extends keyof T>(obj: T | undefined | null, key: K, defaultValue: T[K]): T[K] {
  return obj?.[key] ?? defaultValue;
}