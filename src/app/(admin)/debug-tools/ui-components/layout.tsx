'use client';

import React from 'react';
// import Link from 'next/link'; // Unused
// import { usePathname } from 'next/navigation'; // Unused
// import { getIconClasses } from '@/components/ui/utils/icon-integration';
// import { ThemeProvider } from '@/components/providers/theme-provider';
// import { ThemeToggle } from '@/components/ui/theme-toggle'; // Unused
// import { LightIcon } from '@/components/ui/icon'; // Unused and restricted path

export default function ComponentBrowserLayout({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname() || ''; // No longer needed for nav links

  /* // Remove complex nav links
  const navLinks = [
    { href: '/debug-tools/ui-components', label: 'Component Browser', icon: 'grid-2' },
    { href: '/debug-tools/ui-components/render-type-comparison', label: 'Server vs Client', icon: 'code-compare' },
    { href: '/debug-tools/ui-components/server-test', label: 'Server Test', icon: 'server' },
    { href: '/debug-tools/ui-components/client-test', label: 'Client Test', icon: 'browser' },
  ];
  */

  return (
    // <ThemeProvider defaultTheme="light">
    // </ThemeProvider>
    <div className="flex flex-col min-h-screen">
      {/* <header className="border-b bg-background">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
             // Link already removed 
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle /> // Toggle removed along with header
          </div>
        </div>
      </header> */}
      <main className="flex-1 pb-12">{children}</main>
    </div>
  );
}
