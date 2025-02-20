import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { SidebarProvider } from '@/providers/sidebar-provider'
import Header from '@/components/Navigation/Header'
import Sidebar from '@/components/Navigation/Sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

export const metadata = {
  title: 'Justify',
  description: 'Campaign Management Platform',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <div className="fixed inset-y-0 z-50">
                <Sidebar />
              </div>
              <div className="flex-1 pl-64">
                <div className="flex flex-col min-h-screen">
                  <div className="fixed top-0 right-0 left-64 z-40 bg-white">
                    <Header 
                      companyName="Justify"
                      remainingCredits={100}
                      notificationsCount={3}
                    />
                  </div>
                  <main className="flex-1 pt-16 bg-gray-50 p-6">
                    {children}
                  </main>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
