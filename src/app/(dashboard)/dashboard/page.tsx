// Dynamic content - shorter cache time
// export const revalidate = 60; // Revalidate every 60 seconds
// export const fetchCache = 'force-cache'; // Use cache but revalidate according to the revalidate option

// Next.js directives and data fetching config
// Next.js requires this specific name for dynamic rendering
// export const dynamic = 'force-dynamic'; // Force dynamic rendering

// Regular imports
import { Suspense } from 'react';
// Removed cookies import
// Import SSOT LoadingSkeleton
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
// Correct AuthCheck import path using alias
import AuthCheck from '@/components/features/users/AuthCheck';
// Removed getSession import
import ClientDashboard from './ClientDashboard'; // Import the new client component
// Removed data fetching imports and types if no longer passed as props
// import { getUpcomingEvents, getUpcomingCampaigns } from '@/lib/data/dashboard'; // Hypothetical import
// import type { CalendarEvent } from "@/components/ui/calendar-upcoming";
// import type { CampaignData } from "@/components/ui/card-upcoming-campaign";
// Removed LoadingSpinner import

// Removed DashboardLoadingSkeleton definition

// Component is no longer async, doesn't fetch data
export default function Dashboard() {
  // Removed session fetching and data fetching logic

  return (
    <AuthCheck>
      {' '}
      {/* AuthCheck likely handles redirect if not authenticated */}
      <div className="px-4 md:px-6 py-6 font-body">
        {/* Use LoadingSkeleton as the fallback */}
        <Suspense
          fallback={
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
              <LoadingSkeleton />
            </div>
          }
        >
          {/* Render ClientDashboard without passing user/events/campaigns props */}
          <ClientDashboard />
        </Suspense>
      </div>
    </AuthCheck>
  );
}
