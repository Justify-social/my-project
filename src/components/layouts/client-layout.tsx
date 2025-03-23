'use client'

import React, { useEffect, useState } from "react";
import Header from "@/components/Navigation/Header";
import Sidebar from "@/components/Navigation/Sidebar";
import { SidebarProvider } from "@/providers/SidebarProvider";
import { SearchProvider } from "@/context/SearchContext";
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';

interface ClientLayoutProps {
  children: React.ReactNode;
}

// Add public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/test-auth',
  '/api/debug'
];

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, error } = useUser();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Check if current path is a public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  useEffect(() => {
    // Allow time for Auth0 to initialize
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Skip for public routes
    if (isPublicRoute) {
      return;
    }

    // If not a public route, no user, and not loading, redirect to login
    if (!isLoading && !isInitialLoad && !user && pathname !== '/api/auth/login') {
      console.log('Redirecting to login page from:', pathname);
      router.push('/login');
      return;
    }
  }, [isLoading, isInitialLoad, user, router, pathname, isPublicRoute]);

  // Show loading state while checking authentication
  if ((isLoading || isInitialLoad) && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Justify...</p>
        </div>
      </div>
    );
  }

  // For public routes, render children directly
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show error state if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Authentication error. Please try again.</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Only render the layout if we have a user or it's a public route
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">You need to be logged in to view this page.</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SearchProvider>
        <div className="min-h-screen bg-white">
          <Header 
            companyName="Justify"
            remainingCredits={100}
            notificationsCount={3}
          />
          <Sidebar />
          <div className="md:ml-64 pt-16">
            <main className="p-4 md:p-6 bg-white min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
        </div>
      </SearchProvider>
    </SidebarProvider>
  );
} 