'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon/icon';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface AudienceAnalyticsSectionProps {
  influencer: InfluencerProfileData;
}

// Helper function to format percentages
const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(1)}%`;
};

// Type definitions for InsightIQ data
interface FollowerType {
  name: string;
  value: number;
}

interface CountryData {
  code: string;
  value: number;
}

interface CityData {
  name: string;
  value: number;
}

interface PricingRange {
  min?: number;
  max?: number;
}

interface InsightIQData {
  audience?: {
    credibility_score?: number;
    significant_followers_percentage?: number;
    follower_types?: FollowerType[];
    countries?: CountryData[];
    cities?: CityData[];
  };
  contacts?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  pricing?: {
    pricing?: {
      post_type?: Record<string, PricingRange>;
    };
  };
}

// Helper function to get credibility color based on design system
const _getCredibilityColor = (score: number): string => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

// Helper function to get follower type badge variant
const _getFollowerTypeBadge = (type: string, value: number) => {
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

const AudienceAnalyticsSection: React.FC<AudienceAnalyticsSectionProps> = ({ influencer }) => {
  // Extract comprehensive InsightIQ data with proper typing
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: InsightIQData }).insightiq;
  const audienceData = insightiq?.audience;
  const contactData = insightiq?.contacts;
  const pricingData = insightiq?.pricing;

  // Executive Summary Metrics
  const credibilityScore = audienceData?.credibility_score || 0;
  const significantFollowersPercentage = audienceData?.significant_followers_percentage || 0;
  const followerTypes = audienceData?.follower_types || [];
  const topCountries = audienceData?.countries?.slice(0, 5) || [];
  const topCities = audienceData?.cities?.slice(0, 5) || [];

  // Contact Information for Marketing Directors
  const ContactCard = () => (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Icon iconId="faAddressCardLight" className="h-5 w-5 text-accent" />
          Contact & Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contactData?.email && (
          <div className="flex items-center gap-2">
            <Icon iconId="faEnvelopeLight" className="h-4 w-4 text-muted-foreground" />
            <a
              href={`mailto:${contactData.email}`}
              className="text-sm font-medium text-interactive hover:underline"
            >
              {contactData.email as string}
            </a>
          </div>
        )}
        {contactData?.phone && (
          <div className="flex items-center gap-2">
            <Icon iconId="faPhoneLight" className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{contactData.phone as string}</span>
          </div>
        )}
        {contactData?.website && (
          <div className="flex items-center gap-2">
            <Icon iconId="faGlobeLight" className="h-4 w-4 text-muted-foreground" />
            <a
              href={contactData.website as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-interactive hover:underline"
            >
              Website
            </a>
          </div>
        )}

        {pricingData?.pricing && (
          <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
            <div className="text-sm font-medium text-success mb-2">
              Estimated Collaboration Cost
            </div>
            {(pricingData.pricing as Record<string, unknown>).post_type ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(
                  (pricingData.pricing as Record<string, unknown>).post_type as Record<
                    string,
                    PricingRange
                  >
                ).map(([type, range]: [string, PricingRange]) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize text-muted-foreground">
                      {type.replace('_', ' ')}:
                    </span>
                    <span className="font-medium">
                      ${range.min?.toLocaleString() || '0'} - $
                      {range.max?.toLocaleString() || '0'}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <Button className="w-full mt-3" size="sm">
          <Icon iconId="faArrowRightLight" className="h-4 w-4 mr-2" />
          Initiate Outreach
        </Button>
      </CardContent>
    </Card>
  );

  // Executive Summary for Research Analysts
  const ExecutiveSummary = () => (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Icon iconId="faChartLineLight" className="h-5 w-5 text-accent" />
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {(credibilityScore * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Audience Credibility</div>
            <div className="mt-1">
              <Badge
                variant={
                  credibilityScore > 0.7
                    ? 'default'
                    : credibilityScore > 0.4
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {credibilityScore > 0.7 ? 'High' : credibilityScore > 0.4 ? 'Medium' : 'Low'}{' '}
                Quality
              </Badge>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {significantFollowersPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Significant Followers</div>
            <div className="mt-1">
              <Badge variant={significantFollowersPercentage > 10 ? 'default' : 'secondary'}>
                {significantFollowersPercentage > 10 ? 'Influential' : 'Emerging'}
              </Badge>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{topCountries[0]?.code || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">Primary Market</div>
            <div className="mt-1">
              <Badge variant="outline">{topCountries[0]?.value?.toFixed(1)}% reach</Badge>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {influencer.engagementRate ? (influencer.engagementRate * 100).toFixed(1) : 'N/A'}%
            </div>
            <div className="text-sm text-muted-foreground">Engagement Rate</div>
            <div className="mt-1">
              <Badge
                variant={
                  influencer.engagementRate && influencer.engagementRate > 0.03
                    ? 'default'
                    : 'secondary'
                }
              >
                {influencer.engagementRate && influencer.engagementRate > 0.03
                  ? 'Above Average'
                  : 'Standard'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Enhanced Audience Quality Analysis
  const AudienceQualityCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faShieldCheckLight" className="h-5 w-5 text-success" />
          Audience Quality Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {followerTypes.map((type: FollowerType, index: number) => {
          const isPositive = ['REAL', 'INFLUENCERS'].includes(type.name);
          const isNegative = ['MASS_FOLLOWERS', 'SUSPICIOUS'].includes(type.name);

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${isPositive ? 'bg-success' : isNegative ? 'bg-destructive' : 'bg-warning'
                      }`}
                  />
                  <span className="text-sm font-medium capitalize">
                    {type.name.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm font-bold">{type.value.toFixed(1)}%</span>
              </div>
              <Progress
                value={type.value}
                className={`h-2 ${isPositive
                  ? '[&>div]:bg-success'
                  : isNegative
                    ? '[&>div]:bg-destructive'
                    : '[&>div]:bg-warning'
                  }`}
              />
            </div>
          );
        })}

        <Separator className="my-4" />

        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-sm font-medium text-primary mb-2">Risk Assessment</div>
          <div className="text-xs text-muted-foreground">
            {credibilityScore > 0.7
              ? '✅ Low risk - High-quality audience with authentic engagement patterns'
              : credibilityScore > 0.4
                ? '⚠️ Medium risk - Monitor engagement quality and audience authenticity'
                : '🚫 High risk - Significant concerns about audience quality and authenticity'}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Geographic Distribution with Enhanced Insights
  const GeographicInsights = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Icon iconId="faGlobeLight" className="h-5 w-5 text-interactive" />
          Geographic Distribution & Market Reach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="text-sm font-medium text-primary mb-3">Top Countries</div>
          <div className="space-y-3">
            {topCountries.map((country: CountryData, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 rounded border border-border flex items-center justify-center text-xs font-medium">
                    {country.code}
                  </div>
                  <span className="text-sm font-medium">{country.code}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <Progress value={country.value} className="h-2" />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">
                    {country.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="text-sm font-medium text-primary mb-3">Top Cities</div>
          <div className="space-y-3">
            {topCities.map((city: CityData, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon iconId="faBuildingLight" className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{city.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <Progress value={city.value} className="h-2" />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">
                    {city.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-interactive/5 p-3 rounded-lg border border-interactive/20">
          <div className="text-sm font-medium text-interactive mb-1">Market Opportunity</div>
          <div className="text-xs text-muted-foreground">
            Primary audience concentrated in {topCountries[0]?.code} (
            {topCountries[0]?.value?.toFixed(1)}%) with strong urban presence in{' '}
            {topCities[0]?.name}.
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!audienceData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <Icon iconId="faChartPieLight" className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Comprehensive audience analytics will be available here once InsightIQ data is fully
              processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary Row */}
      <ExecutiveSummary />

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AudienceQualityCard />
          <GeographicInsights />
        </div>

        <div className="space-y-6">
          <ContactCard />
        </div>
      </div>
    </div>
  );
};

export default AudienceAnalyticsSection;
