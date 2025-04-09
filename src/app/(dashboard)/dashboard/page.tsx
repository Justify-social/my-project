// Dynamic content - shorter cache time
export const revalidate = 60; // Revalidate every 60 seconds
export const fetchCache = 'force-cache'; // Use cache but revalidate according to the revalidate option

// Next.js directives and data fetching config
// Next.js requires this specific name for dynamic rendering
export const dynamic = 'force-dynamic'; // Force dynamic rendering

// Regular imports
import { Suspense } from 'react';
// Import dynamic separately to avoid name conflicts with export const dynamic
import { default as nextDynamic } from 'next/dynamic';
// Import SSOT LoadingSkeleton
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
// Correct AuthCheck import path using alias
import AuthCheck from '@/components/features/users/AuthCheck';
// Import getSession for server-side auth
import { getSession } from '@auth0/nextjs-auth0';

// Define the skeleton fallback using the imported SSOT component
const DashboardLoadingSkeleton = () => {
  return <div className="animate-pulse space-y-4 p-4">
    <LoadingSkeleton className="h-8 w-3/4" />
    <LoadingSkeleton className="h-4 w-full" />
    <LoadingSkeleton className="h-4 w-5/6" />
    <LoadingSkeleton className="h-10 w-1/2" />
  </div>;
};

// Define expected user prop type for DashboardContentComponent
// Make name match expected type (string, not nullable)
interface DashboardUser {
  id: string;
  name: string;
  role: string;
}

// Dynamic import - Correct path to DashboardContent and use correct skeleton
const DashboardContentComponent = nextDynamic(() => import('./DashboardContent'), {
  ssr: false, // Disable SSR for client-side charting library
  loading: () => <DashboardLoadingSkeleton />
});

// Make the component async to fetch session
export default async function Dashboard() {
  const session = await getSession();
  const userClaims = session?.user;

  if (!userClaims?.sub) { // Check for sub claim (user ID)
    return (
      <AuthCheck>
        <div className="p-6">Loading user...</div>
      </AuthCheck>
    );
  }

  // Map claims to the expected user prop structure
  const roles = (userClaims['https://justify.social/roles'] as string[]) || [];
  const userProp: DashboardUser = {
    id: userClaims.sub, // Use sub for ID
    name: userClaims.name ?? 'Unknown User', // Provide fallback for name
    role: roles.includes('super_admin') ? 'SUPER_ADMIN' : roles.includes('ADMIN') ? 'ADMIN' : 'USER' // Example role derivation
  };

  return (
    <AuthCheck>
      <div className="px-4 md:px-6 py-6 font-work-sans">
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          {/* Pass the mapped user data */}
          <DashboardContentComponent user={userProp} />
        </Suspense>
      </div>
    </AuthCheck>
  );
}