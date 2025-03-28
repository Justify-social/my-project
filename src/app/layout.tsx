import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import ClientLayout from '@/components/layouts/client-layout'
import './globals.css'
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from '@/components/ui/feedback';
import { FormStyleReset } from '@/components/ui';
import { Suspense } from 'react';
import { connection } from 'next/server';

// Import diagnostic script for legacy compatibility
import '@/lib/icon-diagnostic';

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
          <ToastProvider>
            <Suspense>
              <UTSSR />
            </Suspense>
            <ClientLayout>
              <main className="min-h-screen bg-gray-100">
                {children}
              </main>
            </ClientLayout>
            <Toaster />
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  )
}