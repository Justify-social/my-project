'use client';

import React, { useState } from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { extractInsightIQData } from '@/lib/data-extraction/insightiq-extractor-profile-analytics';

interface AdvancedInsightsHubProps {
  influencer: InfluencerProfileData;
}

// Helper function to format numbers
const formatNumber = (num: number | null | undefined): string => {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Helper function to format percentage
const formatPercentage = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return 'N/A';
  return `${(num * 100).toFixed(1)}%`;
};

// Helper function to get initials for avatar fallback
const getInitials = (name: string | undefined): string => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Lookalike influencer card component
interface LookalikeCardProps {
  lookalike: {
    platformUsername?: string;
    imageUrl?: string;
    isVerified?: boolean;
    followerCount?: number;
    category?: string;
    similarityScore?: number;
    engagementRate?: number;
    averageLikes?: number;
    country?: string;
  };
  currentInfluencerFollowers: number | null;
}

const LookalikeCard: React.FC<LookalikeCardProps> = ({ lookalike, currentInfluencerFollowers }) => {
  const followerDifference =
    currentInfluencerFollowers && lookalike.followerCount
      ? ((lookalike.followerCount - currentInfluencerFollowers) / currentInfluencerFollowers) * 100
      : null;

  const getFollowerComparisonColor = () => {
    if (followerDifference === null) return 'text-muted-foreground';
    if (Math.abs(followerDifference) <= 20) return 'text-accent'; // Similar size
    if (followerDifference > 0) return 'text-primary'; // Larger
    return 'text-secondary'; // Smaller
  };

  const getSimilarityLevel = (score?: number): 'HIGH' | 'MEDIUM' | 'LOW' => {
    if (!score) return 'LOW';
    if (score >= 0.8) return 'HIGH';
    if (score >= 0.6) return 'MEDIUM';
    return 'LOW';
  };

  const similarityLevel = getSimilarityLevel(lookalike.similarityScore);
  const displayUsername = lookalike.platformUsername || 'Profile Available';

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-accent/20">
              <AvatarImage src={lookalike.imageUrl} alt={displayUsername} />
              <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary/10 to-accent/10">
                {getInitials(lookalike.platformUsername)}
              </AvatarFallback>
            </Avatar>
            {lookalike.isVerified && (
              <div className="absolute -bottom-1 -right-1">
                <Icon iconId="faCircleCheckSolid" className="h-4 w-4 text-sky-500" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">@{displayUsername}</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  similarityLevel === 'HIGH'
                    ? 'bg-success/10 text-success border-success/20'
                    : similarityLevel === 'MEDIUM'
                      ? 'bg-warning/10 text-warning border-warning/20'
                      : 'bg-muted/10 text-muted-foreground border-muted/20'
                )}
              >
                {similarityLevel} Match
              </Badge>
            </div>

            {/* Metrics */}
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Followers</span>
                <span className={cn('font-medium', getFollowerComparisonColor())}>
                  {formatNumber(lookalike.followerCount)}
                  {followerDifference !== null && (
                    <span className="ml-1">
                      ({followerDifference > 0 ? '+' : ''}
                      {followerDifference.toFixed(0)}%)
                    </span>
                  )}
                </span>
              </div>
              {lookalike.engagementRate && (
                <div className="flex items-center justify-between">
                  <span>Engagement</span>
                  <span className="font-medium">{formatPercentage(lookalike.engagementRate)}</span>
                </div>
              )}
              {lookalike.category && (
                <div className="flex items-center justify-between">
                  <span>Category</span>
                  <span className="font-medium">{lookalike.category}</span>
                </div>
              )}
              {lookalike.country && (
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <span className="font-medium">{lookalike.country}</span>
                </div>
              )}
            </div>

            {/* Similarity Score */}
            {lookalike.similarityScore && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Similarity Score</span>
                  <span className="font-medium">
                    {(lookalike.similarityScore * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={lookalike.similarityScore * 100} className="h-1" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Growth trend analysis component
interface GrowthTrendProps {
  reputationHistory: Array<{
    month: string;
    followerCount?: number;
    followingCount?: number;
    averageLikes?: number;
    subscriberCount?: number;
  }>;
  currentFollowers: number | null;
}

const GrowthTrendAnalysis: React.FC<GrowthTrendProps> = ({
  reputationHistory,
  currentFollowers,
}) => {
  if (reputationHistory.length === 0) {
    return (
      <div className="text-center py-6">
        <Icon iconId="faChartLineLight" className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No historical data available</p>
      </div>
    );
  }

  // Calculate growth metrics
  const getGrowthRate = (): number | null => {
    if (reputationHistory.length < 2) return null;
    const recent = reputationHistory[reputationHistory.length - 1];
    const previous = reputationHistory[reputationHistory.length - 2];
    if (recent.followerCount && previous.followerCount) {
      return ((recent.followerCount - previous.followerCount) / previous.followerCount) * 100;
    }
    return null;
  };

  const getGrowthTrend = (): 'ACCELERATING' | 'STEADY' | 'DECLINING' | 'STABLE' => {
    const growthRate = getGrowthRate();
    if (growthRate === null) return 'STABLE';

    if (growthRate > 0.05) return 'ACCELERATING'; // 5%+ growth
    if (growthRate > 0) return 'STEADY'; // Positive growth
    return 'DECLINING'; // Negative or no growth
  };

  const growthRate = getGrowthRate();
  const growthTrend = getGrowthTrend();

  const getTrendStyles = (trend: string) => {
    switch (trend) {
      case 'ACCELERATING':
        return {
          color: 'text-success',
          icon: 'faArrowTrendUpLight',
          bg: 'bg-success/10 border-success/20',
        };
      case 'STEADY':
        return {
          color: 'text-primary',
          icon: 'faArrowRightLight',
          bg: 'bg-primary/10 border-primary/20',
        };
      case 'DECLINING':
        return {
          color: 'text-destructive',
          icon: 'faArrowTrendDownLight',
          bg: 'bg-destructive/10 border-destructive/20',
        };
      default:
        return {
          color: 'text-muted-foreground',
          icon: 'faMinusLight',
          bg: 'bg-muted/10 border-muted/20',
        };
    }
  };

  const trendStyles = getTrendStyles(growthTrend);

  return (
    <div className="space-y-4">
      {/* Growth Overview */}
      <div className={cn('p-4 rounded-lg border', trendStyles.bg)}>
        <div className="flex items-center gap-3 mb-3">
          <Icon iconId={trendStyles.icon} className={cn('w-5 h-5', trendStyles.color)} />
          <div>
            <span className="font-medium text-foreground">Growth Trend</span>
            <Badge variant="outline" className={cn('ml-2 text-xs', trendStyles.color)}>
              {growthTrend}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Current Followers</span>
            <div className="text-lg font-bold text-primary">{formatNumber(currentFollowers)}</div>
          </div>
          {growthRate !== null && (
            <div>
              <span className="text-muted-foreground">Monthly Growth</span>
              <div className={cn('text-lg font-bold', trendStyles.color)}>
                {growthRate > 0 ? '+' : ''}
                {growthRate.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Timeline */}
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-secondary">Recent Performance</h5>
        <div className="grid grid-cols-1 gap-2">
          {reputationHistory.slice(-6).map((period, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/50"
            >
              <span className="text-sm font-medium">{period.month}</span>
              <div className="text-xs text-muted-foreground">
                {formatNumber(period.followerCount)} followers
                {period.averageLikes && (
                  <span className="ml-2">• {formatNumber(period.averageLikes)} avg likes</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Industry positioning component
interface IndustryPositioningProps {
  influencer: InfluencerProfileData;
  lookalikes: Array<{ followerCount?: number; engagementRate?: number; category?: string }>;
}

const IndustryPositioning: React.FC<IndustryPositioningProps> = ({ influencer, lookalikes }) => {
  const calculatePositioning = () => {
    if (lookalikes.length === 0) return { followerPercentile: 0, engagementPercentile: 0 };

    const followerCounts = lookalikes.map(l => l.followerCount || 0).filter(f => f > 0);
    const engagementRates = lookalikes.map(l => l.engagementRate || 0).filter(e => e > 0);

    const currentFollowers = influencer.followersCount || 0;
    const currentEngagement = influencer.engagementRate || 0;

    const followerPercentile =
      followerCounts.length > 0
        ? (followerCounts.filter(f => f <= currentFollowers).length / followerCounts.length) * 100
        : 0;

    const engagementPercentile =
      engagementRates.length > 0
        ? (engagementRates.filter(e => e <= currentEngagement).length / engagementRates.length) *
          100
        : 0;

    return { followerPercentile, engagementPercentile };
  };

  const { followerPercentile, engagementPercentile } = calculatePositioning();

  const getPositionLevel = (
    percentile: number
  ): 'TOP' | 'ABOVE AVERAGE' | 'AVERAGE' | 'BELOW AVERAGE' => {
    if (percentile >= 80) return 'TOP';
    if (percentile >= 60) return 'ABOVE AVERAGE';
    if (percentile >= 40) return 'AVERAGE';
    return 'BELOW AVERAGE';
  };

  const followerPosition = getPositionLevel(followerPercentile);
  const engagementPosition = getPositionLevel(engagementPercentile);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/20 border border-border/50 text-center">
          <div className="text-sm font-medium text-muted-foreground mb-1">Follower Ranking</div>
          <div className="text-lg font-bold text-primary">{followerPercentile.toFixed(0)}th</div>
          <div className="text-xs text-muted-foreground">percentile</div>
          <Badge variant="outline" className="mt-2 text-xs">
            {followerPosition}
          </Badge>
        </div>
        <div className="p-4 rounded-lg bg-muted/20 border border-border/50 text-center">
          <div className="text-sm font-medium text-muted-foreground mb-1">Engagement Ranking</div>
          <div className="text-lg font-bold text-primary">{engagementPercentile.toFixed(0)}th</div>
          <div className="text-xs text-muted-foreground">percentile</div>
          <Badge variant="outline" className="mt-2 text-xs">
            {engagementPosition}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export const AdvancedInsightsHub: React.FC<AdvancedInsightsHubProps> = ({ influencer }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // 🎯 SSOT: Use centralized data extraction
  const extractedData = extractInsightIQData(influencer);
  const brandData = extractedData.brand;
  const performanceData = extractedData.performance;

  // Calculate advanced insights score
  const getAdvancedInsightsScore = (): number => {
    const lookalikeCount = brandData.lookalikes.length;
    const historyLength = performanceData.trends.reputationHistory.length;
    const hasSignificantFollowers = Boolean(brandData.significantFollowers);

    const dataRichness = Math.min((lookalikeCount + historyLength * 2) / 15, 1) * 60;
    const networkStrength = hasSignificantFollowers ? 25 : 0;
    const competitiveIntel = lookalikeCount > 0 ? 15 : 0;

    return Math.round(dataRichness + networkStrength + competitiveIntel);
  };

  const advancedInsightsScore = getAdvancedInsightsScore();

  // Don't render if no advanced data available
  if (
    brandData.lookalikes.length === 0 &&
    performanceData.trends.reputationHistory.length === 0 &&
    !brandData.significantFollowers
  ) {
    return (
      <Card className="border-accent/20">
        <CardContent className="p-6 text-center">
          <Icon iconId="faGlobeLight" className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Advanced insights data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faGlobeLight" className="text-accent w-5 h-5" />
            <span className="text-primary">Advanced Insights</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs bg-primary/10 text-primary border-primary/20"
            >
              <Icon iconId="faChartBarLight" className="w-3 h-3 mr-1" />
              Intelligence: {advancedInsightsScore}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Analytics
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Industry Positioning */}
        {brandData.lookalikes.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Icon iconId="faBullseyeLight" className="w-4 h-4 text-accent" />
              Industry Positioning
            </h4>
            <IndustryPositioning influencer={influencer} lookalikes={brandData.lookalikes} />
          </div>
        )}

        {/* Growth Trend Analysis */}
        {performanceData.trends.reputationHistory.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Icon iconId="faChartLineLight" className="w-4 h-4 text-accent" />
                Growth Trajectory Analysis
              </h4>
              <GrowthTrendAnalysis
                reputationHistory={performanceData.trends.reputationHistory}
                currentFollowers={performanceData.reputation.followerCount}
              />
            </div>
          </>
        )}

        {/* Lookalike Influencers */}
        {brandData.lookalikes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Icon iconId="faUsersLight" className="w-4 h-4 text-accent" />
                Similar Creators ({brandData.lookalikes.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brandData.lookalikes.slice(0, 4).map((lookalike, index) => (
                  <LookalikeCard
                    key={index}
                    lookalike={lookalike}
                    currentInfluencerFollowers={performanceData.reputation.followerCount}
                  />
                ))}
              </div>
              {brandData.lookalikes.length > 4 && (
                <div className="text-center">
                  <Button variant="outline" size="sm" className="text-accent hover:bg-accent/10">
                    <Icon iconId="faPlusLight" className="w-4 h-4 mr-2" />
                    View All {brandData.lookalikes.length} Similar Creators
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Progressive Disclosure Trigger */}
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faChartLineLight" className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-secondary">
              Competitive analysis and detailed insights available
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-accent hover:bg-accent/10 hover:text-accent"
            onClick={() => setExpandedSection(expandedSection === 'advanced' ? null : 'advanced')}
          >
            <Icon
              iconId={expandedSection === 'advanced' ? 'faChevronUpLight' : 'faChevronDownLight'}
              className="mr-2 w-4 h-4"
            />
            {expandedSection === 'advanced' ? 'Hide Details' : 'View Advanced Analytics'}
          </Button>
        </div>

        {/* Expandable Detailed Analysis */}
        {expandedSection === 'advanced' && (
          <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
            <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Icon iconId="faGlobeLight" className="w-5 h-5 text-accent" />
              Detailed Competitive Intelligence
            </h4>

            {/* Network Analysis */}
            {brandData.significantFollowers && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-secondary">Network Influence</h5>
                <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={brandData.significantFollowers.imageUrl}
                        alt={
                          brandData.significantFollowers.platformUsername || 'Influencer Profile'
                        }
                      />
                      <AvatarFallback className="text-xs">
                        {brandData.significantFollowers.platformUsername?.slice(0, 2) || 'IF'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          @{brandData.significantFollowers.platformUsername || 'Profile Available'}
                        </span>
                        {brandData.significantFollowers.isVerified && (
                          <Icon iconId="faCircleCheckSolid" className="w-4 h-4 text-sky-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(brandData.significantFollowers.followerCount)} followers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Competitive Landscape */}
            {brandData.lookalikes.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-secondary">Competitive Landscape</h5>
                <div className="space-y-2">
                  {brandData.lookalikes.slice(0, 8).map((lookalike, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={lookalike.imageUrl}
                            alt={lookalike.platformUsername || 'Profile Available'}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(lookalike.platformUsername)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              @{lookalike.platformUsername || 'Profile Available'}
                            </span>
                            {lookalike.isVerified && (
                              <Icon iconId="faCircleCheckSolid" className="w-3 h-3 text-sky-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(lookalike.followerCount)} followers
                            {lookalike.category && ` • ${lookalike.category}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {lookalike.engagementRate && (
                          <div className="text-sm font-medium">
                            {formatPercentage(lookalike.engagementRate)}
                          </div>
                        )}
                        {lookalike.similarityScore && (
                          <div className="text-xs text-muted-foreground">
                            {(lookalike.similarityScore * 100).toFixed(0)}% match
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Intelligence Summary */}
            <div className="p-4 rounded-lg bg-success/10 border border-success/20 animate-in slide-in-from-bottom-3 duration-500 delay-1400">
              <div className="flex items-center gap-3 mb-3">
                <Icon iconId="faClipboardLight" className="w-5 h-5 text-success" />
                <span className="font-medium text-primary">Advanced Intelligence Summary</span>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
                  Professional Analysis
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <Icon
                    iconId={
                      advancedInsightsScore >= 70 ? 'faCheckLight' : 'faTriangleExclamationLight'
                    }
                    className={cn(
                      'w-3 h-3',
                      advancedInsightsScore >= 70 ? 'text-success' : 'text-warning'
                    )}
                  />
                  <span>
                    Competitive intelligence: {advancedInsightsScore}/100 -{' '}
                    {advancedInsightsScore >= 70
                      ? 'Comprehensive market positioning data'
                      : 'Basic competitive insights available'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    iconId={brandData.lookalikes.length >= 5 ? 'faCheckLight' : 'faMinusLight'}
                    className={cn(
                      'w-3 h-3',
                      brandData.lookalikes.length >= 5 ? 'text-success' : 'text-muted-foreground'
                    )}
                  />
                  <span>
                    Lookalike analysis: {brandData.lookalikes.length} similar creators -{' '}
                    {brandData.lookalikes.length >= 5
                      ? 'Strong competitive benchmarking available'
                      : 'Limited competitive comparison data'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    iconId={
                      performanceData.trends.reputationHistory.length >= 6
                        ? 'faCheckLight'
                        : 'faCircleInfoLight'
                    }
                    className={cn(
                      'w-3 h-3',
                      performanceData.trends.reputationHistory.length >= 6
                        ? 'text-success'
                        : 'text-accent'
                    )}
                  />
                  <span>
                    Growth trajectory: {performanceData.trends.reputationHistory.length} months
                    tracked -{' '}
                    {performanceData.trends.reputationHistory.length >= 6
                      ? 'Reliable trend analysis available'
                      : 'Limited historical data for trend analysis'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
