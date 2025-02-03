// src/app/dashboard/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { getSession } from "../../lib/session"; // correct import

export default async function Dashboard() {
  // Retrieve the session using our helper.
  const session = await getSession();
  console.log("Dashboard session:", session);

  // If no session is found, redirect to login.
  if (!session) {
    redirect("/api/auth/login");
  }

  const user = session.user;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar user={user} />
      <main style={{ padding: "1rem" }}>
        <h1>Dashboard</h1>
        <p>Welcome, {user.name}!</p>
      </main>
    </div>
  );
}
