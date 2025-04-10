'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon/icon";
import { CalendarUpcoming, type CalendarEvent } from "@/components/ui/calendar-upcoming";
import { UpcomingCampaignsTable, type CampaignData } from "@/components/ui/card-upcoming-campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

// (User interface definition can likely be removed if fetched internally)
// interface DashboardUser {
//     id: string;
//     name: string;
//     role: string;
// }

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

// Removed unused interface ClientDashboardProps
// interface ClientDashboardProps {
// }

// Component definition no longer uses ClientDashboardProps
export default function ClientDashboard() {
    const router = useRouter();
    const { user, error: userError, isLoading: userLoading } = useUser();

    // State for fetched data
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Effect to fetch data when user is loaded
    useEffect(() => {
        if (user && !userLoading) {
            const fetchData = async () => {
                setEventsLoading(true);
                setCampaignsLoading(true);
                setFetchError(null);
                try {
                    // Use Promise.all for parallel fetching from API routes
                    const [eventsResponse, campaignsResponse] = await Promise.all([
                        fetch('/api/dashboard/events'),      // TODO: Create this API route
                        fetch('/api/dashboard/campaigns')   // TODO: Create this API route
                    ]);

                    if (!eventsResponse.ok) throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
                    if (!campaignsResponse.ok) throw new Error(`Failed to fetch campaigns: ${campaignsResponse.statusText}`);

                    const eventsData = await eventsResponse.json();
                    const campaignsData = await campaignsResponse.json();

                    // Assuming API returns { success: true, data: [...] }
                    if (eventsData.success && Array.isArray(eventsData.data)) {
                        setEvents(eventsData.data);
                    } else {
                        console.error("Invalid events data format:", eventsData);
                        setFetchError(eventsData.error || 'Invalid format for events data');
                    }

                    if (campaignsData.success && Array.isArray(campaignsData.data)) {
                        setCampaigns(campaignsData.data);
                    } else {
                        console.error("Invalid campaigns data format:", campaignsData);
                        // Append error message if events fetch also failed
                        setFetchError(prev => prev ? `${prev}; ${campaignsData.error || 'Invalid format for campaigns data'}` : campaignsData.error || 'Invalid format for campaigns data');
                    }

                } catch (error) {
                    console.error("Failed to fetch dashboard data:", error);
                    setFetchError(error instanceof Error ? error.message : 'Failed to load dashboard data');
                    setEvents([]); // Clear data on error
                    setCampaigns([]);
                } finally {
                    setEventsLoading(false);
                    setCampaignsLoading(false);
                }
            };

            fetchData();
        } else if (!userLoading && !user) {
            // Handle case where user is definitely not logged in after loading
            setEventsLoading(false);
            setCampaignsLoading(false);
            // Optionally redirect or show logged-out state (AuthCheck likely handles redirect)
        }
    }, [user, userLoading]); // Dependency array

    const handleCampaignClick = (campaignId: string | number) => {
        router.push(`/campaigns/${campaignId}`);
    };

    // Combine loading states
    const isLoading = userLoading || eventsLoading || campaignsLoading;
    const hasEvents = events && events.length > 0;
    const hasCampaigns = campaigns && campaigns.length > 0;

    // Handle Auth0 error
    if (userError) {
        return <div className="p-4 text-red-600">Error loading user: {userError.message}</div>;
    }
    // Handle Fetch error
    if (fetchError) {
        return <div className="p-4 text-red-600">Error loading dashboard data: {fetchError}</div>;
    }

    return (
        <div className="space-y-6 font-work-sans">
            {/* Header Row */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary font-sora">
                    {userLoading ? 'Loading...' : user ? `${user.name}'s Dashboard` : 'Dashboard'}
                </h1>
                <Link href="/campaigns/wizard/step-1" passHref>
                    <Button disabled={userLoading || !user}>
                        <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" />
                        New Campaign
                    </Button>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar Card */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Upcoming Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow p-0">
                        {isLoading ? (
                            <div className="p-4"><LoadingSkeleton className="h-48 w-full" /></div>
                        ) : hasEvents ? (
                            <CalendarUpcoming events={events} />
                        ) : (
                            <p className="p-4 text-muted-foreground">No upcoming events.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Campaigns Table Card */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Upcoming Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow p-0">
                        {isLoading ? (
                            <div className="p-4"><LoadingSkeleton className="h-24 w-full" /></div>
                        ) : (
                            <UpcomingCampaignsTable
                                campaigns={campaigns}
                                onRowClick={handleCampaignClick}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* // TODO: Add other dashboard sections based on Figma (Influencers, Insights, Health Snapshot) later */}
        </div>
    );
} 