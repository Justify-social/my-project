import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import ClientLayout from '@/components/layouts/client-layout'
import './globals.css'
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/lib/uploadthing";
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from '@/components/ui/toast';

// CRITICAL: Import Font Awesome CSS before config
import '@fortawesome/fontawesome-svg-core/styles.css';
// THEN configure Font Awesome
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; // Prevent Font Awesome from auto-adding CSS

// Import the Pro Kit for global access
import '@awesome.me/kit-3e2951e127';

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
        {/* Font Awesome Kit script - with proper crossOrigin attribute */}
        <script 
          src="https://kit.fontawesome.com/3e2951e127.js" 
          crossOrigin="anonymous"
          key="fontawesome-kit"
        />
      </head>
      <body className={`${inter.className} bg-white`}>
        <UserProvider>
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <Toaster />
          <ToastProvider>
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