'use client'

import { SidebarProvider } from '@/components/providers/sidebar-provider'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
} 