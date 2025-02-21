import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import { Header, Sidebar, MobileMenu } from "@/components/Navigation";
import { SidebarProvider } from "@/providers/sidebar-provider";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Header />
          <MobileMenu />
          <DashboardContent />
        </div>
      </div>
    </SidebarProvider>
  );
}
