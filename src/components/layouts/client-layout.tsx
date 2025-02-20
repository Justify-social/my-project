'use client'

import { SidebarProvider } from '@/providers/sidebar-provider'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white">
        <Header 
          companyName="Justify"
          remainingCredits={100}
          notificationsCount={0}
        />
        <Sidebar />
        <main className="md:ml-64 pt-16 bg-white">
          <div className="h-full w-full bg-white">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
} 