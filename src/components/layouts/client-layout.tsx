'use client';

import React, { useEffect, useState } from "react";
import Header from '@/components/ui/organisms/navigation/header';
import Sidebar from '@/components/ui/organisms/navigation/sidebar';
import { SidebarProvider, useSidebar } from "@/providers/SidebarProvider";
import { SearchProvider } from '@/contexts/SearchContext';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LoadingSpinner } from '@/components/ui/atoms/loading-spinner';
import { Icon } from '@/components/ui/atoms/icon';
import Link from "next/link";
import Image from "next/image";

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
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);

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
      id: 'brand-health', 
      label: 'Brand Health', 
      href: '/brand-health', 
      icon: 'appBrand_Health',
      isActive: pathname.startsWith('/brand-health')
    }
  ];

  // Footer item for settings
  const sidebarFooter = (
    <Link
      href="/settings"
      className={`flex items-center py-2 pl-4 pr-2 rounded-md no-underline transition-all duration-150 ${
        pathname.startsWith('/settings') ? 'text-[#00BFFF] font-medium' : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
      }`}
      onMouseEnter={() => setIsSettingsHovered(true)}
      onMouseLeave={() => setIsSettingsHovered(false)}
    >
      <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0 relative">
        <Image 
          src="/icons/app/settings.svg" 
          alt="Settings" 
          width={20}
          height={20}
          className="w-5 h-5"
          style={{ 
            filter: (pathname.startsWith('/settings') || isSettingsHovered) ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 'none',
            transition: 'filter 0.15s ease-in-out'
          }}
          unoptimized
        />
      </div>
      <span className={`flex-grow text-base font-sora font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis ${
        (pathname.startsWith('/settings') || isSettingsHovered) ? 'text-[#00BFFF]' : 'text-[#333333]'
      }`}>
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