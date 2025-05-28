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
import { extractInsightIQData } from '@/lib/data-extraction/insightiq-extractor';

interface AudienceDemographicsHubProps {
  influencer: InfluencerProfileData;
}

// Helper function to format demographic percentages
const formatDemographicValue = (value: number): string => {
  // Value is already normalized as decimal (0.26 = 26%), so multiply by 100 for display
  return `${(value * 100).toFixed(1)}%`;
};

// Helper function to get top items from array
const getTopItems = <T extends { value: number }>(items: T[], limit: number = 5): T[] => {
  return items.sort((a, b) => b.value - a.value).slice(0, limit);
};

// Demographic card component
interface DemographicCardProps {
  title: string;
  icon: string;
  data: Array<{ name?: string; code?: string; value: number; ageRange?: string; gender?: string }>;
  limit?: number;
  showPercentages?: boolean;
}

const DemographicCard: React.FC<DemographicCardProps> = ({
  title,
  icon,
  data,
  limit = 5,
  showPercentages = true,
}) => {
  const topItems = getTopItems(data, limit);
  const maxValue = topItems.length > 0 ? topItems[0].value : 1;

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
          // For percentages: item.value is already normalized as decimal (0.26 = 26%)
          // For progress bar: need percentage of max value
          const displayValue = showPercentages ? item.value : item.value;
          const progressPercentage = (item.value / maxValue) * 100;
          const getDisplayName = (
            item: any,
            type: 'country' | 'city' | 'ageGender' | 'language' | 'interest'
          ) =>
            type === 'country' || type === 'city' || type === 'language' || type === 'interest'
              ? item.name || 'Other'
              : item.gender && item.ageRange
                ? `${item.gender} ${item.ageRange}`
                : 'Other';

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium truncate">
                  {getDisplayName(
                    item,
                    title.toLowerCase() as
                      | 'country'
                      | 'city'
                      | 'ageGender'
                      | 'language'
                      | 'interest'
                  )}
                </span>
                <span className="text-muted-foreground">
                  {showPercentages
                    ? formatDemographicValue(displayValue)
                    : displayValue.toLocaleString()}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// Audience quality indicator
interface AudienceQualityProps {
  credibilityScore: number | null;
  significantLikersPercentage: number | null;
  countries: Array<{ code: string; value: number }>;
}

const AudienceQualityIndicator: React.FC<AudienceQualityProps> = ({
  credibilityScore,
  significantLikersPercentage,
  countries,
}) => {
  const getQualityLevel = (): 'HIGH' | 'MEDIUM' | 'LOW' => {
    const score = credibilityScore || 0;
    const significantPercentage = significantLikersPercentage || 0;

    if (score >= 0.8 && significantPercentage >= 0.3) return 'HIGH';
    if (score >= 0.5 && significantPercentage >= 0.15) return 'MEDIUM';
    return 'LOW';
  };

  const qualityLevel = getQualityLevel();

  const getQualityStyles = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-success/10 border-success/20',
          text: 'text-success',
          icon: 'faStarLight',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-warning/10 border-warning/20',
          text: 'text-warning',
          icon: 'faStarLight',
        };
      case 'LOW':
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

  const styles = getQualityStyles(qualityLevel);
  const topCountry = countries.length > 0 ? countries[0] : null;

  return (
    <div className={cn('p-4 rounded-lg border', styles.bg)}>
      <div className="flex items-center gap-3 mb-3">
        <Icon iconId={styles.icon} className={cn('w-5 h-5', styles.text)} />
        <div>
          <span className="font-medium text-foreground">Audience Quality</span>
          <Badge variant="outline" className={cn('ml-2 text-xs', styles.text)}>
            {qualityLevel}
          </Badge>
        </div>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        {credibilityScore && (
          <div className="flex items-center justify-between">
            <span>Credibility Score</span>
            <span className="font-medium">{(credibilityScore * 100).toFixed(0)}%</span>
          </div>
        )}
        {significantLikersPercentage && (
          <div className="flex items-center justify-between">
            <span>Significant Likers</span>
            <span className="font-medium">{(significantLikersPercentage * 100).toFixed(1)}%</span>
          </div>
        )}
        {topCountry && (
          <div className="flex items-center justify-between">
            <span>Primary Market</span>
            <span className="font-medium">
              {topCountry.code.toUpperCase()} ({formatDemographicValue(topCountry.value)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AudienceDemographicsHub: React.FC<AudienceDemographicsHubProps> = ({ influencer }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // 🎯 SSOT: Use centralized data extraction
  const extractedData = extractInsightIQData(influencer);
  const audienceData = extractedData.audience;

  // Calculate audience diversity score from real data
  const getDiversityScore = (): number => {
    const countries = audienceData.demographics.countries;
    const languages = audienceData.demographics.languages;

    if (countries.length === 0) return 0;

    // Calculate diversity based on distribution spread
    const topCountryShare = countries[0]?.value || 0;
    const languageCount = languages.length;

    // Higher diversity = lower concentration in top country + more languages
    const diversityScore = Math.min(
      100,
      (1 - topCountryShare) * 70 + // Geographic diversity (70% weight)
        Math.min(languageCount / 5, 1) * 30 // Language diversity (30% weight)
    );

    return Math.round(diversityScore);
  };

  const diversityScore = getDiversityScore();

  // Calculate audience quality level
  const getAudienceQuality = (): 'HIGH' | 'MEDIUM' | 'LOW' => {
    const score = audienceData.likers.credibilityScore || 0;
    const significantPercentage = audienceData.likers.significantLikersPercentage || 0;

    if (score >= 0.8 && significantPercentage >= 0.3) return 'HIGH';
    if (score >= 0.5 && significantPercentage >= 0.15) return 'MEDIUM';
    return 'LOW';
  };

  const audienceQuality = getAudienceQuality();

  // Don't render if no audience data available
  if (
    audienceData.demographics.countries.length === 0 &&
    audienceData.demographics.genderAgeDistribution.length === 0
  ) {
    return (
      <Card className="border-accent/20">
        <CardContent className="p-6 text-center">
          <Icon iconId="faUsersLight" className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Audience demographics not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faUsersLight" className="text-accent w-5 h-5" />
            <span className="text-primary">Audience Demographics</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs bg-primary/10 text-primary border-primary/20"
            >
              <Icon iconId="faGlobeLight" className="w-3 h-3 mr-1" />
              Diversity: {diversityScore}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Live Data
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Audience Quality Overview */}
        <AudienceQualityIndicator
          credibilityScore={audienceData.likers.credibilityScore}
          significantLikersPercentage={audienceData.likers.significantLikersPercentage}
          countries={audienceData.demographics.countries}
        />

        {/* Demographics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Geographic Distribution */}
          <DemographicCard
            title="Top Countries"
            icon="faGlobeLight"
            data={audienceData.demographics.countries}
            limit={5}
          />

          {/* Gender & Age Distribution */}
          <DemographicCard
            title="Age & Gender"
            icon="faUserGroupLight"
            data={audienceData.demographics.genderAgeDistribution}
            limit={5}
          />

          {/* Language Distribution */}
          <DemographicCard
            title="Languages"
            icon="faCommentLight"
            data={audienceData.demographics.languages}
            limit={5}
          />

          {/* Top Cities */}
          {audienceData.demographics.cities.length > 0 && (
            <DemographicCard
              title="Top Cities"
              icon="faBuildingLight"
              data={audienceData.demographics.cities}
              limit={4}
            />
          )}

          {/* Audience Interests */}
          {audienceData.interests.length > 0 && (
            <DemographicCard
              title="Interests"
              icon="faHeartLight"
              data={audienceData.interests}
              limit={4}
            />
          )}

          {/* Brand Affinity */}
          {audienceData.brandAffinity.length > 0 && (
            <DemographicCard
              title="Brand Affinity"
              icon="faTagLight"
              data={audienceData.brandAffinity}
              limit={4}
            />
          )}
        </div>

        {/* Progressive Disclosure Trigger */}
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faChartLineLight" className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-secondary">
              Detailed demographic analysis and audience insights available
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-accent hover:bg-accent/10 hover:text-accent"
            onClick={() =>
              setExpandedSection(expandedSection === 'demographics' ? null : 'demographics')
            }
          >
            <Icon
              iconId={
                expandedSection === 'demographics' ? 'faChevronUpLight' : 'faChevronDownLight'
              }
              className="mr-2 w-4 h-4"
            />
            {expandedSection === 'demographics' ? 'Hide Details' : 'View Demographic Breakdown'}
          </Button>
        </div>

        {/* Expandable Detailed Analysis */}
        {expandedSection === 'demographics' && (
          <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
            <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Icon iconId="faChartBarLight" className="w-5 h-5 text-accent" />
              Detailed Audience Analysis
            </h4>

            {/* Credibility Band Analysis */}
            {audienceData.credibilityBand.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-secondary">Credibility Distribution</h5>
                <div className="grid grid-cols-2 gap-4">
                  {audienceData.credibilityBand.map((band, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm font-medium">
                        {band.min}% - {band.max}% Credibility
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {band.totalProfileCount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">profiles</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Significant Likers Analysis */}
            {audienceData.likers.significantLikers.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-secondary">Notable Followers</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {audienceData.likers.significantLikers.slice(0, 6).map((liker, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Icon iconId="faUserLight" className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">@{liker.platformUsername}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {liker.followerCount && (
                            <span>{(liker.followerCount / 1000).toFixed(0)}K followers</span>
                          )}
                          {liker.isVerified && (
                            <Icon iconId="faCircleCheckSolid" className="w-3 h-3 text-sky-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audience Vetting Summary */}
            <div className="p-4 rounded-lg bg-success/10 border border-success/20 animate-in slide-in-from-bottom-3 duration-500 delay-1000">
              <div className="flex items-center gap-3 mb-3">
                <Icon iconId="faClipboardLight" className="w-5 h-5 text-success" />
                <span className="font-medium text-primary">Audience Vetting Summary</span>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
                  {audienceQuality} Quality
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
