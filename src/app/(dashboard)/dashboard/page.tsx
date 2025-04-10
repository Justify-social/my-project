// Dynamic content - shorter cache time
export const revalidate = 60; // Revalidate every 60 seconds
export const fetchCache = 'force-cache'; // Use cache but revalidate according to the revalidate option

// Next.js directives and data fetching config
// Next.js requires this specific name for dynamic rendering
export const dynamic = 'force-dynamic'; // Force dynamic rendering

// Regular imports
import { Suspense } from 'react';
import { cookies } from 'next/headers'; // Explicitly import cookies
// Import SSOT LoadingSkeleton
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
// Correct AuthCheck import path using alias
import AuthCheck from '@/components/features/users/AuthCheck';
// Import getSession for server-side auth
import { getSession } from '@auth0/nextjs-auth0';
import ClientDashboard from './ClientDashboard'; // Import the new client component
// Assume these exist and import types
import { getUpcomingEvents, getUpcomingCampaigns } from '@/lib/data/dashboard'; // Hypothetical import
import type { CalendarEvent } from "@/components/ui/calendar-upcoming";
import type { CampaignData } from "@/components/ui/card-upcoming-campaign";

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

  // Fetch dashboard data
  let events: CalendarEvent[] = [];
  let campaigns: CampaignData[] = [];
  try {
    // Use Promise.all for parallel fetching
    [events, campaigns] = await Promise.all([
      getUpcomingEvents(userProp.id), // Fetch events
      getUpcomingCampaigns(userProp.id) // Fetch campaigns
    ]);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    // Handle error appropriately - maybe show an error message to the user
    // For now, we'll proceed with empty arrays
  }

  return (
    <AuthCheck>
      <div className="px-4 md:px-6 py-6 font-work-sans">
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          {/* Pass the mapped user data AND fetched dashboard data */}
          <ClientDashboard user={userProp} events={events} campaigns={campaigns} />
        </Suspense>
      </div>
    </AuthCheck>
  );
}