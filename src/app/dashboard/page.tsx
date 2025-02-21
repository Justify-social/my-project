"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardContent from "@/components/DashboardContent";
import { Header, Sidebar, MobileMenu } from "@/components/Navigation";
import { SidebarProvider } from "@/providers/sidebar-provider";

export default function DashboardPage() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Debug mounting
    console.log("Dashboard Mount:", {
      isLoaded,
      userId,
      isSignedIn
    });
  }, [isLoaded, userId, isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      setIsInitialized(true);
      if (!userId) {
        console.log("Redirecting to sign-in...");
        router.push("/sign-in");
      }
    }
  }, [isLoaded, userId, router]);

  if (!isInitialized || !isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <MobileMenu />
          <main className="flex-1 overflow-auto p-4 mt-14 ml-56">
            <DashboardContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
