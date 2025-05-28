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
import { LineChart } from '@/components/ui/chart-line';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  extractInsightIQData,
  validateProgressValue,
} from '@/lib/data-extraction/insightiq-extractor-profile-analytics';

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
const formatPercentage = (num: number | null): string => {
  if (num === null || num === undefined) return 'N/A';
  return `${Math.round(num)}%`;
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
                  <span className="text-xs text-success font-medium">
                    {lookalike.similarityScore ? lookalike.similarityScore.toFixed(0) : 'N/A'}%
                  </span>
                </div>
                <Progress
                  value={validateProgressValue(
                    lookalike.similarityScore || 0,
                    `similarity-${lookalike.platformUsername}`
                  )}
                  className="h-1"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 📊 **MIT-PROFESSOR LEVEL GROWTH TREND ANALYSIS COMPONENT**
// Comprehensive multi-dimensional growth visualization with statistical analysis
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
  const [activeMetric, setActiveMetric] = useState<'followers' | 'engagement' | 'growth'>(
    'followers'
  );

  if (reputationHistory.length === 0) {
    return (
      <div className="text-center py-6">
        <Icon iconId="faChartLineLight" className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No historical data available for trend analysis
        </p>
      </div>
    );
  }

  // 🧮 **STATISTICAL ANALYSIS & DATA TRANSFORMATION**

  // Transform raw data into chart-compatible format with enhanced metrics
  const transformDataForChart = () => {
    return reputationHistory.map((period, index) => {
      const currentValue = period.followerCount || 0;
      const previousValue =
        index > 0 ? reputationHistory[index - 1].followerCount || 0 : currentValue;

      // Calculate month-over-month growth rate
      const growthRate =
        previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

      // Calculate engagement rate proxy (likes per follower)
      const engagementProxy =
        currentValue > 0 && period.averageLikes ? (period.averageLikes / currentValue) * 100 : 0;

      return {
        date: period.month,
        followers: currentValue,
        likes: period.averageLikes || 0,
        engagement: Math.round(engagementProxy * 100) / 100, // Round to 2 decimal places
        growthRate: Math.round(growthRate * 100) / 100,
        following: period.followingCount || 0,
        subscribers: period.subscriberCount || 0,
      };
    });
  };

  // Calculate moving averages for trend smoothing
  const calculateMovingAverage = (data: any[], field: string, window: number = 3) => {
    return data.map((item, index) => {
      if (index < window - 1) return { ...item, [`${field}MA`]: item[field] };

      const windowSum = data
        .slice(index - window + 1, index + 1)
        .reduce((sum, curr) => sum + (curr[field] || 0), 0);

      return { ...item, [`${field}MA`]: Math.round((windowSum / window) * 100) / 100 };
    });
  };

  const chartData = transformDataForChart();
  const enhancedData = calculateMovingAverage(
    calculateMovingAverage(chartData, 'followers'),
    'engagement'
  );

  // 📈 **TREND ANALYSIS & STATISTICAL INSIGHTS**

  const analyseTrends = () => {
    if (chartData.length < 2) return null;

    const followerGrowthRates = chartData.slice(1).map(d => d.growthRate);
    const avgGrowthRate =
      followerGrowthRates.reduce((sum, rate) => sum + rate, 0) / followerGrowthRates.length;

    // Calculate volatility (standard deviation of growth rates)
    const variance =
      followerGrowthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowthRate, 2), 0) /
      followerGrowthRates.length;
    const volatility = Math.sqrt(variance);

    // Determine trend direction using linear regression
    const xValues = chartData.map((_, i) => i);
    const yValues = chartData.map(d => d.followers);
    const n = chartData.length;

    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const trendDirection = slope > 0 ? 'ASCENDING' : slope < 0 ? 'DESCENDING' : 'STABLE';

    // Calculate R-squared for trend strength
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const yPredicted = xValues.map(x => sumY / n + slope * (x - sumX / n));
    const ssRes = yValues.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
    const rSquared = 1 - ssRes / ssTotal;
    const trendStrength = rSquared > 0.7 ? 'STRONG' : rSquared > 0.4 ? 'MODERATE' : 'WEAK';

    return {
      avgGrowthRate: Math.round(avgGrowthRate * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      trendDirection,
      trendStrength,
      rSquared: Math.round(rSquared * 1000) / 1000,
      totalGrowth:
        chartData.length > 0
          ? Math.round(
              ((chartData[chartData.length - 1].followers - chartData[0].followers) /
                chartData[0].followers) *
                10000
            ) / 100
          : 0,
    };
  };

  const trends = analyseTrends();

  // 🎨 **STYLING & VISUAL HELPERS**

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'ASCENDING':
        return 'text-success';
      case 'DESCENDING':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'ASCENDING':
        return 'faArrowTrendUpLight';
      case 'DESCENDING':
        return 'faArrowTrendDownLight';
      default:
        return 'faArrowRightLight';
    }
  };

  // 📊 **CHART CONFIGURATIONS FOR DIFFERENT METRICS**

  const getChartConfig = (metric: string) => {
    switch (metric) {
      case 'followers':
        return {
          lines: [
            { dataKey: 'followers', name: 'Followers', stroke: 'hsl(var(--primary))' },
            { dataKey: 'followersMA', name: '3-Month Avg', stroke: 'hsl(var(--accent))' },
          ],
          height: 320,
          title: 'Follower Growth Trajectory',
        };
      case 'engagement':
        return {
          lines: [
            { dataKey: 'engagement', name: 'Engagement Rate', stroke: 'hsl(var(--success))' },
            { dataKey: 'engagementMA', name: '3-Month Avg', stroke: 'hsl(var(--warning))' },
            { dataKey: 'likes', name: 'Avg Likes', stroke: 'hsl(var(--secondary))' },
          ],
          height: 320,
          title: 'Engagement Performance',
        };
      case 'growth':
        return {
          lines: [
            { dataKey: 'growthRate', name: 'Monthly Growth %', stroke: 'hsl(var(--interactive))' },
          ],
          height: 320,
          title: 'Growth Rate Analysis',
        };
      default:
        return { lines: [], height: 320, title: 'Metrics' };
    }
  };

  const currentConfig = getChartConfig(activeMetric);

  return (
    <div className="space-y-6">
      {/* 📈 STATISTICAL OVERVIEW DASHBOARD */}
      {trends && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon iconId="faChartLineLight" className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Trend Direction</span>
            </div>
            <div className={cn('text-lg font-bold', getTrendColor(trends.trendDirection))}>
              {trends.trendDirection}
            </div>
            <div className="text-xs text-muted-foreground">
              R² = {trends.rSquared} ({trends.trendStrength})
            </div>
          </div>

          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon iconId="faChartBarLight" className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-success">Avg Growth</span>
            </div>
            <div className="text-lg font-bold text-success">
              {trends.avgGrowthRate > 0 ? '+' : ''}
              {trends.avgGrowthRate}%
            </div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>

          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon iconId="faSignalLight" className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-accent">Volatility</span>
            </div>
            <div className="text-lg font-bold text-accent">{trends.volatility}%</div>
            <div className="text-xs text-muted-foreground">
              {trends.volatility < 10 ? 'Low' : trends.volatility < 25 ? 'Moderate' : 'High'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon iconId="faBullseyeLight" className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium text-secondary">Total Growth</span>
            </div>
            <div className="text-lg font-bold text-secondary">
              {trends.totalGrowth > 0 ? '+' : ''}
              {trends.totalGrowth}%
            </div>
            <div className="text-xs text-muted-foreground">{chartData.length} months tracked</div>
          </div>
        </div>
      )}

      {/* 🔄 INTERACTIVE METRIC SELECTOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium text-secondary">Growth Analysis Dashboard</h5>
          <Tabs
            value={activeMetric}
            onValueChange={value => setActiveMetric(value as any)}
            className="w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 gap-1 bg-muted/30 p-1 h-auto">
              <TabsTrigger
                value="followers"
                className="text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon iconId="faUsersLight" className="w-3 h-3 mr-1" />
                Followers
              </TabsTrigger>
              <TabsTrigger
                value="engagement"
                className="text-xs px-3 py-2 data-[state=active]:bg-success data-[state=active]:text-white"
              >
                <Icon iconId="faHeartLight" className="w-3 h-3 mr-1" />
                Engagement
              </TabsTrigger>
              <TabsTrigger
                value="growth"
                className="text-xs px-3 py-2 data-[state=active]:bg-interactive data-[state=active]:text-white"
              >
                <Icon iconId="faArrowTrendUpLight" className="w-3 h-3 mr-1" />
                Growth Rate
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 📈 COMPREHENSIVE CHART VISUALIZATION */}
        <div className="border border-border/50 rounded-lg p-4 bg-card/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon
                iconId={getTrendIcon(trends?.trendDirection || 'STABLE')}
                className={cn('w-4 h-4', getTrendColor(trends?.trendDirection || 'STABLE'))}
              />
              <span className="font-medium text-sm">{currentConfig.title}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {enhancedData.length} Data Points
            </Badge>
          </div>

          <LineChart
            data={enhancedData}
            xField="date"
            lines={currentConfig.lines}
            height={currentConfig.height}
            grid={true}
            legend={true}
            tooltip={true}
            dateFormat="MMM yyyy"
            className="w-full"
          />
        </div>

        {/* 🔍 DETAILED INSIGHTS & ANNOTATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
            <h6 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Icon iconId="faLightbulbLight" className="w-4 h-4 text-warning" />
              Key Insights
            </h6>
            <div className="space-y-2 text-xs text-muted-foreground">
              {trends && (
                <>
                  <div className="flex items-center gap-2">
                    <Icon iconId="faCheckLight" className="w-3 h-3 text-success" />
                    <span>
                      {trends.trendDirection === 'ASCENDING'
                        ? `Positive growth trajectory with ${trends.trendStrength.toLowerCase()} trend correlation`
                        : trends.trendDirection === 'DESCENDING'
                          ? `Declining trend observed with ${trends.volatility}% volatility`
                          : `Stable performance with minimal fluctuation`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon iconId="faInfoLight" className="w-3 h-3 text-accent" />
                    <span>
                      Average monthly growth of {trends.avgGrowthRate}% over {chartData.length}{' '}
                      months
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon iconId="faBullseyeLight" className="w-3 h-3 text-primary" />
                    <span>
                      Growth consistency:{' '}
                      {trends.volatility < 10
                        ? 'Highly consistent'
                        : trends.volatility < 25
                          ? 'Moderately consistent'
                          : 'Highly variable'}{' '}
                      performance
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
            <h6 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Icon iconId="faCalendarLight" className="w-4 h-4 text-secondary" />
              Recent Performance
            </h6>
            <div className="space-y-2">
              {chartData.slice(-3).map((period, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{period.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {formatNumber(period.followers)} followers
                    </span>
                    {period.growthRate !== 0 && (
                      <span
                        className={cn(
                          'font-medium',
                          period.growthRate > 0 ? 'text-success' : 'text-destructive'
                        )}
                      >
                        ({period.growthRate > 0 ? '+' : ''}
                        {period.growthRate}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
  const [showAllLookalikes, setShowAllLookalikes] = useState(false);

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
                {brandData.lookalikes
                  .slice(0, showAllLookalikes ? brandData.lookalikes.length : 4)
                  .map((lookalike, index) => (
                    <LookalikeCard
                      key={index}
                      lookalike={lookalike}
                      currentInfluencerFollowers={performanceData.reputation.followerCount}
                    />
                  ))}
              </div>
              {brandData.lookalikes.length > 4 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-accent hover:bg-accent/10"
                    onClick={() => setShowAllLookalikes(!showAllLookalikes)}
                  >
                    <Icon
                      iconId={showAllLookalikes ? 'faMinusLight' : 'faPlusLight'}
                      className="w-4 h-4 mr-2"
                    />
                    {showAllLookalikes
                      ? 'Show Less'
                      : `View All ${brandData.lookalikes.length} Similar Creators`}
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
                            {lookalike.similarityScore
                              ? lookalike.similarityScore.toFixed(0)
                              : 'N/A'}
                            % match
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
