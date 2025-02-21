"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardContent from "@/components/DashboardContent";
import { Header, Sidebar, MobileMenu } from "@/components/Navigation";
import { SidebarProvider } from "@/providers/sidebar-provider";

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <MobileMenu />
          <main className="flex-1 overflow-auto p-6 mt-16 ml-64">
            <DashboardContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
