// src/app/dashboard/page.tsx
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }

  return <DashboardContent user={session.user} />;
}
