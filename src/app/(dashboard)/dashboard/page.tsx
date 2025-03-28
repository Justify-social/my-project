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
// Fix the loading skeleton import
import { TableSkeleton, UIDashboardSkeleton } from '@/components/ui/skeleton';
// Create a custom skeleton component to use as fallback
const DashboardLoadingSkeleton = () => {
  return <div className="animate-pulse space-y-4 p-4">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded"></div>
      ))}
    </div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>;
};

// Fix the import path
import AuthCheck from '@/components/features/users/AuthCheck';

// Dynamic import
const DashboardContentComponent = nextDynamic(() => import('./DashboardContent'), { 
  ssr: true, 
  loading: () => <DashboardLoadingSkeleton /> 
});

export default function Dashboard() {
  // Create a default user object to pass to DashboardContent
  const defaultUser = {
    id: '1',
    name: 'User',
    role: 'user'
  };
  
  return (
    <AuthCheck>
      <div className="px-4 md:px-6 py-6 font-work-sans">
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          <DashboardContentComponent user={defaultUser} />
        </Suspense>
      </div>
    </AuthCheck>);
}