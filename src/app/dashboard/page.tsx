import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/api/auth/login');
  }

  // Pass only the necessary user data
  const userData = {
    name: session.user.name,
    email: session.user.email,
    picture: session.user.picture
  };

  return <DashboardContent user={userData} />;
}
