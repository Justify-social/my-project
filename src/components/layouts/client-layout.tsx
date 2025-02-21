'use client'

import React from "react";
import Header from "@/components/Navigation/Header";
import Sidebar from "@/components/Navigation/Sidebar";
import { SidebarProvider } from "@/providers/SidebarProvider";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white">
        <Header 
          companyName="Justify"
          remainingCredits={100}
          notificationsCount={3}
        />
        <Sidebar />
        <div className="md:ml-64 pt-16">
          <main className="p-4 md:p-6 bg-white min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 