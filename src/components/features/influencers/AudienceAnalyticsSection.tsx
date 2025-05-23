'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AudienceAnalyticsSectionProps {
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

// Helper function to get credibility color based on design system
const getCredibilityColor = (score: number): string => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

// Helper function to get follower type badge variant
const getFollowerTypeBadge = (type: string, value: number) => {
  const percentage = formatPercentage(value);
  switch (type) {
    case 'REAL':
      return (
        <Badge className="bg-success/10 text-success border-success/20">Real: {percentage}</Badge>
      );
    case 'INFLUENCERS':
      return (
        <Badge className="bg-interactive/10 text-interactive border-interactive/20">
          Influencers: {percentage}
        </Badge>
      );
    case 'MASS_FOLLOWERS':
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">Mass: {percentage}</Badge>
      );
    case 'SUSPICIOUS':
      return <Badge variant="destructive">Suspicious: {percentage}</Badge>;
    default:
      return (
        <Badge variant="outline">
          {type}: {percentage}
        </Badge>
      );
  }
};

export function AudienceAnalyticsSection({ influencer }: AudienceAnalyticsSectionProps) {
  // Extract actual audience data from InsightIQ API response if available
  // Note: The exact property structure depends on how the InsightIQ API response is stored
  const audienceData = (influencer as any).audience || (influencer as any).insightiq?.audience;
  const profileData = (influencer as any).profile || (influencer as any).insightiq?.profile;

  // If no advanced analytics are available, show a message
  if (!audienceData && !profileData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Icon iconId="faCircleInfoLight" className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Advanced Audience Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Detailed audience analytics from InsightIQ are not available in sandbox mode.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This section will populate with comprehensive demographic data, geographic
                distribution, interests, and audience quality metrics when connected to production
                InsightIQ API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const credibilityScore = audienceData?.credibility_score;
  const significantFollowersPercentage = audienceData?.significant_followers_percentage;
  const followerTypes = audienceData?.follower_types;
  const countries = audienceData?.countries;
  const cities = audienceData?.cities;
  const interests = audienceData?.interests;
  const brandAffinity = audienceData?.brand_affinity;
  const languages = audienceData?.languages;
  const ethnicities = audienceData?.ethnicities;
  const lookalikes = audienceData?.lookalikes;
  const significantFollowers = audienceData?.significant_followers;

  return (
    <div className="space-y-6">
      {/* Audience Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon iconId="faShieldLight" className="h-4 w-4 text-primary" />
              Credibility Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`text-2xl font-bold ${getCredibilityColor(credibilityScore || 0)}`}>
                {credibilityScore ? `${credibilityScore.toFixed(1)}%` : 'N/A'}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon iconId="faCircleInfoLight" className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Percentage of genuine users in the audience, excluding bots and fraudulent
                      profiles
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon iconId="faStarLight" className="h-4 w-4 text-primary" />
              Significant Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-interactive">
              {formatPercentage(significantFollowersPercentage)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">High-quality audience members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon iconId="faUsersLight" className="h-4 w-4 text-primary" />
              Audience Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {followerTypes?.map((type: any, index: number) => (
                <div key={index}>{getFollowerTypeBadge(type.name || type.type, type.value)}</div>
              )) || <p className="text-sm text-muted-foreground">No data available</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      {(countries || cities) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon iconId="faGlobeLight" className="h-5 w-5 text-primary" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Countries */}
              {countries && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-foreground">Top Countries</h4>
                  <div className="space-y-3">
                    {countries.slice(0, 5).map((country: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium min-w-0 flex-shrink-0">
                          {country.code || country.name}
                        </span>
                        <div className="flex items-center gap-3 flex-1 mx-3">
                          <Progress value={country.value} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-12 text-right flex-shrink-0">
                            {formatPercentage(country.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Cities */}
              {cities && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-foreground">Top Cities</h4>
                  <div className="space-y-3">
                    {cities.slice(0, 5).map((city: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium min-w-0 flex-shrink-0">
                          {city.name}
                        </span>
                        <div className="flex items-center gap-3 flex-1 mx-3">
                          <Progress value={city.value} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-12 text-right flex-shrink-0">
                            {formatPercentage(city.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interests & Brand Affinity */}
      {(interests || brandAffinity) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interests && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconId="faHeartLight" className="h-5 w-5 text-primary" />
                  Top Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {interests.slice(0, 8).map((interest: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium truncate">{interest.name}</span>
                      <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                        {formatPercentage(interest.value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {brandAffinity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconId="faStarLight" className="h-5 w-5 text-primary" />
                  Brand Affinity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {brandAffinity.slice(0, 8).map((brand: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium truncate">{brand.name}</span>
                      <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                        {formatPercentage(brand.value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Languages & Demographics */}
      {(languages || ethnicities) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconId="faGlobeLight" className="h-5 w-5 text-primary" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languages.slice(0, 6).map((language: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium min-w-0 flex-shrink-0">
                        {language.code}
                      </span>
                      <div className="flex items-center gap-3 flex-1 mx-3">
                        <Progress value={language.value} className="flex-1 h-2" />
                        <span className="text-sm text-muted-foreground w-12 text-right flex-shrink-0">
                          {formatPercentage(language.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {ethnicities && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconId="faUsersLight" className="h-5 w-5 text-primary" />
                  Ethnicities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ethnicities.slice(0, 6).map((ethnicity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium truncate">{ethnicity.name}</span>
                      <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                        {formatPercentage(ethnicity.value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Lookalikes & Significant Followers */}
      {(lookalikes || significantFollowers) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lookalikes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconId="faCopyLight" className="h-5 w-5 text-primary" />
                  Similar Audiences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lookalikes.slice(0, 4).map((profile: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={profile.image_url} alt={profile.platform_username} />
                        <AvatarFallback className="text-xs">
                          {profile.platform_username?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">@{profile.platform_username}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(profile.follower_count)} followers
                        </p>
                      </div>
                      {profile.is_verified && (
                        <Icon
                          iconId="faCircleCheckSolid"
                          className="h-4 w-4 text-interactive flex-shrink-0"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {significantFollowers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon iconId="faStarLight" className="h-5 w-5 text-primary" />
                  Notable Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage
                      src={significantFollowers.image_url}
                      alt={significantFollowers.platform_username}
                    />
                    <AvatarFallback className="text-sm">
                      {significantFollowers.platform_username?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      @{significantFollowers.platform_username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(significantFollowers.follower_count)} followers
                    </p>
                  </div>
                  {significantFollowers.is_verified && (
                    <Icon
                      iconId="faCircleCheckSolid"
                      className="h-4 w-4 text-interactive flex-shrink-0"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
