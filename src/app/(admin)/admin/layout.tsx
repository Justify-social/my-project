// import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
// Import Clerk auth helper
import { auth } from '@clerk/nextjs/server';

// Define expected structure for sessionClaims metadata
interface SessionClaimsMetadata {
  role?: string;
}
interface CustomSessionClaims {
  metadata?: SessionClaimsMetadata;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Use Clerk's auth() helper
  const { userId, sessionClaims } = await auth();

  // If no user, redirect (should ideally be caught by middleware, but good safety check)
  if (!userId) {
    redirect('/sign-in'); // Redirect to Clerk sign-in
  }

  // Check role in Clerk metadata
  const metadata = (sessionClaims as CustomSessionClaims | null)?.metadata;
  const userRole = metadata?.role;

  // Redirect if not super_admin
  if (userRole !== 'super_admin') {
    console.warn(`Non-admin access attempt to /admin by user ${userId}`);
    redirect('/'); // Redirect non-admins to homepage
  }

  // User is authenticated and has the correct role
  return (
    <div className="min-h-screen bg-white font-body">
      <div className="max-w-7xl mx-auto py-6 font-body">{children}</div>
    </div>
  );
}
