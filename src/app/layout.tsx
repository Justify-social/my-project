import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import ClientLayout from '@/components/layouts/client-layout'
import './globals.css'
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Suspense } from 'react';
import { connection } from 'next/server';
// Import IconContextProvider for consistent icon behavior
// import { IconContextProvider } from '@/components/ui/icon/icon-context'; // Removed context import
import { SidebarProvider } from '@/providers/SidebarProvider';
import { SearchProvider } from '@/providers/SearchProvider';
// Import the new auth state provider
import { AuthStateProvider } from '@/lib/auth/authCoordinator';
// Import Shadcn Toaster
import { Toaster } from "@/components/ui/toaster";

// Import diagnostic script for legacy compatibility
// Removed as part of icon system simplification - functionality now built into Icon component

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Justify',
  description: 'Measureing the impact of your social campaigns',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' }
    ],
  },
}

// SSR component for UploadThing
async function UTSSR() {
  await connection();
  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Using local SVG icons - no external scripts needed */}
      </head>
      <body className={`${inter.className} bg-white`}>
        <UserProvider>
          {/* Add AuthStateProvider as the SSOT for auth state */}
          <AuthStateProvider>
            {/* // Removed IconContextProvider wrapper
            <IconContextProvider 
              defaultVariant="light" 
              defaultSize="md"
              iconBasePath="/icons"
            >
            */}
            <SidebarProvider>
              <SearchProvider>
                {/* Remove NotificationSonner element */}
                {/* <NotificationSonner /> */}
                <Suspense>
                  <UTSSR />
                </Suspense>
                <ClientLayout>
                  {children}
                </ClientLayout>
                {/* Render Shadcn Toaster */}
                <Toaster />
              </SearchProvider>
            </SidebarProvider>
            {/* </IconContextProvider> */}
          </AuthStateProvider>
        </UserProvider>
      </body>
    </html>
  )
}