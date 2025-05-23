'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon/icon';

interface DemographicsSectionProps {
  influencer: InfluencerProfileData;
}

// Helper function to format percentages
const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(1)}%`;
};

// Helper function to format large numbers
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return 'N/A';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

export function DemographicsSection({ influencer }: DemographicsSectionProps) {
  // Extract actual demographic data from InsightIQ API response if available
  const profileData = (influencer as any).profile || (influencer as any).insightiq?.profile;
  const audienceData = (influencer as any).audience || (influencer as any).insightiq?.audience;

  // Get gender/age distribution from API
  const genderAgeDistribution = audienceData?.gender_age_distribution;
  const reputationHistory = profileData?.reputation_history;

  // Extract basic profile demographics from API
  const profileDemographics = {
    gender: profileData?.gender,
    age_group: profileData?.age_group,
    language: profileData?.language,
    location: profileData?.location,
  };

  // If no demographic data is available, show informative message
  if (!profileData && !audienceData && !genderAgeDistribution) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Icon iconId="faUsersLight" className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Demographics & Growth Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive demographic analytics from InsightIQ are not available in sandbox
                mode.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This section will show audience gender/age breakdown, geographic distribution,
                growth trends, and historical performance data when connected to production
                InsightIQ API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate growth metrics if reputation history is available
  let followerGrowth = 0;
  let likesGrowth = 0;
  let currentFollowers = 0;
  let previousFollowers = 0;
  let currentLikes = 0;
  let previousLikes = 0;

  if (reputationHistory && reputationHistory.length >= 2) {
    currentFollowers = reputationHistory[0]?.follower_count || 0;
    previousFollowers = reputationHistory[1]?.follower_count || 0;
    followerGrowth =
      previousFollowers > 0
        ? ((currentFollowers - previousFollowers) / previousFollowers) * 100
        : 0;

    currentLikes = reputationHistory[0]?.average_likes || 0;
    previousLikes = reputationHistory[1]?.average_likes || 0;
    likesGrowth = previousLikes > 0 ? ((currentLikes - previousLikes) / previousLikes) * 100 : 0;
  }

  // Aggregate gender data for overview if available
  const femalePercentage =
    genderAgeDistribution
      ?.filter((item: any) => item.gender === 'FEMALE')
      ?.reduce((sum: number, item: any) => sum + (item.value || 0), 0) || 0;

  const malePercentage =
    genderAgeDistribution
      ?.filter((item: any) => item.gender === 'MALE')
      ?.reduce((sum: number, item: any) => sum + (item.value || 0), 0) || 0;

  const otherPercentage = Math.max(0, 100 - femalePercentage - malePercentage);

  return (
    <div className="space-y-6">
      {/* Creator Profile Demographics */}
      {profileDemographics &&
        (profileDemographics.gender ||
          profileDemographics.age_group ||
          profileDemographics.language ||
          profileDemographics.location) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon iconId="faUserLight" className="h-5 w-5 text-primary" />
                Creator Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profileDemographics.gender && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Gender</p>
                    <Badge variant="outline" className="text-sm font-semibold">
                      {profileDemographics.gender}
                    </Badge>
                  </div>
                )}
                {profileDemographics.age_group && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Age Group</p>
                    <Badge variant="outline" className="text-sm font-semibold">
                      {profileDemographics.age_group}
                    </Badge>
                  </div>
                )}
                {profileDemographics.language && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Language</p>
                    <Badge variant="outline" className="text-sm font-semibold">
                      {profileDemographics.language}
                    </Badge>
                  </div>
                )}
                {profileDemographics.location && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Location</p>
                    <div className="space-y-1">
                      {profileDemographics.location.city && (
                        <Badge variant="secondary" className="text-xs block">
                          {profileDemographics.location.city}
                        </Badge>
                      )}
                      {profileDemographics.location.country && (
                        <Badge variant="outline" className="text-xs block">
                          {profileDemographics.location.country}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Audience Gender Overview */}
      {genderAgeDistribution &&
        genderAgeDistribution.length > 0 &&
        (femalePercentage > 0 || malePercentage > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon iconId="faChartPieLight" className="h-5 w-5 text-primary" />
                Audience Gender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">
                    {formatPercentage(femalePercentage)}
                  </div>
                  <p className="text-sm text-muted-foreground">Female</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-interactive mb-2">
                    {formatPercentage(malePercentage)}
                  </div>
                  <p className="text-sm text-muted-foreground">Male</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-muted-foreground mb-2">
                    {formatPercentage(otherPercentage)}
                  </div>
                  <p className="text-sm text-muted-foreground">Other</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Detailed Age & Gender Breakdown */}
      {genderAgeDistribution && genderAgeDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon iconId="faChartBarLight" className="h-5 w-5 text-primary" />
              Age & Gender Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {genderAgeDistribution.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge
                      variant="outline"
                      className={
                        item.gender === 'FEMALE'
                          ? 'border-accent/30 text-accent'
                          : 'border-interactive/30 text-interactive'
                      }
                    >
                      {item.gender}
                    </Badge>
                    <span className="text-sm font-medium">{item.age_range}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 mx-4">
                    <Progress value={item.value} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-12 text-right flex-shrink-0">
                      {formatPercentage(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Metrics & Historical Trends */}
      {reputationHistory && reputationHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon iconId="faArrowTrendUpLight" className="h-5 w-5 text-primary" />
                Monthly Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reputationHistory.length >= 2 && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Followers</span>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          +{formatNumber(currentFollowers - previousFollowers)}
                        </div>
                        <div
                          className={`text-xs ${followerGrowth >= 0 ? 'text-success' : 'text-destructive'}`}
                        >
                          {followerGrowth >= 0 ? '+' : ''}
                          {followerGrowth.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Likes</span>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          +{formatNumber(currentLikes - previousLikes)}
                        </div>
                        <div
                          className={`text-xs ${likesGrowth >= 0 ? 'text-success' : 'text-destructive'}`}
                        >
                          {likesGrowth >= 0 ? '+' : ''}
                          {likesGrowth.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon iconId="faCalendarLight" className="h-5 w-5 text-primary" />
                Historical Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reputationHistory.slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.month}</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatNumber(item.follower_count)} followers
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatNumber(item.average_likes)} avg likes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
