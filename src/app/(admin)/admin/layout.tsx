import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const roles = session?.user?.roles || [];

  if (!roles.includes('super_admin')) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-white font-body">
      <div className="max-w-7xl mx-auto py-6 font-body">{children}</div>
    </div>
  );
}
