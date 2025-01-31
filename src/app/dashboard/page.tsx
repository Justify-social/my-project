// src/app/dashboard/page.tsx
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Retrieve the session on the server side
  const session = await getSession();

  // Log the session (this log will appear in your terminal)
  console.log('Dashboard session:', session);

  // If there's no session, redirect to the login page
  if (!session) {
    redirect('/api/auth/login');
  }

  // If a session exists, render the dashboard page
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name}!</p>
    </div>
  );
}
