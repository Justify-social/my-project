'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InfluencerProfileData } from '@/types/influencer';

interface DemographicsSectionProps {
  influencer: InfluencerProfileData;
}

const DemographicsSection: React.FC<DemographicsSectionProps> = ({ influencer }) => {
  // Extract comprehensive InsightIQ demographics data
  const insightiq = (influencer as any).insightiq;
  const audienceData = insightiq?.audience;
  const creatorDemographics = insightiq?.demographics?.creator;
  const locationData = insightiq?.demographics?.location;
  const analyticsData = insightiq?.analytics;
  const audienceLikers = audienceData?.audienceLikers;

  // Creator Profile Overview
  const CreatorProfileCard = () => (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Icon iconId="faUserLight" className="h-5 w-5 text-accent" />
          Creator Profile Demographics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {creatorDemographics?.gender || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Gender</div>
            <div className="mt-1">
              <Badge variant="outline">Creator Identity</Badge>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {creatorDemographics?.ageGroup || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Age Group</div>
            <div className="mt-1">
              <Badge
                variant={creatorDemographics?.ageGroup?.includes('25-34') ? 'default' : 'secondary'}
              >
                {creatorDemographics?.ageGroup?.includes('25-34') ? 'Prime Demo' : 'Niche Demo'}
              </Badge>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {creatorDemographics?.language || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Primary Language</div>
            <div className="mt-1">
              <Badge variant="outline">Content Language</Badge>
            </div>
          </div>
        </div>

        {locationData && (
          <div className="mt-6 p-3 bg-interactive/5 border border-interactive/20 rounded-lg">
            <div className="text-sm font-medium text-interactive mb-2">Creator Location</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">City:</span>
                <div className="font-medium">{locationData.city || 'N/A'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">State:</span>
                <div className="font-medium">{locationData.state || 'N/A'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Country:</span>
                <div className="font-medium">{locationData.country || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Audience Gender & Age Distribution
  const AudienceDistributionCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faChartPieLight" className="h-5 w-5 text-interactive" />
          Audience Gender & Age Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {audienceData?.gender_age_distribution &&
        audienceData.gender_age_distribution.length > 0 ? (
          <div className="space-y-4">
            {audienceData.gender_age_distribution.map((demo: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        demo.gender === 'FEMALE'
                          ? 'bg-accent'
                          : demo.gender === 'MALE'
                            ? 'bg-interactive'
                            : 'bg-warning'
                      }`}
                    />
                    <span className="text-sm font-medium capitalize">
                      {demo.gender?.toLowerCase()} • {demo.age_range}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{demo.value?.toFixed(1)}%</span>
                </div>
                <Progress
                  value={demo.value}
                  className={`h-2 ${
                    demo.gender === 'FEMALE'
                      ? '[&>div]:bg-accent'
                      : demo.gender === 'MALE'
                        ? '[&>div]:bg-interactive'
                        : '[&>div]:bg-warning'
                  }`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Icon iconId="faChartPieLight" className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Gender & age distribution data not available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Audience Credibility Benchmarking
  const CredibilityBenchmarkCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faShieldLight" className="h-5 w-5 text-success" />
          Industry Credibility Benchmarking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {audienceData?.credibility_score_band && audienceData.credibility_score_band.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground mb-3">
              Credibility score distribution across similar profiles
            </div>
            {audienceData.credibility_score_band.map((band: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {band.min}% - {band.max}% Credibility
                  </span>
                  <Badge variant="outline">{band.total_profile_count} profiles</Badge>
                </div>
                <Progress value={(band.total_profile_count / 1000) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  Industry benchmark for this credibility range
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-success/5 p-3 rounded-lg border border-success/20">
            <div className="text-sm font-medium text-success mb-1">Current Credibility Score</div>
            <div className="text-2xl font-bold text-success">
              {audienceData?.credibility_score
                ? `${(audienceData.credibility_score * 100).toFixed(1)}%`
                : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              Benchmark data will show when available
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Reputation History Timeline
  const ReputationHistoryCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faChartLineLight" className="h-5 w-5 text-warning" />
          Growth & Reputation History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyticsData?.reputationHistory && analyticsData.reputationHistory.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground mb-3">
              Historical performance metrics over time
            </div>
            {analyticsData.reputationHistory.slice(-6).map((period: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{period.month}</span>
                  <Badge variant="secondary" className="text-xs">
                    {period.follower_count?.toLocaleString()} followers
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Following:</span>
                    <div className="font-medium">
                      {period.following_count?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Likes:</span>
                    <div className="font-medium">
                      {period.average_likes?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subscribers:</span>
                    <div className="font-medium">
                      {period.subscriber_count?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Icon
              iconId="faChartLineLight"
              className="h-8 w-8 text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">Historical growth data not available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Significant Followers Analysis
  const SignificantFollowersCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faStarLight" className="h-5 w-5 text-accent" />
          Notable Followers & Influence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="text-lg font-bold text-accent">
              {audienceData?.significant_followers_percentage?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-muted-foreground">Significant Followers</div>
          </div>
          <div className="text-center p-3 bg-interactive/5 border border-interactive/20 rounded-lg">
            <div className="text-lg font-bold text-interactive">
              {audienceLikers?.significant_likers_percentage?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-muted-foreground">Significant Likers</div>
          </div>
        </div>

        {audienceData?.significant_followers && (
          <div className="border border-border rounded-lg p-3">
            <div className="text-sm font-medium text-primary mb-2">
              Featured Significant Follower
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={audienceData.significant_followers.image_url}
                  alt={audienceData.significant_followers.platform_username}
                />
                <AvatarFallback>
                  {audienceData.significant_followers.platform_username?.charAt(0).toUpperCase() ||
                    '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    @{audienceData.significant_followers.platform_username}
                  </span>
                  {audienceData.significant_followers.is_verified && (
                    <Icon iconId="faCircleCheckSolid" className="h-4 w-4 text-interactive" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {audienceData.significant_followers.follower_count?.toLocaleString()} followers
                </div>
              </div>
            </div>
          </div>
        )}

        {audienceLikers?.significant_likers && audienceLikers.significant_likers.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-primary">Top Significant Likers</div>
            {audienceLikers.significant_likers.slice(0, 3).map((liker: any, index: number) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={liker.image_url} alt={liker.platform_username} />
                  <AvatarFallback className="text-xs">
                    {liker.platform_username?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">@{liker.platform_username}</span>
                {liker.is_verified && (
                  <Icon iconId="faCircleCheckSolid" className="h-3 w-3 text-interactive" />
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {liker.follower_count?.toLocaleString()} followers
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Audience vs Likers Comparison
  const AudienceLikersComparisonCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faBalanceScaleLight" className="h-5 w-5 text-warning" />
          Followers vs Likers Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {audienceLikers && (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Comparing audience demographics with active engagement patterns
            </div>

            {/* Geographic Comparison */}
            <div>
              <div className="text-sm font-medium text-primary mb-3">
                Geographic Engagement Patterns
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Top Follower Countries</div>
                  {audienceData?.countries?.slice(0, 3).map((country: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs mb-1">
                      <span>{country.code}</span>
                      <span>{country.value?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Top Liker Countries</div>
                  {audienceLikers.countries?.slice(0, 3).map((country: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs mb-1">
                      <span>{country.code}</span>
                      <span>{country.value?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Credibility Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {audienceData?.credibility_score
                    ? (audienceData.credibility_score * 100).toFixed(1)
                    : 'N/A'}
                  %
                </div>
                <div className="text-xs text-muted-foreground">Follower Credibility</div>
              </div>
              <div className="text-center p-3 bg-success/5 border border-success/20 rounded-lg">
                <div className="text-lg font-bold text-success">
                  {audienceLikers.credibility_score
                    ? (audienceLikers.credibility_score * 100).toFixed(1)
                    : 'N/A'}
                  %
                </div>
                <div className="text-xs text-muted-foreground">Liker Credibility</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  if (!audienceData && !creatorDemographics && !locationData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <Icon iconId="faUsersLight" className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Comprehensive demographic analytics will be available here once InsightIQ data is
              fully processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Creator Profile Overview */}
      <CreatorProfileCard />

      {/* Main Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AudienceDistributionCard />
          <ReputationHistoryCard />
        </div>

        <div className="space-y-6">
          <CredibilityBenchmarkCard />
          <SignificantFollowersCard />
        </div>
      </div>

      {/* Advanced Analysis */}
      {audienceLikers && <AudienceLikersComparisonCard />}
    </div>
  );
};

export default DemographicsSection;
