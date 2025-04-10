'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon/icon";
import { CalendarUpcoming, type CalendarEvent } from "@/components/ui/calendar-upcoming";
import { UpcomingCampaignsTable, type CampaignData } from "@/components/ui/card-upcoming-campaign";

// Define the skeleton fallback using the imported SSOT component
// (Could be moved to a shared file)
const DashboardLoadingSkeleton = () => {
    return <div className="animate-pulse space-y-4 p-4">
        <LoadingSkeleton className="h-8 w-3/4" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-5/6" />
        <LoadingSkeleton className="h-10 w-1/2" />
    </div>;
};

// Define expected user prop type
// (Could be moved to a shared file)
interface DashboardUser {
    id: string;
    name: string;
    role: string;
}

// Update props to include fetched data
interface ClientDashboardProps {
    user: DashboardUser;
    events: CalendarEvent[]; // Add events prop
    campaigns: CampaignData[]; // Add campaigns prop
}

// Removed dynamic import wrapper
// const DashboardContentComponent = nextDynamic(() => import('./DashboardContent'), {
//     ssr: false, // Disable SSR for client-side charting library
//     loading: () => <DashboardLoadingSkeleton />
// });

// --- Mock Data (Replace with actual data fetching/props) ---
const mockEvents: CalendarEvent[] = [
    { id: '1', title: 'Summer Sale Launch', start: new Date(2025, 6, 10), platform: 'Facebook', status: 'Scheduled' },
    { id: '2', title: 'Influencer Collab Post', start: new Date(2025, 6, 15), end: new Date(2025, 6, 15), platform: 'Instagram', status: 'Live', allDay: true },
    { id: '3', title: 'Q3 Strategy Meeting', start: new Date(2025, 6, 22, 9, 30), end: new Date(2025, 6, 22, 11, 0), status: 'Confirmed' },
];

const mockCampaigns: CampaignData[] = [
    { id: 'camp1', title: 'Sustainable Futures', platform: 'Instagram', startDate: new Date(2025, 6, 10), status: 'Live', budget: 5000, influencer: { name: 'Eco Warrior', image: '/images/influencers/olivia.jpg' } },
    { id: 'camp2', title: 'Tech Launchpad', platform: 'YouTube', startDate: new Date(2025, 6, 18), status: 'Scheduled', budget: 12000 },
    { id: 'camp3', title: 'Artisan Market Promo', platform: 'Facebook', startDate: new Date(2025, 6, 25), endDate: new Date(2025, 7, 5), status: 'Planning' },
];
// --- End Mock Data ---

export default function ClientDashboard({ user, events, campaigns }: ClientDashboardProps) {
    const router = useRouter();

    // Handle clicks for navigation (e.g., from the table)
    const handleCampaignClick = (campaignId: string | number) => {
        router.push(`/campaigns/${campaignId}`);
    };

    // TODO: Add loading/empty states based on props
    const isLoading = false; // Replace with actual loading state if fetching is re-introduced client-side later
    const hasEvents = events && events.length > 0;
    const hasCampaigns = campaigns && campaigns.length > 0;

    return (
        <div className="space-y-6 font-work-sans">
            {/* Header Row */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary font-sora">Dashboard</h1>
                <Link href="/campaigns/wizard/step-1" passHref>
                    <Button>
                        <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" />
                        New Campaign
                    </Button>
                </Link>
            </div>

            {/* Main Content Grid (Simplified 2-column) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column 1: Upcoming Calendar */}
                <div>
                    {/* Consider adding a Card wrapper for consistent styling */}
                    {/* <Card> <CardHeader><CardTitle>Upcoming Schedule</CardTitle></CardHeader> <CardContent> ... </CardContent> </Card> */}
                    {isLoading ? (
                        <p>Loading Calendar...</p> // Replace with Skeleton if needed
                    ) : hasEvents ? (
                        <CalendarUpcoming events={events} onEventClick={handleCampaignClick} />
                    ) : (
                        <p className="text-muted-foreground p-4 border rounded-md">No upcoming events.</p> // Empty state
                    )}
                </div>

                {/* Column 2: Upcoming Campaigns Table */}
                <div>
                    {isLoading ? (
                        <p>Loading Campaigns...</p> // Replace with TableSkeleton if needed
                    ) : hasCampaigns ? (
                        <UpcomingCampaignsTable
                            campaigns={campaigns}
                            onRowClick={handleCampaignClick}
                            title="Upcoming Campaigns"
                        />
                    ) : (
                        <p className="text-muted-foreground p-4 border rounded-md">No upcoming campaigns.</p> // Empty state
                    )}
                </div>
            </div>

            {/* // TODO: Add other dashboard sections based on Figma (Influencers, Insights, Health Snapshot) later */}
        </div>
    );
} 