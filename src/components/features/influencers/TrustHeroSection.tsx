'use client';

import React, { useState } from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { extractInsightIQData } from '@/lib/data-extraction/insightiq-extractor';

interface TrustHeroSectionProps {
  influencer: InfluencerProfileData;
}

// Risk level styling helper
const getRiskLevelStyles = (riskLevel: 'LOW' | 'MEDIUM' | 'HIGH') => {
  switch (riskLevel) {
    case 'LOW':
      return {
        badge: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
        icon: 'text-success',
        gradient: 'from-success/5 to-success/10',
      };
    case 'MEDIUM':
      return {
        badge: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
        icon: 'text-warning',
        gradient: 'from-warning/5 to-warning/10',
      };
    case 'HIGH':
      return {
        badge: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
        icon: 'text-destructive',
        gradient: 'from-destructive/5 to-destructive/10',
      };
  }
};

export const TrustHeroSection: React.FC<TrustHeroSectionProps> = ({ influencer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 🎯 SSOT: Use centralized data extraction from InsightIQ Profile Analytics API
  const extractedData = extractInsightIQData(influencer);
  const trustData = extractedData.trust;
  const styles = getRiskLevelStyles(trustData.riskLevel);

  // Only render if we have real InsightIQ API trust data
  if (!trustData.hasDetailedData || !trustData.credibilityScore) {
    return (
      <Card className="border-accent/20">
        <CardContent className="p-6 text-center">
          <Icon iconId="faShieldLight" className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Trust data not available from InsightIQ API
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This influencer may not have sufficient audience data for trust analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-accent/20 shadow-lg bg-gradient-to-r from-background to-accent/5 transition-all duration-300 hover:shadow-xl hover:border-accent/30">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:w-auto">
            {/* Trust Shield with hover animation */}
            <div className="p-4 sm:p-6 rounded-xl border bg-gradient-to-br from-success/5 to-success/10 hover:from-success/10 hover:to-success/15 transition-all duration-300 hover:scale-105 cursor-default">
              <div className="flex items-center justify-center mb-4">
                <Icon
                  iconId="faShieldLight"
                  className="w-8 h-8 sm:w-10 sm:h-10 text-success animate-in fade-in duration-500"
                />
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl sm:text-4xl font-bold text-success animate-in slide-in-from-bottom-3 duration-700">
                  {extractedData.trust.credibilityScore}%
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground animate-in fade-in duration-500 delay-200">
                  Audience Authenticity
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="animate-in slide-in-from-bottom-1 duration-500 delay-300">
                  <div className="text-sm sm:text-base font-semibold text-success">
                    {extractedData.trust.realFollowersPercentage}%
                  </div>
                  <p className="text-xs text-muted-foreground">Real</p>
                </div>
                <div className="animate-in slide-in-from-bottom-1 duration-500 delay-400">
                  <div className="text-sm sm:text-base font-semibold text-warning">
                    {extractedData.trust.suspiciousFollowersPercentage}%
                  </div>
                  <p className="text-xs text-muted-foreground">Suspicious</p>
                </div>
                <div className="animate-in slide-in-from-bottom-1 duration-500 delay-500">
                  <div className="text-sm sm:text-base font-semibold text-primary">
                    {extractedData.trust.significantFollowersPercentage}%
                  </div>
                  <p className="text-xs text-muted-foreground">Quality</p>
                </div>
              </div>
            </div>

            {/* Main Trust Score with staggered animation */}
            <div className="space-y-2 text-center lg:text-left animate-in slide-in-from-right-5 duration-700 delay-200">
              <div className="flex flex-col lg:flex-row items-center lg:items-baseline gap-2 lg:gap-3">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary animate-in zoom-in duration-500 delay-300">
                  {extractedData.trust.credibilityScore}
                </div>
                <div className="text-lg sm:text-xl text-muted-foreground animate-in fade-in duration-500 delay-400">
                  Trust Score
                </div>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xs animate-in fade-in duration-500 delay-500">
                {extractedData.trust.riskLevel === 'LOW' &&
                  '✅ High confidence in audience authenticity'}
                {extractedData.trust.riskLevel === 'MEDIUM' &&
                  '⚠️ Moderate risk - requires attention'}
                {extractedData.trust.riskLevel === 'HIGH' && '❌ High risk - proceed with caution'}
              </p>
            </div>
          </div>
          <Badge
            variant={
              extractedData.trust.riskLevel === 'LOW'
                ? 'default'
                : extractedData.trust.riskLevel === 'MEDIUM'
                  ? 'secondary'
                  : 'destructive'
            }
            className={cn(
              'text-base sm:text-lg px-4 py-2 font-semibold transition-all duration-300 hover:scale-105 animate-in slide-in-from-top-2 duration-500 delay-600',
              extractedData.trust.riskLevel === 'LOW' &&
                'bg-success hover:bg-success/90 text-white',
              extractedData.trust.riskLevel === 'MEDIUM' &&
                'bg-warning hover:bg-warning/90 text-white',
              extractedData.trust.riskLevel === 'HIGH' &&
                'bg-destructive hover:bg-destructive/90 text-white'
            )}
          >
            {extractedData.trust.riskLevel} RISK
          </Badge>
        </div>

        <Separator className="my-6 animate-in fade-in duration-500 delay-700" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-3 duration-500 delay-800">
          <div className="flex items-center gap-3">
            <Icon iconId="faCloudLight" className="h-4 w-4 text-accent flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Trust analysis powered by{' '}
              <span className="font-medium text-accent">Justify Intelligence Platform</span> with{' '}
              <span className="font-medium text-accent">
                {trustData.credibilityScore}% confidence
              </span>{' '}
              for brand partnerships
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="transition-all duration-300 hover:shadow-md hover:scale-105 hover:bg-accent/10 hover:border-accent/30 whitespace-nowrap"
          >
            <Icon
              iconId={isExpanded ? 'faChevronUpLight' : 'faChevronDownLight'}
              className="mr-2 h-4 w-4 transition-transform duration-300"
            />
            {isExpanded ? 'Hide Details' : 'View Details'}
          </Button>
        </div>

        {/* Expandable Trust Details */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-border/50 space-y-6 animate-in slide-in-from-top-3 duration-500">
            <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Icon iconId="faChartBarLight" className="w-5 h-5 text-accent" />
              Detailed Trust Analysis
            </h4>

            {/* Follower Type Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trustData.followerTypes.map((type, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{type.name}</span>
                    <Icon
                      iconId={
                        type.category === 'positive'
                          ? 'faCircleCheckLight'
                          : type.category === 'negative'
                            ? 'faTriangleExclamationLight'
                            : 'faCircleLight'
                      }
                      className={cn(
                        'w-4 h-4',
                        type.category === 'positive'
                          ? 'text-success'
                          : type.category === 'negative'
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {(type.value * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {type.category === 'positive'
                      ? 'Authentic followers'
                      : type.category === 'negative'
                        ? 'Requires attention'
                        : 'Quality unknown'}
                  </div>
                </div>
              ))}
            </div>

            {/* Suspicious Activity Indicators */}
            {trustData.suspiciousActivityIndicators.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-secondary">Risk Indicators</h5>
                <div className="space-y-2">
                  {trustData.suspiciousActivityIndicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded bg-warning/10 border border-warning/20"
                    >
                      <Icon
                        iconId="faTriangleExclamationLight"
                        className="w-4 h-4 text-warning flex-shrink-0"
                      />
                      <span className="text-sm text-foreground">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Verification Details */}
            {trustData.platformVerificationDetails.isVerified && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-3 mb-2">
                  <Icon iconId="faCircleCheckSolid" className="w-5 h-5 text-success" />
                  <span className="font-medium text-primary">Platform Verified</span>
                </div>
                {trustData.platformVerificationDetails.verificationDate && (
                  <p className="text-sm text-muted-foreground">
                    Verified on:{' '}
                    {new Date(
                      trustData.platformVerificationDetails.verificationDate
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Trust Assessment Summary */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <Icon iconId="faClipboardLight" className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">Trust Assessment Summary</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {trustData.riskLevel} Risk
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Audience Quality Score</span>
                  <span className="font-medium">
                    {trustData.audienceQualityScore
                      ? `${trustData.audienceQualityScore}%`
                      : 'No API data'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Real Followers</span>
                  <span className="font-medium text-success">
                    {trustData.realFollowersPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suspicious Activity</span>
                  <span className="font-medium text-warning">
                    {trustData.suspiciousFollowersPercentage}%
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
