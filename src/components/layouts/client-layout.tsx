'use client'

import React, { useEffect } from "react";
import Header from "@/components/Navigation/Header";
import Sidebar from "@/components/Navigation/Sidebar";
import { SidebarProvider } from "@/providers/SidebarProvider";
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useUser();

  // Check if current path is an auth path
  const isAuthPath = pathname?.startsWith('/api/auth');
  const isPublicPath = isAuthPath || pathname === '/';

  useEffect(() => {
    if (!isLoading && !user && !isPublicPath) {
      router.push('/api/auth/login');
    }
  }, [isLoading, user, isPublicPath, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
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
    </SidebarProvider>
  );
} 