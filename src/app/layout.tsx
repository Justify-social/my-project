import { Inter } from 'next/font/google';
// Remove Auth0 UserProvider
// import { UserProvider } from '@auth0/nextjs-auth0/client';
import ConditionalLayout from '@/components/layouts/conditional-layout'; // Import the new wrapper
import './globals.css';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { extractRouterConfig } from 'uploadthing/server';
import { ourFileRouter } from '@/app/api/uploadthing/core';
import { Suspense } from 'react';
// import { connection } from 'next/server'; // Removed deprecated import
// Import IconContextProvider for consistent icon behavior
// import { IconContextProvider } from '@/components/ui/icon/icon-context'; // Removed context import
import { SidebarProvider } from '@/providers/SidebarProvider';
import { SearchProvider } from '@/providers/SearchProvider';
import { LocalizationProvider } from '@/providers/LocalizationProvider'; // Import the new provider
// Remove the custom AuthStateProvider import
// import { AuthStateProvider } from '@/lib/auth/authCoordinator';
// Import Shadcn Toaster
import { Toaster } from '@/components/ui/toaster';
// Import ClerkProvider and UI components
import { ClerkProvider } from '@clerk/nextjs';
// Remove dynamic import: import dynamic from 'next/dynamic';

// Import diagnostic script for legacy compatibility
// Removed as part of icon system simplification - functionality now built into Icon component

const inter = Inter({ subsets: ['latin'] });

// Remove dynamic import definition
// const DynamicClientAuth = dynamic(...);

export const metadata = {
  title: 'Justify',
  description: 'Measureing the impact of your social campaigns',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
};

// SSR component for UploadThing
async function UTSSR() {
  // await connection(); // Removed usage of deprecated connection
  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {' '}
      {/* Wrap with ClerkProvider */}
      <html lang="en">
        <head>{/* Using local SVG icons - no external scripts needed */}</head>
        <body className={`${inter.className} bg-white`}>
          {/* Wrap with LocalizationProvider */}
          <LocalizationProvider>
            <SidebarProvider>
              <SearchProvider>
                <Suspense>
                  <UTSSR />
                </Suspense>
                {/* Use ConditionalLayout to wrap children */}
                <ConditionalLayout>{children}</ConditionalLayout>
                <Toaster />
              </SearchProvider>
            </SidebarProvider>
          </LocalizationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
