'use client';

import React, { useEffect } from "react";
import Header from "@/components/Navigation/Header";
import Sidebar from "@/components/Navigation/Sidebar";
import { SidebarProvider } from "@/providers/SidebarProvider";
import { SearchProvider } from "@/context/SearchContext";
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { AuthSpinner } from '@/components/ui/loading-spinner/index';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, error, isLoading } = useUser();

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
      </div>);

  }

  // Only render the layout if we have a user
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <SearchProvider>
        <div className="min-h-screen bg-white font-work-sans">
          <Header
            companyName="Justify"
            remainingCredits={100}
            notificationsCount={3} className="font-sora" />

          <Sidebar />
          <div className="md:ml-64 pt-16 font-work-sans">
            <main className="p-4 md:p-6 bg-white min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
        </div>
      </SearchProvider>
    </SidebarProvider>);

};

export default ClientLayout;