import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import ClientLayout from '@/components/layouts/client-layout'
import './globals.css'
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from '@/components/ui/toast';
import { FormStyleReset } from '@/components/ui';
import dynamic from 'next/dynamic';

// Import diagnostic script for legacy compatibility
import '@/lib/icon-diagnostic';

// Dynamically import the ErrorBoundary to avoid SSR issues
const ErrorBoundary = dynamic(() => import('@/components/ErrorBoundary'), { ssr: false });

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
          <Toaster />
          <ToastProvider>
            <FormStyleReset />
            <ErrorBoundary>
              <ClientLayout>
                <main className="min-h-screen bg-gray-100">
                  {children}
                </main>
              </ClientLayout>
            </ErrorBoundary>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  )
}