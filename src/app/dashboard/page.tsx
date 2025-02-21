import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import { Header, Sidebar } from "@/components/Navigation";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header />
        <DashboardContent />
      </div>
    </div>
  );
}
