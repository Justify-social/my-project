'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // For potential View All button
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component path

interface RecentCampaignsSectionProps {
  influencer: InfluencerProfileData;
  // Note: Campaign history is not part of InfluencerProfileData.
  // This data needs to be fetched/passed separately in the future.
  // Example prop: campaignHistory?: Array<{ id: string; brandName: string; campaignName: string; metric: string; iconId: string; }>;
}

// Placeholder data removed

export function RecentCampaignsSection({
  influencer: _influencer, // Prefixed
  // campaignHistory = []
}: RecentCampaignsSectionProps) {
  // Use campaignHistory prop when available
  const campaignsToShow = [
    /* campaignHistory */
  ].slice(0, 2);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Justify Campaigns</CardTitle>
        {/* Optional "View All" button - enable when more data exists */}
        {/* {campaignHistory.length > 2 && <Button variant="ghost" size="sm">View All</Button>} */}
      </CardHeader>
      <CardContent className="space-y-3">
        {campaignsToShow.length > 0 ? (
          campaignsToShow.map(
            (
              campaign: {
                id: string;
                brandName: string;
                campaignName: string;
                metric: string;
                iconId: string;
              } // Added specific type
            ) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/40"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{campaign.brandName}</span>
                  <span className="text-xs text-muted-foreground">{`${campaign.campaignName} • ${campaign.metric}`}</span>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Icon iconId={campaign.iconId} className="h-4 w-4" />
                </Button>
              </div>
            )
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            No recent campaign data available for this influencer.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
