'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { CalendarUpcoming, type CalendarEvent } from '@/components/ui/calendar-upcoming';
import { UpcomingCampaignsTable, type CampaignData } from '@/components/ui/card-upcoming-campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

// --- Removed Mock Data ---
// const mockEvents: CalendarEvent[] = [
//     { id: '1', title: 'Summer Sale Launch', start: new Date(2025, 6, 10), platform: 'Facebook', status: 'Scheduled' },
//     { id: '2', title: 'Influencer Collab Post', start: new Date(2025, 6, 15), end: new Date(2025, 6, 15), platform: 'Instagram', status: 'Live', allDay: true },
//     { id: '3', title: 'Q3 Strategy Meeting', start: new Date(2025, 6, 22, 9, 30), end: new Date(2025, 6, 22, 11, 0), status: 'Confirmed' },
// ];
//
// const mockCampaigns: CampaignData[] = [
//     { id: 'camp1', title: 'Sustainable Futures', platform: 'Instagram', startDate: new Date(2025, 6, 10), status: 'Live', budget: 5000, influencer: { name: 'Eco Warrior', image: '/images/influencers/olivia.jpg' } },
//     { id: 'camp2', title: 'Tech Launchpad', platform: 'YouTube', startDate: new Date(2025, 6, 18), status: 'Scheduled', budget: 12000 },
//     { id: 'camp3', title: 'Artisan Market Promo', platform: 'Facebook', startDate: new Date(2025, 6, 25), endDate: new Date(2025, 7, 5), status: 'Planning' },
// ];
// --- End Removed Mock Data ---

// Removed unused interface ClientDashboardProps
// interface ClientDashboardProps {
// }

// Component definition no longer uses ClientDashboardProps
export default function ClientDashboard() {
  const router = useRouter();
  const { user, error: userError, isLoading: userLoading } = useUser();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !userLoading) {
      const fetchData = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
          // Fetch data from actual API endpoints
          const [eventsResponse, campaignsResponse] = await Promise.all([
            fetch('/api/dashboard/events'), // Using actual endpoint
            fetch('/api/dashboard/campaigns'), // Using actual endpoint
          ]);

          if (!eventsResponse.ok)
            throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
          if (!campaignsResponse.ok)
            throw new Error(`Failed to fetch campaigns: ${campaignsResponse.statusText}`);

          // Parse actual JSON responses
          const eventsData = await eventsResponse.json();
          const campaignsData = await campaignsResponse.json();

          if (eventsData.success && Array.isArray(eventsData.data)) {
            setEvents(eventsData.data);
          } else {
            console.error('Invalid events data format:', eventsData);
            setFetchError((eventsData as any).error || 'Invalid format for events data');
          }

          if (campaignsData.success && Array.isArray(campaignsData.data)) {
            setCampaigns(campaignsData.data);
          } else {
            console.error('Invalid campaigns data format:', campaignsData);
            setFetchError(prev =>
              prev
                ? `${prev}; ${(campaignsData as any).error || 'Invalid format for campaigns data'}`
                : (campaignsData as any).error || 'Invalid format for campaigns data'
            );
          }
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
          setFetchError(error instanceof Error ? error.message : 'Failed to load dashboard data');
          setEvents([]);
          setCampaigns([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else if (!userLoading && !user) {
      setIsLoading(false);
    }
  }, [user, userLoading]);

  const handleCampaignClick = (campaignId: string | number) => {
    router.push(`/campaigns/${campaignId}`);
  };

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
    <div className="space-y-6 font-body">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary font-heading">
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
            {hasEvents ? (
              <CalendarUpcoming events={events} />
            ) : (
              !isLoading && <p className="p-4 text-muted-foreground">No upcoming events.</p>
            )}
          </CardContent>
        </Card>

        {/* Campaigns Table Card */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Upcoming Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            {hasCampaigns ? (
              <UpcomingCampaignsTable campaigns={campaigns} onRowClick={handleCampaignClick} />
            ) : (
              !isLoading && <p className="p-4 text-muted-foreground">No upcoming campaigns.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* // TODO: Add other dashboard sections based on Figma (Influencers, Insights, Health Snapshot) later */}
    </div>
  );
}
