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
  // Destructure data from the influencer prop
  const engagementMetricsData = influencer.engagementMetrics;
  const engagementRate = influencer.engagementRate;

  // Extract specific metrics using optional chaining and nullish coalescing
  const avgLikes = engagementMetricsData?.averageLikes;
  const avgComments = engagementMetricsData?.averageComments;
  // Assuming sharesPerPost isn't available in EngagementMetrics type yet
  const sharesPerPost: number | undefined = undefined;

  const engagementRatePercent =
    engagementRate !== undefined && engagementRate !== null
      ? `${(engagementRate * 100).toFixed(2)}%`
      : 'N/A';

  // Placeholder for change - Needs data source definition
  const engagementRateChange = '';

  // Placeholder for graph data - Needs data source definition
  const graphData = null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Campaigns Performance</CardTitle>
        {/* TODO: Add 30D / 3M toggle buttons */}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid - Now uses data from props */}
        <div className="grid grid-cols-3 gap-4 text-center border-b pb-4">
          <div>
            <p className="text-sm text-muted-foreground">Likes</p>
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              <Icon iconId="faHeartSolid" className="h-5 w-5 text-red-500" />
              {avgLikes !== undefined ? formatNumber(avgLikes) : <Skeleton className="h-6 w-12" />}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Comments</p>
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              <Icon iconId="faCommentDotsSolid" className="h-5 w-5" />
              {avgComments !== undefined ? (
                formatNumber(avgComments)
              ) : (
                <Skeleton className="h-6 w-10" />
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Shares / Post</p>
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              <Icon iconId="faPaperPlaneSolid" className="h-5 w-5 text-blue-500" />
              {/* Using N/A directly as sharesPerPost is currently undefined */}
              {sharesPerPost !== undefined ? formatNumber(sharesPerPost) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Engagement Rate & Graph Section - Now uses data */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Audience interaction trend.</p>
          <div className="flex items-baseline gap-2 mb-4">
            <p className="text-3xl font-bold">
              {engagementRatePercent === 'N/A' ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                engagementRatePercent
              )}
            </p>
            {engagementRateChange && (
              <p className="text-sm text-green-600 font-medium">{engagementRateChange}</p>
            )}
          </div>
          {/* Graph Area */}
          <div className="h-60 w-full bg-muted/50 rounded flex items-center justify-center">
            {graphData ? (
              <p className="text-muted-foreground">[Chart Placeholder]</p>
            ) : (
              /* TODO: Render actual chart component using graphData */
              <p className="text-sm text-muted-foreground">Performance trend data not available.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
