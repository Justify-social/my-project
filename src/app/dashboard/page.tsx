"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import DashboardContent from "@/components/DashboardContent";
import { Header, Sidebar, MobileMenu } from "@/components/Navigation";
import { SidebarProvider } from "@/providers/sidebar-provider";
import Loading from "../loading";
import Error from "../error";

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <Loading />;
  }

  if (!userId) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <MobileMenu />
          <Suspense fallback={<Loading />}>
            <main className="flex-1 overflow-auto p-4 mt-14 ml-56">
              <DashboardContent />
            </main>
          </Suspense>
        </div>
      </div>
    </SidebarProvider>
  );
}
