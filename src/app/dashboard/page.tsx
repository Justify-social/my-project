// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "../../lib/session"; // your session helper
import DashboardContent from "./DashboardContent";

export default async function Dashboard() {
  // Retrieve the session using our helper.
  const session = await getSession();
  console.log("Dashboard session:", session);

  // If no session is found, redirect to login.
  if (!session) {
    redirect("/api/auth/login");
  }

  const user = session.user;

  // Render the client component and pass the user data.
  return <DashboardContent user={user} />;
}
