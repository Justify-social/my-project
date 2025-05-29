'use client';

import React, { useState } from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  extractInsightIQData,
  validateProgressValue,
} from '@/lib/data-extraction/insightiq-extractor-profile-analytics';

interface BrandIntelligenceHubProps {
  influencer: InfluencerProfileData;
}

interface BrandAffinityItem {
  name?: string;
  hashtag?: string;
  value: number;
  category?: string;
}

// Helper function to format brand affinity value
const formatAffinityValue = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Helper function to get top items from array
const getTopBrandItems = <T extends { value: number }>(items: T[], limit: number = 8): T[] => {
  return items.sort((a, b) => b.value - a.value).slice(0, limit);
};

// Brand affinity card component
interface BrandAffinityCardProps {
  title: string;
  icon: string;
  data: BrandAffinityItem[];
  limit?: number;
  type: 'brand' | 'hashtag' | 'interest';
}

const BrandAffinityCard: React.FC<BrandAffinityCardProps> = ({
  title,
  icon,
  data,
  limit = 6,
  type,
}) => {
  const topItems = getTopBrandItems(data, limit);

  if (topItems.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon iconId={icon} className="w-4 h-4 text-accent" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-xs text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon iconId={icon} className="w-4 h-4 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topItems.map((item, index) => {
          const label = getItemName(item, type);
          const isTopTier = index < 2;

          return (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg transition-colors',
                isTopTier ? 'bg-accent/5 border border-accent/20' : 'bg-muted/20'
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isTopTier ? 'bg-accent' : 'bg-muted-foreground'
                  )}
                />
                <span className="text-sm font-medium truncate">{label}</span>
                {item.category && (
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {formatAffinityValue(item.value)}
                </span>
                <div className="w-12">
                  <Progress
                    value={validateProgressValue(item.value, `brand-${item.name}`)}
                    className="h-1"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// Brand alignment score component
interface BrandAlignmentProps {
  brandAffinity: Array<{ name: string; value: number }>;
  audienceInterests: Array<{ name: string; value: number }>;
  topHashtags: Array<{ name: string }>;
}

const BrandAlignmentScore: React.FC<BrandAlignmentProps> = ({
  brandAffinity,
  audienceInterests,
  topHashtags,
}) => {
  // Calculate brand alignment score from real data
  const calculateAlignmentScore = (): number => {
    const brandCount = brandAffinity.length;
    const interestCount = audienceInterests.length;
    const hashtagCount = topHashtags.length;

    if (brandCount === 0 && interestCount === 0) return 0;

    // Calculate weighted score based on data availability and diversity
    const brandScore = Math.min(brandCount / 10, 1) * 40; // Max 40 points for brand diversity
    const interestScore = Math.min(interestCount / 15, 1) * 35; // Max 35 points for interest diversity
    const hashtagScore = Math.min(hashtagCount / 20, 1) * 25; // Max 25 points for hashtag strategy

    return Math.round(brandScore + interestScore + hashtagScore);
  };

  const alignmentScore = calculateAlignmentScore();

  const getAlignmentLevel = (): 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'LIMITED' => {
    if (alignmentScore >= 80) return 'EXCELLENT';
    if (alignmentScore >= 60) return 'GOOD';
    if (alignmentScore >= 40) return 'AVERAGE';
    return 'LIMITED';
  };

  const alignmentLevel = getAlignmentLevel();

  const getAlignmentStyles = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return {
          bg: 'bg-success/10 border-success/20',
          text: 'text-success',
          icon: 'faStarLight',
        };
      case 'GOOD':
        return {
          bg: 'bg-primary/10 border-primary/20',
          text: 'text-primary',
          icon: 'faStarLight',
        };
      case 'AVERAGE':
        return {
          bg: 'bg-warning/10 border-warning/20',
          text: 'text-warning',
          icon: 'faStarLight',
        };
      case 'LIMITED':
        return {
          bg: 'bg-destructive/10 border-destructive/20',
          text: 'text-destructive',
          icon: 'faStarLight',
        };
      default:
        return {
          bg: 'bg-muted/10 border-muted/20',
          text: 'text-muted-foreground',
          icon: 'faStarLight',
        };
    }
  };

  const styles = getAlignmentStyles(alignmentLevel);
  const topBrand = brandAffinity.length > 0 ? brandAffinity[0] : null;

  return (
    <div className={cn('p-4 rounded-lg border', styles.bg)}>
      <div className="flex items-center gap-3 mb-3">
        <Icon iconId={styles.icon} className={cn('w-5 h-5', styles.text)} />
        <div>
          <span className="font-medium text-foreground">Brand Alignment</span>
          <Badge variant="outline" className={cn('ml-2 text-xs', styles.text)}>
            {alignmentLevel}
          </Badge>
        </div>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Alignment Score</span>
          <span className="font-medium">{alignmentScore}/100</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Brand Categories</span>
          <span className="font-medium">{brandAffinity.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Interest Areas</span>
          <span className="font-medium">{audienceInterests.length}</span>
        </div>
        {topBrand && (
          <div className="flex items-center justify-between">
            <span>Top Affinity</span>
            <span className="font-medium">
              {topBrand.name} ({formatAffinityValue(topBrand.value)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const BrandIntelligenceHub: React.FC<BrandIntelligenceHubProps> = ({ influencer }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // 🎯 SSOT: Use centralized data extraction
  const extractedData = extractInsightIQData(influencer);
  const audienceData = extractedData.audience;
  const contentData = extractedData.content;

  // Calculate brand partnership readiness score
  const getPartnershipReadiness = (): number => {
    const brandCount = audienceData.brandAffinity.length;
    const interestCount = audienceData.interests.length;
    const hashtagCount = contentData.strategy.topHashtags.length;
    const sponsoredExp = contentData.sponsoredContents.length;

    // Partnership readiness based on brand data richness and sponsored experience
    const dataRichness = Math.min((brandCount + interestCount + hashtagCount) / 30, 1) * 70;
    const experience = Math.min(sponsoredExp / 5, 1) * 30;

    return Math.round(dataRichness + experience);
  };

  const partnershipReadiness = getPartnershipReadiness();

  // Calculate brand alignment level
  const getBrandAlignmentLevel = (): 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'LIMITED' => {
    const brandCount = audienceData.brandAffinity.length;
    const interestCount = audienceData.interests.length;
    const hashtagCount = contentData.strategy.topHashtags.length;

    const brandScore = Math.min(brandCount / 10, 1) * 40;
    const interestScore = Math.min(interestCount / 15, 1) * 35;
    const hashtagScore = Math.min(hashtagCount / 20, 1) * 25;
    const alignmentScore = Math.round(brandScore + interestScore + hashtagScore);

    if (alignmentScore >= 80) return 'EXCELLENT';
    if (alignmentScore >= 60) return 'GOOD';
    if (alignmentScore >= 40) return 'AVERAGE';
    return 'LIMITED';
  };

  const alignmentLevel = getBrandAlignmentLevel();

  // Transform hashtags to include synthetic values based on position (earlier = higher value)
  const transformedHashtags = contentData.strategy.topHashtags.map((hashtag, index) => ({
    name: hashtag.name,
    hashtag: hashtag.name,
    value: Math.max(0.1, 1 - index * 0.1), // Decreasing value based on position
    category: undefined,
  }));

  // Don't render if no brand data available
  if (
    audienceData.brandAffinity.length === 0 &&
    audienceData.interests.length === 0 &&
    contentData.strategy.topHashtags.length === 0
  ) {
    return (
      <Card className="border-accent/20">
        <CardContent className="p-6 text-center">
          <Icon iconId="faTagLight" className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Brand intelligence data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faTagLight" className="text-accent w-5 h-5" />
            <span className="text-primary">Brand Intelligence</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs bg-primary/10 text-primary border-primary/20"
            >
              <Icon iconId="faRocketLight" className="w-3 h-3 mr-1" />
              Partnership: {partnershipReadiness}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Live Data
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Brand Alignment Overview */}
        <BrandAlignmentScore
          brandAffinity={audienceData.brandAffinity}
          audienceInterests={audienceData.interests}
          topHashtags={contentData.strategy.topHashtags}
        />

        {/* Brand Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Brand Affinity */}
          {audienceData.brandAffinity.length > 0 && (
            <BrandAffinityCard
              title="Brand Affinity"
              icon="faHeartLight"
              data={audienceData.brandAffinity}
              limit={6}
              type="brand"
            />
          )}

          {/* Audience Interests */}
          {audienceData.interests.length > 0 && (
            <BrandAffinityCard
              title="Interest Categories"
              icon="faBullseyeLight"
              data={audienceData.interests}
              limit={6}
              type="interest"
            />
          )}

          {/* Top Hashtags */}
          {contentData.strategy.topHashtags.length > 0 && (
            <BrandAffinityCard
              title="Hashtag Strategy"
              icon="faTagLight"
              data={transformedHashtags}
              limit={8}
              type="hashtag"
            />
          )}
        </div>

        {/* Partnership Recommendations */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
            <Icon iconId="faLightbulbLight" className="w-4 h-4" />
            Partnership Recommendations
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div className="font-medium text-foreground">Best Fit Categories:</div>
              {audienceData.brandAffinity.slice(0, 3).map((brand, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <Icon iconId="faCheckLight" className="w-3 h-3 text-success" />
                  <span>
                    {brand.name} ({formatAffinityValue(brand.value)})
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="font-medium text-foreground">Strategic Hashtags:</div>
              {transformedHashtags.slice(0, 3).map((hashtag, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <Icon iconId="faTagLight" className="w-3 h-3 text-accent" />
                  <span>#{hashtag.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progressive Disclosure Trigger */}
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faChartLineLight" className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-secondary">
              Detailed brand analysis and competitive insights available
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-accent hover:bg-accent/10 hover:text-accent"
            onClick={() => setExpandedSection(expandedSection === 'brand' ? null : 'brand')}
          >
            <Icon
              iconId={expandedSection === 'brand' ? 'faChevronUpLight' : 'faChevronDownLight'}
              className="mr-2 w-4 h-4"
            />
            {expandedSection === 'brand' ? 'Hide Details' : 'View Brand Analysis'}
          </Button>
        </div>

        {/* Expandable Detailed Analysis */}
        {expandedSection === 'brand' && (
          <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
            <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Icon iconId="faChartBarLight" className="w-5 h-5 text-accent" />
              Detailed Brand Analysis
            </h4>

            {/* Content Strategy Insights */}
            {contentData.strategy.topHashtags.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-secondary">Content Strategy</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {transformedHashtags.slice(0, 8).map((hashtag, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-muted/20 border border-border/50 text-center"
                    >
                      <div className="text-sm font-medium">#{hashtag.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatAffinityValue(hashtag.value)} relevance
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Partnership Matrix */}
            {audienceData.brandAffinity.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-secondary">Partnership Compatibility</h5>
                <div className="space-y-2">
                  {audienceData.brandAffinity.slice(0, 8).map((brand, index) => {
                    const compatibility =
                      brand.value >= 0.7 ? 'HIGH' : brand.value >= 0.4 ? 'MEDIUM' : 'LOW';
                    const compatibilityColor =
                      compatibility === 'HIGH'
                        ? 'text-success'
                        : compatibility === 'MEDIUM'
                          ? 'text-warning'
                          : 'text-destructive';

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{brand.name}</span>
                          <Badge variant="outline" className={cn('text-xs', compatibilityColor)}>
                            {compatibility}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatAffinityValue(brand.value)}
                          </span>
                          <div className="w-16">
                            <Progress
                              value={validateProgressValue(
                                brand.value,
                                `partnership-${brand.name}`
                              )}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Brand Partnership Summary */}
            <div className="p-4 rounded-lg bg-success/10 border border-success/20 animate-in slide-in-from-bottom-3 duration-500 delay-1200">
              <div className="flex items-center gap-3 mb-3">
                <Icon iconId="faClipboardLight" className="w-5 h-5 text-success" />
                <span className="font-medium text-primary">Brand Partnership Summary</span>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
                  {alignmentLevel} Alignment
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const getItemName = (item: BrandAffinityItem, type: 'brand' | 'hashtag' | 'interest') =>
  type === 'hashtag' ? `#${item.hashtag || item.name}` : item.name || 'Other';
