import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import ClientLayout from '@/components/layouts/client-layout'
import './globals.css'
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/lib/uploadthing";
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from '@/components/ui/toast';
import { FormStyleReset } from '@/components/ui';

// Import diagnostic script for legacy compatibility
import '@/lib/icon-diagnostic';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Justify',
  description: 'Measureing the impact of your social campaigns',
  icons: {
    icon: '/favicon.png',
  },
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
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <Toaster />
          <ToastProvider>
            <FormStyleReset />
            <ClientLayout>
              <main className="min-h-screen bg-gray-100">
                {children}
              </main>
            </ClientLayout>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  )
}