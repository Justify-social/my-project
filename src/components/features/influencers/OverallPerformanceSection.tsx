'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon/icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OverallPerformanceSectionProps {
  influencer: InfluencerProfileData;
}

// Helper to format large numbers into k/m format
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return 'N/A';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

// Helper to format percentages
const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toFixed(1)}%`;
};

// Helper function to get performance color based on percentile
const getPerformanceColor = (percentile: number): string => {
  if (percentile >= 80) return 'text-success';
  if (percentile >= 60) return 'text-interactive';
  if (percentile >= 40) return 'text-warning';
  return 'text-destructive';
};

export function OverallPerformanceSection({ influencer }: OverallPerformanceSectionProps) {
  // Extract data from existing influencer object
  const engagementMetricsData = influencer.engagementMetrics;
  const engagementRate = influencer.engagementRate;
  const avgLikes = engagementMetricsData?.averageLikes;
  const avgComments = engagementMetricsData?.averageComments;
  const avgViews = engagementMetricsData?.averageViews;

  // Extract comprehensive analytics from InsightIQ API response if available
  const profileData = (influencer as any).profile || (influencer as any).insightiq?.profile;

  // Advanced metrics from InsightIQ API
  const averageReelsViews = profileData?.average_reels_views;
  const contentCount = profileData?.content_count;
  const sponsoredPostsPerformance = profileData?.sponsored_posts_performance;
  const hiddenLikesPercentage = profileData?.posts_hidden_likes_percentage_value;
  const accountType = profileData?.platform_account_type;
  const demographics = {
    gender: profileData?.gender,
    age_group: profileData?.age_group,
    language: profileData?.language,
  };

  // Performance benchmarks (would come from InsightIQ API)
  const industryBenchmarks = {
    engagement_rate_percentile: profileData?.engagement_rate_percentile,
    follower_growth_percentile: profileData?.follower_growth_percentile,
    content_quality_score: profileData?.content_quality_score,
  };

  // Platform-specific metrics (would come from InsightIQ API)
  const platformMetrics = {
    story_completion_rate: profileData?.story_completion_rate,
    reel_shares: profileData?.reel_shares,
    profile_visits: profileData?.profile_visits_monthly,
  };

  const engagementRatePercent =
    engagementRate !== undefined && engagementRate !== null
      ? `${(engagementRate * 100).toFixed(2)}%`
      : 'N/A';

  return (
    <div className="space-y-6">
      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Likes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Avg. Likes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Icon iconId="faHeartSolid" className="h-5 w-5 text-destructive" />
              <span className="text-xl font-bold">
                {avgLikes !== undefined ? formatNumber(avgLikes) : 'N/A'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per post</p>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Avg. Comments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Icon iconId="faCommentDotsSolid" className="h-5 w-5 text-interactive" />
              <span className="text-xl font-bold">
                {avgComments !== undefined ? formatNumber(avgComments) : 'N/A'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per post</p>
          </CardContent>
        </Card>

        {/* Views */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Avg. Views</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Icon iconId="faEyeSolid" className="h-5 w-5 text-accent" />
              <span className="text-xl font-bold">
                {avgViews !== undefined
                  ? formatNumber(avgViews)
                  : averageReelsViews !== undefined
                    ? formatNumber(averageReelsViews)
                    : 'N/A'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per post</p>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Icon iconId="faBoltSolid" className="h-5 w-5 text-warning" />
              <span className="text-xl font-bold">{engagementRatePercent}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon iconId="faFileLight" className="h-4 w-4 text-primary" />
              Content Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Posts</span>
                <span className="text-lg font-bold">{formatNumber(contentCount)}</span>
              </div>
              {accountType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <Badge variant="outline">{accountType}</Badge>
                </div>
              )}
              {hiddenLikesPercentage !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hidden Likes</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(hiddenLikesPercentage)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {industryBenchmarks &&
          (industryBenchmarks.engagement_rate_percentile ||
            industryBenchmarks.follower_growth_percentile) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon iconId="faChartBarLight" className="h-4 w-4 text-primary" />
                  Performance Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {industryBenchmarks.engagement_rate_percentile && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Engagement Rank</span>
                        <span
                          className={`text-sm font-bold ${getPerformanceColor(industryBenchmarks.engagement_rate_percentile)}`}
                        >
                          Top {100 - industryBenchmarks.engagement_rate_percentile}%
                        </span>
                      </div>
                      <Progress
                        value={industryBenchmarks.engagement_rate_percentile}
                        className="h-2"
                      />
                    </div>
                  )}

                  {industryBenchmarks.follower_growth_percentile && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Growth Rank</span>
                        <span
                          className={`text-sm font-bold ${getPerformanceColor(industryBenchmarks.follower_growth_percentile)}`}
                        >
                          Top {100 - industryBenchmarks.follower_growth_percentile}%
                        </span>
                      </div>
                      <Progress
                        value={industryBenchmarks.follower_growth_percentile}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {industryBenchmarks?.content_quality_score && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon iconId="faStarLight" className="h-4 w-4 text-primary" />
                Content Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {industryBenchmarks.content_quality_score}
                  <span className="text-lg text-muted-foreground">/10</span>
                </div>
                <Badge variant="secondary" className="mb-3">
                  {industryBenchmarks.content_quality_score >= 8
                    ? 'Excellent'
                    : industryBenchmarks.content_quality_score >= 6
                      ? 'Good'
                      : 'Average'}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <p className="text-xs text-muted-foreground cursor-help">
                        Based on engagement, reach & audience retention
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Content quality score considers engagement rates, audience retention,
                        content variety, and posting consistency.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sponsored Content Performance */}
      {(sponsoredPostsPerformance ||
        platformMetrics?.story_completion_rate ||
        platformMetrics?.profile_visits) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon iconId="faChartLineLight" className="h-5 w-5 text-primary" />
              Sponsored Content Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sponsoredPostsPerformance && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-success mb-2">
                    +{((sponsoredPostsPerformance - 1) * 100).toFixed(0)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Better than organic posts</p>
                </div>
              )}

              {platformMetrics?.story_completion_rate && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-interactive mb-2">
                    {formatPercentage(platformMetrics.story_completion_rate)}
                  </div>
                  <p className="text-sm text-muted-foreground">Story completion rate</p>
                </div>
              )}

              {platformMetrics?.profile_visits && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-2">
                    {formatNumber(platformMetrics.profile_visits)}
                  </div>
                  <p className="text-sm text-muted-foreground">Monthly profile visits</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reels Performance (Platform specific) */}
      {(averageReelsViews || platformMetrics?.reel_shares) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon iconId="faVideoLight" className="h-5 w-5 text-primary" />
              Reels & Video Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {averageReelsViews && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Reel Views</p>
                    <p className="text-xl font-bold">{formatNumber(averageReelsViews)}</p>
                  </div>
                  <Icon iconId="faPlayLight" className="h-8 w-8 text-destructive" />
                </div>
              )}

              {platformMetrics?.reel_shares && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Reel Shares</p>
                    <p className="text-xl font-bold">{formatNumber(platformMetrics.reel_shares)}</p>
                  </div>
                  <Icon iconId="faShareLight" className="h-8 w-8 text-success" />
                </div>
              )}

              {avgViews && averageReelsViews && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">View-to-Like Ratio</p>
                    <p className="text-xl font-bold">
                      {avgLikes && avgViews ? ((avgLikes / avgViews) * 100).toFixed(1) : 'N/A'}%
                    </p>
                  </div>
                  <Icon iconId="faThumbsUpLight" className="h-8 w-8 text-interactive" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Creator Demographics Summary */}
      {(demographics.gender || demographics.age_group || demographics.language || accountType) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon iconId="faUserLight" className="h-5 w-5 text-primary" />
              Creator Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {demographics.gender && <Badge variant="outline">{demographics.gender}</Badge>}
                {demographics.age_group && (
                  <Badge variant="outline">{demographics.age_group}</Badge>
                )}
                {demographics.language && <Badge variant="outline">{demographics.language}</Badge>}
              </div>
              {accountType && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Account Classification</p>
                  <p className="font-semibold">{accountType} Account</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
