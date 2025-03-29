'use client';

import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Sidebar } from "@/components/ui/organisms/navigation/sidebar";
import { SidebarProvider, useSidebar } from "@/providers/SidebarProvider";
import { SearchProvider } from '@/contexts/SearchContext';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LoadingSpinner as AuthSpinner } from '@/components/ui';
import { Icon } from "@/components/ui/atoms/icons";
import Link from "next/link";

interface ClientLayoutProps {
  children: React.ReactNode;
}

// Inner component that uses the SidebarProvider
const ClientLayoutInner: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  const { isOpen, toggle } = useSidebar();
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
    return <AuthSpinner label="Loading Justify..." />;
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
      href: '/dashboard', 
      icon: 'appHome',
      isActive: pathname === '/dashboard'
    },
    { 
      id: 'campaigns', 
      label: 'Campaigns', 
      href: '/campaigns', 
      icon: 'appCampaigns',
      isActive: pathname.startsWith('/campaigns'),
      children: [
        {
          id: 'campaigns-list',
          label: 'List',
          href: '/campaigns',
          isActive: pathname === '/campaigns'
        },
        {
          id: 'campaigns-wizard',
          label: 'Wizard',
          href: '/campaigns/wizard',
          isActive: pathname.startsWith('/campaigns/wizard')
        }
      ]
    },
    { 
      id: 'creative-testing', 
      label: 'Creative Testing', 
      href: '/creative-testing', 
      icon: 'appCreative-Asset-Testing',
      isActive: pathname.startsWith('/creative-testing'),
      children: [
        {
          id: 'creative-testing-list',
          label: 'List',
          href: '/creative-testing/list',
          isActive: pathname === '/creative-testing/list' || pathname === '/creative-testing'
        },
        {
          id: 'creative-testing-reports',
          label: 'Reports',
          href: '/creative-testing/reports',
          isActive: pathname.startsWith('/creative-testing/reports')
        }
      ]
    },
    { 
      id: 'brand-lift', 
      label: 'Brand Lift', 
      href: '/brand-lift', 
      icon: 'appBrand_Lift',
      isActive: pathname.startsWith('/brand-lift'),
      children: [
        {
          id: 'brand-lift-list',
          label: 'List',
          href: '/brand-lift/list',
          isActive: pathname === '/brand-lift/list' || pathname === '/brand-lift'
        },
        {
          id: 'brand-lift-reports',
          label: 'Reports',
          href: '/brand-lift/reports',
          isActive: pathname.startsWith('/brand-lift/reports')
        }
      ]
    },
    { 
      id: 'brand-health', 
      label: 'Brand Health', 
      href: '/brand-health', 
      icon: 'appBrand_Health',
      isActive: pathname.startsWith('/brand-health')
    },
    { 
      id: 'influencers', 
      label: 'Influencers', 
      href: '/influencers', 
      icon: 'appInfluencers',
      isActive: pathname.startsWith('/influencers'),
      children: [
        {
          id: 'influencers-marketplace',
          label: 'Marketplace',
          href: '/influencers/marketplace',
          isActive: pathname.startsWith('/influencers/marketplace')
        },
        {
          id: 'influencers-list',
          label: 'List',
          href: '/influencers',
          isActive: pathname === '/influencers'
        }
      ]
    },
    { 
      id: 'mmm', 
      label: 'MMM', 
      href: '/mmm', 
      icon: 'appMMM',
      isActive: pathname.startsWith('/mmm')
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      href: '/reports', 
      icon: 'appReports',
      isActive: pathname.startsWith('/reports')
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      href: '/billing', 
      icon: 'appBilling',
      isActive: pathname.startsWith('/billing')
    },
    { 
      id: 'help', 
      label: 'Help', 
      href: '/help', 
      icon: 'appHelp',
      isActive: pathname.startsWith('/help')
    }
  ];

  // Footer item for settings
  const sidebarFooter = (
    <Link
      href="/settings"
      className={`flex items-center py-2 pl-4 pr-2 rounded-md no-underline ${
        pathname.startsWith('/settings') ? 'text-[#00BFFF] font-medium' : 'text-[#333333] hover:bg-gray-100'
      }`}
    >
      <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0 relative">
        <div className="w-5 h-5">
          <img 
            src="/icons/app/settings.svg" 
            alt="Settings" 
            width={18}
            height={18}
            style={{ 
              filter: pathname.startsWith('/settings') ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 'none',
              maxWidth: '18px',
              maxHeight: '18px'
            }}
          />
        </div>
      </div>
      <span className="flex-grow text-base font-sora font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis">
        Settings
      </span>
    </Link>
  );
  
  // Remove Justify text from sidebar header
  const sidebarHeader = null;

  return (
    <SearchProvider>
      <div className="min-h-screen bg-white font-work-sans">
        <Header
          companyName="Justify"
          remainingCredits={100}
          notificationsCount={3}
          onMenuClick={() => setIsMobileOpen(!isMobileOpen)} />

        <Sidebar
          items={sidebarItems}
          header={sidebarHeader}
          footer={sidebarFooter}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
          width="240px"
        />
        <div className={`transition-all duration-200 ${isOpen ? 'md:ml-60' : 'md:ml-16'} pt-16 font-work-sans`}>
          <main className="p-4 md:p-6 bg-white min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </SearchProvider>
  );
};

// Outer component that provides the SidebarProvider
const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </SidebarProvider>
  );
};

export default ClientLayout;