'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component path
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
// TODO: Import charting library (e.g., Recharts)

interface OverallPerformanceSectionProps {
  influencer: InfluencerProfileData;
}

// Helper to format large numbers into k/m format
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return 'N/A';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toString();
};

export function OverallPerformanceSection({ influencer }: OverallPerformanceSectionProps) {
  const engagementMetricsData = influencer.engagementMetrics;
  const engagementRate = influencer.engagementRate;
  const avgLikes = engagementMetricsData?.averageLikes;
  const avgComments = engagementMetricsData?.averageComments;
  const sharesPerPost: number | undefined = undefined; // Still undefined

  const engagementRatePercent =
    engagementRate !== undefined && engagementRate !== null
      ? `${(engagementRate * 100).toFixed(2)}%`
      : 'N/A';

  // Placeholder for graph data (no longer displayed in this refactor)
  // const graphData = null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Performance</CardTitle> {/* Simplified Title */}
      </CardHeader>
      <CardContent>
        {/* Combined Metrics Grid */}
        {/* Changed to grid-cols-4 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center py-4">
          {/* Likes */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Likes / Post</p>
            {/* Ensure flex, items-center, justify-center for vertical alignment */}
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Icon iconId="faHeartSolid" className="h-6 w-6 text-red-500" />
              {avgLikes !== undefined ? formatNumber(avgLikes) : <Skeleton className="h-6 w-12" />}
            </div>
          </div>
          {/* Comments */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Comments / Post</p>
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Icon iconId="faCommentDotsSolid" className="h-6 w-6" />
              {avgComments !== undefined ? (
                formatNumber(avgComments)
              ) : (
                <Skeleton className="h-6 w-10" />
              )}
            </div>
          </div>
          {/* Shares */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Shares / Post</p>
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Icon iconId="faPaperPlaneSolid" className="h-6 w-6 text-interactive" />{' '}
              {/* Use interactive color */}
              {sharesPerPost !== undefined ? formatNumber(sharesPerPost) : 'N/A'}
            </div>
          </div>
          {/* Engagement Rate */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
            {/* Note: No icon typically associated with overall Engagement Rate */}
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              {engagementRatePercent === 'N/A' ? (
                <Skeleton className="h-6 w-14" />
              ) : (
                <span>{engagementRatePercent}</span>
              )}
            </div>
          </div>
        </div>

        {/* Optional: Graph Area can be added back here if needed */}
        {/* 
        <div className="h-60 w-full bg-muted/50 rounded flex items-center justify-center mt-6">
           <p className="text-sm text-muted-foreground">Performance trend data not available.</p>
        </div> 
        */}
      </CardContent>
    </Card>
  );
}
