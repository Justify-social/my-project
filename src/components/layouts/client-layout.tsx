"use client";

import React from "react";
import Header from "@/components/Navigation/Header";
import Sidebar from "@/components/Navigation/Sidebar";
import { SidebarProvider } from "@/providers/sidebar-provider";

interface ClientLayoutProps {
  children: React.ReactNode;
  companyName: string;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children, companyName }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            companyName={companyName}
            remainingCredits={100}
            notificationsCount={3}
          />
          <main className="flex-1 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ClientLayout; 