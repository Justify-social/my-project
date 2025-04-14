'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon/icon';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { cn } from '@/lib/utils';

interface InfluencerData {
  totalInfluencers: number;
  averageEngagement: number;
}

export default function InfluencerCard({ className }: { className?: string }) {
  const [data, setData] = useState<InfluencerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInfluencerData() {
      setLoading(true);
      setError(null);
      // Bypass API call in test mode
      if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
        await new Promise(res => setTimeout(res, 300)); // Simulate delay
        setData({ totalInfluencers: 5, averageEngagement: 7.5 });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/influencers'); // Replace with actual endpoint if different
        if (!res.ok) {
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        const jsonData = await res.json();
        // TODO: Add Zod validation for API response data
        setData(jsonData as InfluencerData);
      } catch (err: any) {
        console.error('Error fetching influencer data:', err);
        setError(err.message || 'Failed to load influencer metrics.');
        // Keep existing placeholder data logic or remove?
        // setData({ totalInfluencers: 5, averageEngagement: 7.5 });
        setData(null); // Set data to null on error
      } finally {
        setLoading(false);
      }
    }
    fetchInfluencerData();
  }, []);

  if (loading) {
    // Use Skeleton loaders for better UX
    return (
      <Card className={cn("p-4", className)}>
        <CardHeader className="p-2">
          <LoadingSkeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="p-2 space-y-3">
          <LoadingSkeleton className="h-5 w-1/2" />
          <LoadingSkeleton className="h-5 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-4 border-destructive/50 bg-destructive/5", className)}>
        <CardHeader className="p-2">
          <CardTitle className="text-lg text-destructive flex items-center">
            <Icon iconId="faExclamationTriangleLight" className="h-4 w-4 mr-2" /> Error Loading Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    // Handles the case where API returns no data successfully
    return (
      <Card className={cn("p-4", className)}>
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Influencer Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <p className="text-sm text-muted-foreground italic">No influencer data available.</p>
        </CardContent>
      </Card>
    )
  }

  // Success state
  return (
    <Card className={cn("p-4", className)}>
      <CardHeader className="p-2 mb-2">
        {/* Keep test ID if needed, use theme color */}
        <CardTitle data-testid="influencer-card-header" className="text-lg font-semibold text-primary">
          Influencer Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        {/* Use theme colors and icons */}
        <div className="flex items-center">
          <Icon iconId="faUsersLight" className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-secondary mr-2">Total Influencers:</span>
          <span className="font-semibold text-primary">
            {data.totalInfluencers}
          </span>
        </div>
        <div className="flex items-center">
          <Icon iconId="faThumbsUpLight" className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-secondary mr-2">Avg. Engagement:</span>
          <span className="font-semibold text-primary">
            {data.averageEngagement.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
