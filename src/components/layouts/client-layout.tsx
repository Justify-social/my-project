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

// Define NavItem interface (matching the one defined in header.tsx)
interface NavItem {
  label: string;
  href: string;
  icon: string;
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

  const sidebarItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: 'appHome',
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: 'appCampaigns',
      children: [
        {
          id: 'campaigns-list',
          label: 'List',
          href: '/campaigns',
        },
        {
          id: 'campaigns-wizard',
          label: 'Wizard',
          href: '/campaigns/wizard',
        }
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

  // Create navItems for Header/MobileMenu (flat structure, top-level links)
  const navItems: NavItem[] = sidebarItems
    .filter(item => typeof item.href === 'string') // Filter out items without a direct top-level href
    .map(item => ({
      label: item.label,
      href: item.href as string, // Assert href is string after filter
      icon: item.icon || 'faCircleLight' // Provide default icon if missing
    }));

  // Define the settings nav item separately
  const settingsNavItem: NavItem = {
    label: "Settings",
    href: "/settings",
    icon: "appSettings" // Or the appropriate icon name
  };

  // Determine if we are on the UI components debug page
  const isUIComponentsPage = pathname.startsWith('/debug-tools/ui-components');

  return (
    <div className="min-h-screen bg-white font-work-sans">
      <Header
        companyName="Justify"
        remainingCredits={100}
        notificationsCount={3}
        onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
        navItems={navItems}
        settingsNavItem={settingsNavItem}
      />

      {/* Conditionally render the correct sidebar */}
      <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 transition-all duration-300">
        {isUIComponentsPage ? (
          <SidebarUIComponents />
        ) : (
          <Sidebar
            items={sidebarItems}
            activePath={pathname}
            onItemClick={() => setIsMobileOpen(false)}
            title="Justify"
          />
        )}
      </div>
      {/* Adjust margin based on whether the standard sidebar is shown */}
      <div className={`transition-margin duration-200 ${!isUIComponentsPage ? 'md:ml-64' : ''} pt-16 font-work-sans`}>
        <main className="p-4 md:p-6 bg-white min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

// Export the ClientLayoutInner directly since SidebarProvider is now in RootLayout
const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return <ClientLayoutInner>{children}</ClientLayoutInner>;
};

export default ClientLayout;