'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { CalendarUpcoming, type CalendarEvent } from '@/components/ui/calendar-upcoming';
import { UpcomingCampaignsTable, type CampaignData } from '@/components/ui/card-upcoming-campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { user, isLoaded } = useUser();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      const fetchData = async () => {
        setIsLoadingData(true);
        setFetchError(null);
        try {
          const [eventsResponse, campaignsResponse] = await Promise.all([
            fetch('/api/dashboard/events'),
            fetch('/api/dashboard/campaigns'),
          ]);

          if (!eventsResponse.ok) {
            const errorData = await eventsResponse.json().catch(() => ({}));
            throw new Error(
              `Failed to fetch events: ${eventsResponse.statusText} (${errorData?.error || 'Unknown error'})`
            );
          }
          if (!campaignsResponse.ok) {
            const errorData = await campaignsResponse.json().catch(() => ({}));
            throw new Error(
              `Failed to fetch campaigns: ${campaignsResponse.statusText} (${errorData?.error || 'Unknown error'})`
            );
          }

          const eventsData = await eventsResponse.json();
          const campaignsData = await campaignsResponse.json();

          if (eventsData.success && Array.isArray(eventsData.data)) {
            setEvents(eventsData.data);
          } else {
            console.error('Invalid events data format:', eventsData);
            setFetchError('Invalid format for events data');
          }

          if (campaignsData.success && Array.isArray(campaignsData.data)) {
            setCampaigns(campaignsData.data);
          } else {
            console.error('Invalid campaigns data format:', campaignsData);
            setFetchError(prev =>
              prev
                ? `${prev}; Invalid format for campaigns data`
                : 'Invalid format for campaigns data'
            );
          }
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
          setFetchError(error instanceof Error ? error.message : 'Failed to load dashboard data');
          setEvents([]);
          setCampaigns([]);
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchData();
    } else if (isLoaded && !user) {
      setIsLoadingData(false);
    }
  }, [isLoaded, user]);

  const handleCampaignClick = (campaignId: string | number) => {
    router.push(`/campaigns/${campaignId}`);
  };

  const hasEvents = events && events.length > 0;
  const hasCampaigns = campaigns && campaigns.length > 0;

  if (fetchError) {
    return <div className="p-4 text-red-600">Error loading dashboard data: {fetchError}</div>;
  }

  if (isLoaded && !user) {
    return <div className="p-4">Redirecting to sign in...</div>;
  }

  return (
    <div className="space-y-6 font-body">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary font-heading">
          {user ? `${user.fullName || user.firstName || 'User'}'s Dashboard` : 'Dashboard'}
        </h1>
        <Link href="/campaigns/wizard/step-1" passHref legacyBehavior>
          <Button disabled={!isLoaded || !user}>
            <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Card - Header Removed */}
        <Card className="h-full flex flex-col">
          {/* <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader> */}
          <CardContent className="flex-grow p-4">
            {isLoadingData ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : hasEvents ? (
              <CalendarUpcoming events={events} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[200px]">
                <Icon
                  iconId="faCalendarDaysLight"
                  className="w-16 h-16 text-muted-foreground mb-4"
                />
                <h3 className="text-xl font-semibold text-primary mb-1">Calendar Clear!</h3>
                <p className="text-muted-foreground">
                  No upcoming campaigns. Why not plan something new?
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaigns Table Card - Header Removed */}
        <Card className="h-full flex flex-col">
          {/* <CardHeader>
            <CardTitle>Upcoming Campaigns</CardTitle>
          </CardHeader> */}
          <CardContent className="flex-grow p-0">
            {isLoadingData ? (
              <div className="p-4 space-y-3">
                {/* Skeleton for table headers */}
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                </div>
                {/* Skeleton for table rows */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-muted last:border-b-0"
                  >
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/5" />
                    <Skeleton className="h-5 w-1/5" />
                    <Skeleton className="h-5 w-1/6" />
                    <Skeleton className="h-5 w-1/6" />
                  </div>
                ))}
              </div>
            ) : (
              // UpcomingCampaignsTable will render its own empty state if campaigns array is empty
              (<UpcomingCampaignsTable campaigns={campaigns} onRowClick={handleCampaignClick} />)
            )}
          </CardContent>
        </Card>
      </div>
      {/* // TODO: Add other dashboard sections based on Figma (Influencers, Insights, Health Snapshot) later */}
    </div>
  );
}
