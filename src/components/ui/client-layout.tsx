'use client';

import React, { PropsWithChildren, useState } from "react";
import Header from '@/components/ui/navigation/header';
import Sidebar from '@/components/ui/navigation/sidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Placeholder navigation items for Sidebar
const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: "faHome" },
  { href: "/analytics", label: "Analytics", icon: "faChartLine" },
  { href: "/campaigns", label: "Campaigns", icon: "faBullhorn" },
  { href: "/settings", label: "Settings", icon: "faCog" }
];

/**
 * Client-side layout wrapper component with header and sidebar
 */
export function ClientLayout({ children }: PropsWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pass only props that exist on the components
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        items={sidebarItems}
        isExpanded={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header 
          companyName="Company Name" 
          remainingCredits={100}
          notificationsCount={5}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none pt-16">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="py-6">
              <div className="px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 