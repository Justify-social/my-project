// src/app/dashboard/page.tsx
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

export default async function Dashboard() {
  // Retrieve the session on the server side
  const session = await getSession();

  // If there's no session, redirect to the login page
  if (!session) {
    redirect('/api/auth/login');
  }

  // Extract the user from the session
  const user = session.user; // Ensure this includes the role information

  // Render the dashboard with a sidebar
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar user={user} />
      <main>
        <h1>Dashboard</h1>
        <p>Welcome, {user.name}!</p>
      </main>
    </div>
  );
}
