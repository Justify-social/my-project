'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfluencerProfileData } from '@/types/influencer';

interface AdvancedAnalyticsSectionProps {
  influencer: InfluencerProfileData;
}

// Type definitions for InsightIQ advanced analytics data
interface BrandAffinity {
  name: string;
  logo_url?: string;
  category?: string;
  affinity_score?: number;
  percentage?: number;
}

interface LookalikeProfile {
  platform_username: string;
  image_url?: string;
  is_verified?: boolean;
  follower_count?: number;
  category?: string;
  similarity_score?: number;
  engagement_rate?: number;
  average_likes?: number;
  country?: string;
}

interface EngagementRateHistogram {
  engagement_rate_band?: {
    min: number;
    max: number;
  };
  count?: number;
}

interface InterestLanguageEthnicity {
  name: string;
  value?: number;
}

interface InsightIQAdvancedData {
  audience?: {
    brand_affinity?: BrandAffinity[];
    interests?: InterestLanguageEthnicity[];
    languages?: InterestLanguageEthnicity[];
    ethnicities?: InterestLanguageEthnicity[];
  };
  analytics?: {
    creatorBrandAffinity?: BrandAffinity[];
    lookalikes?: LookalikeProfile[];
  };
  engagement?: {
    engagementRateHistogram?: EngagementRateHistogram[];
  };
  content?: {
    contentCount?: number;
  };
  profile?: {
    posts_hidden_likes_percentage_value?: number;
  };
}

const AdvancedAnalyticsSection: React.FC<AdvancedAnalyticsSectionProps> = ({ influencer }) => {
  const [emailLookupEmail, setEmailLookupEmail] = useState('');
  const [audienceOverlapHandles, setAudienceOverlapHandles] = useState('');

  // Extract comprehensive InsightIQ advanced data with proper typing
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: InsightIQAdvancedData })
    .insightiq;
  const audienceData = insightiq?.audience;
  const analyticsData = insightiq?.analytics;
  const engagementData = insightiq?.engagement;
  const contentData = insightiq?.content;

  // Brand Affinity Analysis
  const BrandAffinityCard = () => (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Icon iconId="faHeartLight" className="h-5 w-5 text-accent" />
          Brand Affinity Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Creator Brand Affinity */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Creator Brand Affinity</div>
          {analyticsData?.creatorBrandAffinity && analyticsData.creatorBrandAffinity.length > 0 ? (
            <div className="space-y-2">
              {analyticsData.creatorBrandAffinity
                .slice(0, 5)
                .map((brand: BrandAffinity, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        {brand.logo_url ? (
                          <Image
                            src={brand.logo_url}
                            alt={brand.name}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        ) : (
                          <Icon
                            iconId="faBuildingLight"
                            className="h-4 w-4 text-muted-foreground"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{brand.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {brand.category || 'Brand'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {brand.affinity_score ? `${(brand.affinity_score * 100).toFixed(0)}%` : 'N/A'}
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Creator brand affinity data not available
            </p>
          )}
        </div>

        <Separator />

        {/* Audience Brand Affinity */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Audience Brand Affinity</div>
          {audienceData?.brand_affinity && audienceData.brand_affinity.length > 0 ? (
            <div className="space-y-2">
              {audienceData.brand_affinity
                .slice(0, 8)
                .map((brand: BrandAffinity, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                        {brand.logo_url ? (
                          <Image
                            src={brand.logo_url}
                            alt={brand.name}
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-accent"></div>
                        )}
                      </div>
                      <span className="text-sm">{brand.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <Progress value={brand.percentage || 0} className="h-1" />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">
                        {brand.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Audience brand affinity data not available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Lookalike Profiles Analysis
  const LookalikeProfilesCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faUsersLight" className="h-5 w-5 text-interactive" />
          Similar Creator Profiles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyticsData?.lookalikes && analyticsData.lookalikes.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground mb-3">
              Profiles with similar audience demographics and engagement patterns
            </div>
            {analyticsData.lookalikes
              .slice(0, 5)
              .map((lookalike: LookalikeProfile, index: number) => (
                <div key={index} className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={lookalike.image_url} alt={lookalike.platform_username} />
                      <AvatarFallback>
                        {lookalike.platform_username?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">@{lookalike.platform_username}</span>
                        {lookalike.is_verified && (
                          <Icon iconId="faCircleCheckSolid" className="h-4 w-4 text-interactive" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lookalike.follower_count?.toLocaleString()} followers •{' '}
                        {lookalike.category || 'Creator'}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {lookalike.similarity_score
                        ? `${(lookalike.similarity_score * 100).toFixed(0)}% match`
                        : 'Similar'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Engagement:</span>
                      <div className="font-medium">
                        {lookalike.engagement_rate
                          ? `${(lookalike.engagement_rate * 100).toFixed(1)}%`
                          : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Likes:</span>
                      <div className="font-medium">
                        {lookalike.average_likes?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Country:</span>
                      <div className="font-medium">{lookalike.country || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Icon iconId="faUsersLight" className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Lookalike profile analysis not available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Advanced Engagement Analysis
  const AdvancedEngagementCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faChartAreaLight" className="h-5 w-5 text-success" />
          Advanced Engagement Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Engagement Rate Histogram */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Engagement Rate Distribution</div>
          {engagementData?.engagementRateHistogram &&
          engagementData.engagementRateHistogram.length > 0 ? (
            <div className="space-y-2">
              {engagementData.engagementRateHistogram.map(
                (band: EngagementRateHistogram, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>
                        {band.engagement_rate_band?.min}% - {band.engagement_rate_band?.max}%
                      </span>
                      <span className="font-medium">{band.count || 0} posts</span>
                    </div>
                    <Progress
                      value={((band.count || 0) / (contentData?.contentCount || 1)) * 100}
                      className="h-1"
                    />
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Engagement distribution data not available
            </p>
          )}
        </div>

        <Separator />

        {/* Hidden Likes Analysis */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Content Transparency Analysis</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="text-lg font-bold text-warning">
                {insightiq?.profile?.posts_hidden_likes_percentage_value
                  ? `${insightiq.profile.posts_hidden_likes_percentage_value.toFixed(1)}%`
                  : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Hidden Likes</div>
            </div>
            <div className="text-center p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="text-lg font-bold text-success">
                {insightiq?.profile?.posts_hidden_likes_percentage_value
                  ? `${(100 - insightiq.profile.posts_hidden_likes_percentage_value).toFixed(1)}%`
                  : '100%'}
              </div>
              <div className="text-xs text-muted-foreground">Transparent Posts</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Email Lookup & Research Tools
  const ResearchToolsCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faSearchLight" className="h-5 w-5 text-warning" />
          Advanced Research Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Lookup Tool */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Email Lookup Analysis</div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address to lookup social profiles"
                value={emailLookupEmail}
                onChange={e => setEmailLookupEmail(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Icon iconId="faSearchLight" className="h-4 w-4 mr-1" />
                Lookup
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Find social media profiles associated with email addresses using InsightIQ's email
              lookup API
            </div>
          </div>
        </div>

        <Separator />

        {/* Audience Overlap Analysis */}
        <div>
          <div className="text-sm font-medium text-primary mb-3">Audience Overlap Analysis</div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter creator handles (comma-separated)"
                value={audienceOverlapHandles}
                onChange={e => setAudienceOverlapHandles(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Icon iconId="faVennDiagramLight" className="h-4 w-4 mr-1" />
                Analyze
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Compare audience overlap between multiple creators to identify collaboration
              opportunities
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Analysis Tools */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
            <Icon iconId="faCommentsLight" className="h-5 w-5 mb-1" />
            <span className="text-xs">Comments Analysis</span>
          </Button>
          <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
            <Icon iconId="faShieldLight" className="h-5 w-5 mb-1" />
            <span className="text-xs">Risk Assessment</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Professional & Enterprise Features
  const EnterpriseToolsCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faCrownLight" className="h-5 w-5 text-accent" />
          Enterprise Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="interests" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="ethnicities">Demographics</TabsTrigger>
          </TabsList>

          <TabsContent value="interests" className="space-y-3">
            <div className="text-sm text-muted-foreground">Audience interest categories</div>
            {audienceData?.interests && audienceData.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {audienceData.interests
                  .slice(0, 12)
                  .map((interest: InterestLanguageEthnicity, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest.name} ({interest.value?.toFixed(1)}%)
                    </Badge>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Interest data not available</p>
            )}
          </TabsContent>

          <TabsContent value="languages" className="space-y-3">
            <div className="text-sm text-muted-foreground">Audience language distribution</div>
            {audienceData?.languages && audienceData.languages.length > 0 ? (
              <div className="space-y-2">
                {audienceData.languages
                  .slice(0, 6)
                  .map((language: InterestLanguageEthnicity, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{language.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <Progress value={language.value || 0} className="h-1" />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">
                          {language.value?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Language data not available</p>
            )}
          </TabsContent>

          <TabsContent value="ethnicities" className="space-y-3">
            <div className="text-sm text-muted-foreground">Audience ethnic composition</div>
            {audienceData?.ethnicities && audienceData.ethnicities.length > 0 ? (
              <div className="space-y-2">
                {audienceData.ethnicities
                  .slice(0, 6)
                  .map((ethnicity: InterestLanguageEthnicity, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{ethnicity.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <Progress value={ethnicity.value || 0} className="h-1" />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">
                          {ethnicity.value?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ethnicity data not available</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  if (!audienceData && !analyticsData && !engagementData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <Icon iconId="faCrownLight" className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Advanced analytics features will be available here once InsightIQ data is fully
              processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brand Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrandAffinityCard />
        <LookalikeProfilesCard />
      </div>

      {/* Engagement & Research Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdvancedEngagementCard />
        <ResearchToolsCard />
      </div>

      {/* Enterprise Intelligence */}
      <EnterpriseToolsCard />
    </div>
  );
};

export default AdvancedAnalyticsSection;
