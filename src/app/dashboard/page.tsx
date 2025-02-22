import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  return <DashboardContent user={session.user} />;
}
