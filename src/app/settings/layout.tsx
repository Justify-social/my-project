'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs'; // Import useAuth
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming this path is correct
import { Separator } from '@/components/ui/separator';
import QueryProvider from '@/components/providers/query-provider';

// Helper function to determine the active tab based on the pathname
const getActiveTab = (pathname: string | null): string => {
  if (!pathname) return 'profile';
  // Check based on the full path segment
  if (pathname.startsWith('/settings/team')) return 'team'; // Use startsWith for catch-all
  if (pathname.startsWith('/settings/branding')) return 'branding';
  if (pathname.startsWith('/settings/super-admin')) return 'super-admin'; // Add check for super-admin
  // Default to profile (catch-all handled by UserProfile component)
  return 'profile'; // Default fallback remains profile
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sessionClaims } = useAuth(); // Get session claims
  const activeTab = getActiveTab(pathname);

  // Log the claims to the browser console for debugging
  useEffect(() => {
    // console.log('Session Claims:', JSON.stringify(sessionClaims, null, 2));
  }, [sessionClaims]);

  // Check the flat metadata.role claim
  const isSuperAdmin = sessionClaims?.['metadata.role'] === 'super_admin';

  // Base navigation items
  const baseNavItems = [
    { label: 'Profile Settings', value: 'profile', href: '/settings/profile' },
    { label: 'Team Management', value: 'team', href: '/settings/team' },
    { label: 'Branding', value: 'branding', href: '/settings/branding' },
  ];

  // Conditionally add Super Admin tab
  const navItems = [...baseNavItems];
  if (isSuperAdmin) {
    navItems.push({
      label: 'Super Admin',
      value: 'super-admin',
      href: '/settings/super-admin',
    });
  }

  // Dynamically set grid columns
  const gridColsClass = isSuperAdmin ? 'sm:grid-cols-4' : 'sm:grid-cols-3';

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6">Settings</h1>
      <Tabs value={activeTab} className="w-full">
        <TabsList
          className={`grid w-full grid-cols-1 ${gridColsClass} gap-2 h-auto bg-transparent p-0`}
        >
          {navItems.map(item => (
            <TabsTrigger
              value={item.value}
              key={item.value}
              asChild
              className="w-full justify-start data-[state=active]:bg-muted data-[state=active]:shadow-sm data-[state=active]:border-accent data-[state=active]:border-b-2 rounded-none text-secondary hover:text-primary transition-colors duration-150 px-4 py-2 text-sm font-medium"
            >
              <Link href={item.href}>{item.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator className="mb-8" />
        <QueryProvider>{children}</QueryProvider>
      </Tabs>
    </div>
  );
}
