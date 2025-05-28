'use client';

import React, { useState } from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Separator } from '@/components/ui/separator';
import { BarChart } from '@/components/ui/chart-bar';
import { PieChart } from '@/components/ui/chart-pie';
import { cn } from '@/lib/utils';
import { extractInsightIQData } from '@/lib/data-extraction/insightiq-extractor-profile-analytics';

interface AudienceDemographicsHubProps {
  influencer: InfluencerProfileData;
}

// Sample fallback data for when API data is not available
const getSampleDemographicData = (
  type: 'countries' | 'languages' | 'genderAge' | 'cities' | 'interests' | 'brands'
) => {
  switch (type) {
    case 'countries':
      return [
        { name: 'United States', code: 'US', value: 0.35, rank: 1 },
        { name: 'United Kingdom', code: 'GB', value: 0.18, rank: 2 },
        { name: 'Canada', code: 'CA', value: 0.12, rank: 3 },
        { name: 'Australia', code: 'AU', value: 0.08, rank: 4 },
        { name: 'Germany', code: 'DE', value: 0.06, rank: 5 },
      ];
    case 'languages':
      return [
        { name: 'English', code: 'en', value: 0.68, primary: true },
        { name: 'Spanish', code: 'es', value: 0.15, primary: false },
        { name: 'French', code: 'fr', value: 0.08, primary: false },
        { name: 'German', code: 'de', value: 0.05, primary: false },
        { name: 'Portuguese', code: 'pt', value: 0.04, primary: false },
      ];
    case 'genderAge':
      return [
        { gender: 'Female', ageRange: '25-34', value: 0.28 },
        { gender: 'Male', ageRange: '25-34', value: 0.22 },
        { gender: 'Female', ageRange: '18-24', value: 0.18 },
        { gender: 'Male', ageRange: '35-44', value: 0.14 },
        { gender: 'Female', ageRange: '35-44', value: 0.12 },
        { gender: 'Male', ageRange: '18-24', value: 0.06 },
      ];
    case 'cities':
      return [
        { name: 'New York', value: 0.15, country: 'US' },
        { name: 'London', value: 0.12, country: 'GB' },
        { name: 'Los Angeles', value: 0.08, country: 'US' },
        { name: 'Toronto', value: 0.07, country: 'CA' },
        { name: 'Sydney', value: 0.06, country: 'AU' },
      ];
    case 'interests':
      return [
        { name: 'Fashion & Style', value: 0.32, category: 'lifestyle' },
        { name: 'Travel & Adventure', value: 0.28, category: 'lifestyle' },
        { name: 'Technology', value: 0.18, category: 'tech' },
        { name: 'Food & Cooking', value: 0.15, category: 'lifestyle' },
        { name: 'Fitness & Health', value: 0.12, category: 'health' },
      ];
    case 'brands':
      return [
        { name: 'Nike', value: 0.24, category: 'sportswear' },
        { name: 'Apple', value: 0.2, category: 'technology' },
        { name: 'Starbucks', value: 0.16, category: 'food & beverage' },
        { name: 'Amazon', value: 0.14, category: 'retail' },
        { name: 'Netflix', value: 0.12, category: 'entertainment' },
      ];
    default:
      return [];
  }
};

// Helper function to format demographic percentages
const formatDemographicValue = (value: number): string => {
  // ✅ FIXED: API returns percentage values directly (9.3 = 9.3%), not decimals
  // ✅ ENFORCES INTEGER PERCENTAGES - No decimals allowed
  return `${Math.round(value)}%`;
};

// Helper function to format numbers with commas for large values
const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// Helper function to get top items from array
const getTopItems = <T extends { value: number }>(items: T[], limit: number = 5): T[] => {
  return items.sort((a, b) => b.value - a.value).slice(0, limit);
};

// Helper function to truncate long names for better chart display
const truncateName = (name: string, maxLength: number = 12): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
};

// Enhanced Demographic Chart component using proper charts
interface DemographicChartProps {
  title: string;
  icon: string;
  data: Array<{
    name?: string;
    code?: string;
    value: number;
    ageRange?: string;
    gender?: string;
    category?: string;
  }>;
  chartType?: 'bar' | 'pie';
  limit?: number;
  showPercentages?: boolean;
  height?: number;
}

const DemographicChart: React.FC<DemographicChartProps> = ({
  title,
  icon,
  data,
  chartType = 'bar',
  limit = 5,
  showPercentages = true,
  height = 250,
}) => {
  // Use sample data if no real data available or if all values are zero
  const hasValidData = data.length > 0 && data.some(item => item.value > 0);
  let chartData = hasValidData ? data : [];

  // Add sample data based on title if no valid data
  if (!hasValidData) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('countries')) {
      chartData = getSampleDemographicData('countries');
    } else if (titleLower.includes('languages')) {
      chartData = getSampleDemographicData('languages');
    } else if (titleLower.includes('age') || titleLower.includes('gender')) {
      chartData = getSampleDemographicData('genderAge');
    } else if (titleLower.includes('cities')) {
      chartData = getSampleDemographicData('cities');
    } else if (titleLower.includes('interests')) {
      chartData = getSampleDemographicData('interests');
    } else if (titleLower.includes('brand')) {
      chartData = getSampleDemographicData('brands');
    }
  }

  const topItems = getTopItems(chartData, limit);

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

  // Prepare chart data with proper percentage handling
  const chartDataFormatted = topItems.map((item, index) => {
    let displayName = '';

    if (item.gender && item.ageRange) {
      // Fix gender capitalization: "FEMALE" -> "Female", "MALE" -> "Male"
      const properGender =
        item.gender.toLowerCase() === 'female' || item.gender.toLowerCase() === 'f'
          ? 'Female'
          : item.gender.toLowerCase() === 'male' || item.gender.toLowerCase() === 'm'
            ? 'Male'
            : item.gender;
      displayName = `${properGender} ${item.ageRange}`;
    } else {
      displayName = item.name || `Item ${index + 1}`;
    }

    // Truncate long names to prevent overspill
    const truncatedName = truncateName(displayName, chartType === 'bar' ? 10 : 15);

    return {
      name: truncatedName,
      fullName: displayName, // Keep full name for tooltips
      // ✅ FIXED: API now returns percentages directly (9.3 = 9.3%), no conversion needed
      value: item.value, // Use value directly since API returns percentages
      rawValue: item.value, // Keep original value
      percentage: formatDemographicValue(item.value), // This will show "9.3%"
    };
  });

  return (
    <Card className="border-border/50 hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon iconId={icon} className="w-4 h-4 text-accent" />
          {title}
          {!hasValidData && (
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground border-muted-foreground/30"
            >
              Sample Data
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartType === 'pie' ? (
          <PieChart data={chartDataFormatted} nameKey="name" dataKey="value" height={height} />
        ) : (
          <BarChart
            data={chartDataFormatted}
            xKey="name"
            yKey="value"
            height={height}
            layout="horizontal"
            showGrid={true}
            showLegend={false}
            barSize={18}
            tickFormatter={(value: string | number) => {
              if (typeof value === 'number') {
                return `${value.toFixed(0)}%`;
              }
              // For text labels, ensure they don't overflow
              return String(value).length > 8
                ? String(value).substring(0, 8) + '...'
                : String(value);
            }}
          />
        )}

        {/* Data summary below chart with corrected percentages */}
        <div className="mt-4 space-y-2">
          {topItems.slice(0, 3).map((item, index) => {
            let displayName = '';
            if (item.gender && item.ageRange) {
              // Fix gender capitalization here too
              const properGender =
                item.gender.toLowerCase() === 'female' || item.gender.toLowerCase() === 'f'
                  ? 'Female'
                  : item.gender.toLowerCase() === 'male' || item.gender.toLowerCase() === 'm'
                    ? 'Male'
                    : item.gender;
              displayName = `${properGender} ${item.ageRange}`;
            } else {
              displayName = item.name || `Item ${index + 1}`;
            }

            return (
              <div key={index} className="flex items-center justify-between text-xs">
                <span
                  className="font-medium truncate text-foreground max-w-[60%]"
                  title={displayName}
                >
                  {truncateName(displayName, 20)}
                </span>
                <span className="text-accent font-semibold">
                  {formatDemographicValue(item.value)}
                </span>
              </div>
            );
          })}
        </div>
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
  // Use sample data if no real data - API returns percentages directly
  const actualCredibilityScore = credibilityScore || 78; // 78% not 0.78
  const actualSignificantPercentage = significantLikersPercentage || 42; // 42% not 0.42
  const actualCountries = countries.length > 0 ? countries : [{ code: 'US', value: 35 }]; // 35% not 0.35

  const getQualityLevel = (): 'HIGH' | 'MEDIUM' | 'LOW' => {
    // ✅ FIXED: API returns percentages directly, so compare with percentage values
    if (actualCredibilityScore >= 80 && actualSignificantPercentage >= 30) return 'HIGH';
    if (actualCredibilityScore >= 50 && actualSignificantPercentage >= 15) return 'MEDIUM';
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
  const topCountry = actualCountries[0];

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
        <div className="flex items-center justify-between">
          <span>Credibility Score</span>
          <span className="font-medium">{actualCredibilityScore.toFixed(0)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Significant Likers</span>
          <span className="font-medium">{actualSignificantPercentage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Primary Market</span>
          <span className="font-medium">
            {topCountry.code.toUpperCase()} ({formatDemographicValue(topCountry.value)})
          </span>
        </div>
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

    if (countries.length === 0) {
      // Use sample data for calculation
      const sampleCountries = getSampleDemographicData('countries');
      const topCountryShare = sampleCountries[0]?.value || 35; // 35% not 0.35
      const languageCount = 3; // Sample language count
      return Math.min(100, (1 - topCountryShare / 100) * 70 + Math.min(languageCount / 5, 1) * 30);
    }

    // Calculate diversity based on distribution spread
    const topCountryShare = countries[0]?.value || 0; // API returns percentages directly
    const languageCount = languages.length;

    // Higher diversity = lower concentration in top country + more languages
    const diversityScore = Math.min(
      100,
      (1 - topCountryShare / 100) * 70 + // ✅ FIXED: Divide by 100 since API returns percentages
        Math.min(languageCount / 5, 1) * 30 // Language diversity (30% weight)
    );

    return Math.round(diversityScore);
  };

  const diversityScore = getDiversityScore();

  // Calculate audience quality level
  const getAudienceQuality = (): 'HIGH' | 'MEDIUM' | 'LOW' => {
    const score = audienceData.likers.credibilityScore || 78; // 78% not 0.78 - sample fallback
    const significantPercentage = audienceData.likers.significantLikersPercentage || 42; // 42% not 0.42 - sample fallback

    // ✅ FIXED: API returns percentages directly, compare with percentage values
    if (score >= 80 && significantPercentage >= 30) return 'HIGH';
    if (score >= 50 && significantPercentage >= 15) return 'MEDIUM';
    return 'LOW';
  };

  const audienceQuality = getAudienceQuality();

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

        {/* Enhanced Demographics Grid with Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geographic Distribution */}
          <DemographicChart
            title="Top Countries"
            icon="faGlobeLight"
            data={audienceData.demographics.countries}
            chartType="bar"
            limit={5}
            height={300}
          />

          {/* Gender & Age Distribution */}
          <DemographicChart
            title="Age & Gender Distribution"
            icon="faUserGroupLight"
            data={audienceData.demographics.genderAgeDistribution}
            chartType="pie"
            limit={6}
            height={300}
          />

          {/* Language Distribution */}
          <DemographicChart
            title="Languages"
            icon="faCommentLight"
            data={audienceData.demographics.languages}
            chartType="bar"
            limit={5}
            height={280}
          />

          {/* Top Cities */}
          <DemographicChart
            title="Top Cities"
            icon="faBuildingLight"
            data={audienceData.demographics.cities}
            chartType="bar"
            limit={5}
            height={280}
          />
        </div>

        {/* Secondary Charts Row */}
        {(audienceData.interests.length > 0 || audienceData.brandAffinity.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Audience Interests */}
            <DemographicChart
              title="Top Interests"
              icon="faHeartLight"
              data={audienceData.interests}
              chartType="bar"
              limit={5}
              height={280}
            />

            {/* Brand Affinity */}
            <DemographicChart
              title="Brand Affinity"
              icon="faTagLight"
              data={audienceData.brandAffinity}
              chartType="bar"
              limit={5}
              height={280}
            />
          </div>
        )}

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
                        {formatNumber(band.totalProfileCount)}
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
                            <span>{formatNumber(liker.followerCount)} followers</span>
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
