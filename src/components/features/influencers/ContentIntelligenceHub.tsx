'use client';

import React, { useState } from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { extractInsightIQData } from '@/lib/data-extraction/insightiq-extractor-profile-analytics';

interface ContentIntelligenceHubProps {
  influencer: InfluencerProfileData;
}

// Helper function to get content type display info
const getContentTypeInfo = (type: string) => {
  switch (type.toUpperCase()) {
    case 'VIDEO':
      return { icon: 'faVideoLight', label: 'Videos', color: 'text-accent' };
    case 'POST':
      return { icon: 'faImageLight', label: 'Posts', color: 'text-primary' };
    case 'STORY':
      return { icon: 'faCircleLight', label: 'Stories', color: 'text-warning' };
    case 'REEL':
      return { icon: 'faPlayLight', label: 'Reels', color: 'text-success' };
    default:
      return { icon: 'faFileLight', label: type, color: 'text-muted-foreground' };
  }
};

// Content quality score component
interface ContentQualityProps {
  score: number;
  label: string;
  description: string;
  icon: string;
}

const ContentQualityCard: React.FC<ContentQualityProps> = ({ score, label, description, icon }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-primary/10 border-primary/20';
    if (score >= 40) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'p-4 rounded-lg border cursor-help transition-all hover:shadow-sm',
              getScoreBackground(score)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon iconId={icon} className={cn('w-5 h-5', getScoreColor(score))} />
              <span className={cn('text-2xl font-bold', getScoreColor(score))}>{score}</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <Progress value={score} className="h-2" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm max-w-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Brand safety indicator component
interface BrandSafetyProps {
  level: 'SAFE' | 'CAUTION' | 'RISK';
  details: string[];
}

const BrandSafetyIndicator: React.FC<BrandSafetyProps> = ({ level, details }) => {
  const getSafetyStyles = (level: string) => {
    switch (level) {
      case 'SAFE':
        return {
          bg: 'bg-success/10 border-success/20',
          text: 'text-success',
          icon: 'faShieldLight',
        };
      case 'CAUTION':
        return {
          bg: 'bg-warning/10 border-warning/20',
          text: 'text-warning',
          icon: 'faTriangleExclamationLight',
        };
      case 'RISK':
        return {
          bg: 'bg-destructive/10 border-destructive/20',
          text: 'text-destructive',
          icon: 'faShieldLight',
        };
      default:
        return {
          bg: 'bg-muted/10 border-muted/20',
          text: 'text-muted-foreground',
          icon: 'faShieldLight',
        };
    }
  };

  const styles = getSafetyStyles(level);

  return (
    <div className={cn('p-4 rounded-lg border', styles.bg)}>
      <div className="flex items-center gap-3 mb-3">
        <Icon iconId={styles.icon} className={cn('w-5 h-5', styles.text)} />
        <div>
          <span className="font-medium text-foreground">Brand Safety</span>
          <Badge variant="outline" className={cn('ml-2 text-xs', styles.text)}>
            {level}
          </Badge>
        </div>
      </div>
      <div className="space-y-1">
        {details.map((detail, index) => (
          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon iconId="faCircleLight" className="w-2 h-2" />
            <span>{detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ContentIntelligenceHub: React.FC<ContentIntelligenceHubProps> = ({ influencer }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // 🎯 SSOT: Use centralized data extraction
  const extractedData = extractInsightIQData(influencer);
  const contentData = extractedData.content;
  const performanceData = extractedData.performance;

  // ✅ FIXED: Use ONLY real API data, no synthetic calculations
  const realApiMetrics = {
    engagementRate: performanceData.engagement.rate ? performanceData.engagement.rate * 100 : null, // Real engagement rate as number
    totalContent: contentData.contentAnalysis.totalCount || null, // Real content count from API
    hiddenLikesPercentage: contentData.contentAnalysis.hiddenLikesPercentage
      ? contentData.contentAnalysis.hiddenLikesPercentage * 100
      : null, // Real hidden likes percentage as number
    averageLikes: performanceData.engagement.averageLikes || null, // Real average likes from API
    averageComments: performanceData.engagement.averageComments || null, // Real average comments from API
    averageViews: performanceData.engagement.averageViews || null, // Real average views from API
    sponsoredCount: performanceData.sponsored.postsCount || 0, // Real sponsored content count
    sponsoredEngagement: performanceData.sponsored.sponsoredEngagementAverage
      ? performanceData.sponsored.sponsoredEngagementAverage * 100
      : null, // Real sponsored engagement as number
    performanceRanking: contentData.contentAnalysis.performanceRanking || 'UNKNOWN', // Real API ranking
  };

  // Calculate brand safety assessment from real API data only
  const getBrandSafetyLevel = (): 'SAFE' | 'CAUTION' | 'RISK' => {
    const hiddenLikesPercent = realApiMetrics.hiddenLikesPercentage || 0;
    const sponsoredRatio =
      realApiMetrics.sponsoredCount && realApiMetrics.totalContent
        ? realApiMetrics.sponsoredCount / realApiMetrics.totalContent
        : 0;

    // ✅ FIXED: Use real API thresholds based on actual data ranges
    if (hiddenLikesPercent > 50 || sponsoredRatio > 0.8) return 'RISK'; // 50% hidden likes or 80% sponsored
    if (hiddenLikesPercent > 20 || sponsoredRatio > 0.5) return 'CAUTION'; // 20% hidden likes or 50% sponsored
    return 'SAFE';
  };

  const brandSafetyLevel = getBrandSafetyLevel();

  // Generate brand safety details from real API data only
  const getBrandSafetyDetails = (): string[] => {
    const details: string[] = [];
    const hiddenLikesPercent = realApiMetrics.hiddenLikesPercentage || 0;
    const sponsoredCount = realApiMetrics.sponsoredCount || 0;
    const totalContent = realApiMetrics.totalContent || 0;

    if (hiddenLikesPercent < 10) {
      details.push('Low hidden likes percentage indicates authentic engagement');
    } else if (hiddenLikesPercent > 30) {
      details.push('High hidden likes percentage may indicate engagement concerns');
    }

    if (sponsoredCount > 0) {
      details.push(`${sponsoredCount} sponsored posts tracked for partnership experience`);
    } else {
      details.push('No sponsored content detected in recent posts');
    }

    if (totalContent > 20) {
      details.push('Consistent content creation with adequate posting volume');
    } else if (totalContent > 0) {
      details.push('Limited recent content available for analysis');
    }

    details.push(`Performance ranking: ${realApiMetrics.performanceRanking}`);

    return details;
  };

  const brandSafetyDetails = getBrandSafetyDetails();

  // Don't render if no content data available
  if (!contentData.contentAnalysis.totalCount && !contentData.topContents.length) {
    return (
      <Card className="border-accent/20">
        <CardContent className="p-6 text-center">
          <Icon iconId="faImagesLight" className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Content analysis not available</p>
        </CardContent>
      </Card>
    );
  }

  // Create content type distribution from available data
  const contentTypes = [
    { type: 'TOP', count: contentData.topContents.length },
    { type: 'RECENT', count: contentData.recentContents.length },
    { type: 'SPONSORED', count: contentData.sponsoredContents.length },
    // Additional content types could be extracted from actual content analysis
  ].filter(item => item.count > 0);

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faFileLinesLight" className="text-accent w-5 h-5" />
            <span className="text-primary">Content Intelligence</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs bg-primary/10 text-primary border-primary/20"
            >
              <Icon iconId="faSparklesLight" className="w-3 h-3 mr-1" />
              Engagement:{' '}
              {realApiMetrics.engagementRate
                ? `${realApiMetrics.engagementRate.toFixed(2)}%`
                : 'N/A'}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Last 30 Days
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Content Quality Dashboard */}
        <div className="space-y-4 animate-in fade-in duration-500 delay-300">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Icon iconId="faBullseyeLight" className="w-4 h-4 text-accent" />
            Brand Alignment Focus
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ContentQualityCard
              score={realApiMetrics.engagementRate || 0}
              label="Engagement Rate"
              description="Real engagement rate for this influencer"
              icon="faStarLight"
            />
            <ContentQualityCard
              score={realApiMetrics.totalContent || 0}
              label="Total Content"
              description="Total number of posts analysed"
              icon="faCalendarLight"
            />
            <ContentQualityCard
              score={realApiMetrics.averageLikes || 0}
              label="Average Likes"
              description="Average likes per post"
              icon="faHeartLight"
            />
            <ContentQualityCard
              score={realApiMetrics.hiddenLikesPercentage || 0}
              label="Hidden Likes %"
              description="Percentage of posts with hidden likes"
              icon="faShieldLight"
            />
          </div>
        </div>

        {/* Content Type Distribution */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Icon iconId="faChartPieLight" className="w-4 h-4 text-accent" />
            Content Type Distribution
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {contentTypes.slice(0, 4).map((contentType, index) => {
              const typeInfo = getContentTypeInfo(contentType.type);
              const percentage = contentData.contentAnalysis.totalCount
                ? Math.round((contentType.count / contentData.contentAnalysis.totalCount) * 100)
                : 0;

              return (
                <div key={index} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon iconId={typeInfo.icon} className={cn('w-4 h-4', typeInfo.color)} />
                      <span className="text-sm font-medium">{typeInfo.label}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{percentage}%</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {contentType.count} {contentType.count === 1 ? 'post' : 'posts'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Safety Assessment */}
        <div className="space-y-4 animate-in fade-in duration-500 delay-700">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Icon iconId="faShieldLight" className="w-4 h-4 text-accent" />
            Brand Safety Assessment
          </h4>
          <BrandSafetyIndicator level={brandSafetyLevel} details={brandSafetyDetails} />
        </div>

        {/* Sponsored Content Analysis */}
        {performanceData.sponsored.postsCount && performanceData.sponsored.postsCount > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Icon iconId="faTagLight" className="w-4 h-4 text-accent" />
                Sponsored Content Analysis
              </h4>

              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/20">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">
                    {performanceData.sponsored.postsCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Sponsored Posts</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-success">
                    {performanceData.sponsored.performance
                      ? `${performanceData.sponsored.performance.toFixed(1)}%`
                      : performanceData.sponsored.sponsoredEngagementAverage
                        ? `${performanceData.sponsored.sponsoredEngagementAverage.toFixed(1)}%`
                        : 'No sponsored data'}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Performance</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-accent">
                    {contentData.contentAnalysis.totalCount
                      ? Math.round(
                          (performanceData.sponsored.postsCount /
                            contentData.contentAnalysis.totalCount) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Sponsored Ratio</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Progressive Disclosure Trigger */}
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faChartLineLight" className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-secondary">
              Detailed content analysis and trending topics available
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-accent hover:bg-accent/10 hover:text-accent"
            onClick={() => setExpandedSection(expandedSection === 'content' ? null : 'content')}
          >
            <Icon
              iconId={expandedSection === 'content' ? 'faChevronUpLight' : 'faChevronDownLight'}
              className="mr-2 w-4 h-4"
            />
            {expandedSection === 'content' ? 'Hide Details' : 'View Content Breakdown'}
          </Button>
        </div>

        {/* Expandable Detailed Analysis */}
        {expandedSection === 'content' && (
          <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
            <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Icon iconId="faSearchLight" className="w-5 h-5 text-accent" />
              Detailed Content Analysis
            </h4>

            {/* Content Performance Ranking */}
            {contentData.contentAnalysis.performanceRanking && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-secondary">Performance Analysis</h5>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Content Performance Ranking</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        contentData.contentAnalysis.performanceRanking === 'EXCELLENT'
                          ? 'bg-success/10 text-success border-success/20'
                          : contentData.contentAnalysis.performanceRanking === 'GOOD'
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : contentData.contentAnalysis.performanceRanking === 'AVERAGE'
                              ? 'bg-accent/10 text-accent border-accent/20'
                              : 'bg-warning/10 text-warning border-warning/20'
                      )}
                    >
                      {contentData.contentAnalysis.performanceRanking}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on engagement rates, reach, and audience interaction across{' '}
                    {contentData.contentAnalysis.totalCount} posts
                  </p>
                </div>
              </div>
            )}

            {/* Content Vetting Summary */}
            <div className="p-4 rounded-lg bg-success/10 border border-success/20 animate-in slide-in-from-bottom-3 duration-500 delay-1300">
              <div className="flex items-center gap-3 mb-3">
                <Icon iconId="faClipboardLight" className="w-5 h-5 text-success" />
                <span className="font-medium text-primary">Content Vetting Summary</span>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
                  {realApiMetrics.engagementRate
                    ? `${realApiMetrics.engagementRate.toFixed(2)}%`
                    : 'N/A'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <Icon
                    iconId={
                      realApiMetrics.hiddenLikesPercentage &&
                      realApiMetrics.hiddenLikesPercentage >= 80
                        ? 'faCheckLight'
                        : 'faTriangleExclamationLight'
                    }
                    className={cn(
                      'w-3 h-3',
                      realApiMetrics.hiddenLikesPercentage &&
                        realApiMetrics.hiddenLikesPercentage >= 80
                        ? 'text-success'
                        : 'text-warning'
                    )}
                  />
                  <span>
                    Brand safety score:{' '}
                    {realApiMetrics.hiddenLikesPercentage
                      ? `${realApiMetrics.hiddenLikesPercentage.toFixed(1)}%`
                      : 'N/A'}{' '}
                    -{' '}
                    {realApiMetrics.hiddenLikesPercentage &&
                    realApiMetrics.hiddenLikesPercentage >= 80
                      ? 'Excellent for partnerships'
                      : 'Requires review'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    iconId={
                      realApiMetrics.totalContent && realApiMetrics.totalContent > 0
                        ? 'faCheckLight'
                        : 'faCircleInfoLight'
                    }
                    className={cn(
                      'w-3 h-3',
                      realApiMetrics.totalContent && realApiMetrics.totalContent > 0
                        ? 'text-success'
                        : 'text-accent'
                    )}
                  />
                  <span>
                    Content consistency:{' '}
                    {realApiMetrics.totalContent && realApiMetrics.totalContent > 0
                      ? 'Regular posting schedule maintained'
                      : 'Irregular posting pattern'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    iconId={
                      performanceData.sponsored.postsCount &&
                      performanceData.sponsored.postsCount > 0
                        ? 'faCheckLight'
                        : 'faCircleInfoLight'
                    }
                    className={cn(
                      'w-3 h-3',
                      performanceData.sponsored.postsCount &&
                        performanceData.sponsored.postsCount > 0
                        ? 'text-success'
                        : 'text-accent'
                    )}
                  />
                  <span>
                    Sponsored content experience:{' '}
                    {performanceData.sponsored.postsCount &&
                    performanceData.sponsored.postsCount > 0
                      ? `${performanceData.sponsored.postsCount} previous partnerships tracked`
                      : 'No previous sponsored content detected'}
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
