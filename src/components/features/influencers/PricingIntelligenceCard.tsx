'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon';
import { Separator } from '@/components/ui/separator';
import { extractInsightIQData } from '@/lib/data-extraction/insightiq-extractor-profile-analytics';
import { InfluencerProfileData } from '@/types/influencer';

interface PricingIntelligenceCardProps {
  influencer: InfluencerProfileData;
}

export const PricingIntelligenceCard: React.FC<PricingIntelligenceCardProps> = ({ influencer }) => {
  const extractedData = extractInsightIQData(influencer);
  const pricingData = extractedData.pricing;

  // Only render if we have pricing data
  if (!pricingData.hasPricingData) {
    return null;
  }

  const formatCurrency = (amount: number): string => {
    const currency = pricingData.currency || 'USD';
    if (amount >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(1)}K`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getPriceRangeColor = (range: string): string => {
    switch (range) {
      case 'BUDGET':
        return 'text-success';
      case 'MID_RANGE':
        return 'text-primary';
      case 'PREMIUM':
        return 'text-warning';
      case 'LUXURY':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriceRangeIcon = (range: string): string => {
    switch (range) {
      case 'BUDGET':
        return 'faDollarSignLight';
      case 'MID_RANGE':
        return 'faCoinsLight';
      case 'PREMIUM':
        return 'faGemLight';
      case 'LUXURY':
        return 'faCrownLight';
      default:
        return 'faMoneyBillLight';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon iconId="faMoneyBillLight" className="h-6 w-6 text-accent" />
            <CardTitle className="text-xl font-bold">Pricing Intelligence</CardTitle>
          </div>
          {pricingData.marketComparison.priceRange && (
            <Badge
              variant="secondary"
              className={`${getPriceRangeColor(pricingData.marketComparison.priceRange)} bg-accent/10`}
            >
              <Icon
                iconId={getPriceRangeIcon(pricingData.marketComparison.priceRange)}
                className="h-3 w-3 mr-1"
              />
              {pricingData.marketComparison.priceRange.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Market Position */}
        {pricingData.marketComparison.percentile && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">Market Position</span>
              <Badge variant="outline" className="text-accent">
                {pricingData.marketComparison.percentile}th Percentile
              </Badge>
            </div>
            {pricingData.marketComparison.industryAverage && (
              <div className="text-xs text-muted-foreground">
                Industry Average: {formatCurrency(pricingData.marketComparison.industryAverage)}
              </div>
            )}
          </div>
        )}

        {/* Post Type Pricing */}
        <div className="space-y-3">
          <h4 className="font-semibold text-primary flex items-center gap-2">
            <Icon iconId="faTagLight" className="h-4 w-4" />
            Content Pricing
          </h4>
          <div className="grid gap-3">
            {Object.entries(pricingData.postTypes).map(([postType, pricing]) => (
              <div key={postType} className="p-3 rounded bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm capitalize">
                    {postType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {pricing.lastUpdated && (
                    <span className="text-xs text-muted-foreground">
                      Updated {new Date(pricing.lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {pricing.min && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min:</span>
                      <span className="font-medium">{formatCurrency(pricing.min)}</span>
                    </div>
                  )}
                  {pricing.max && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max:</span>
                      <span className="font-medium">{formatCurrency(pricing.max)}</span>
                    </div>
                  )}
                  {pricing.average && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg:</span>
                      <span className="font-medium">{formatCurrency(pricing.average)}</span>
                    </div>
                  )}
                  {pricing.median && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Median:</span>
                      <span className="font-medium">{formatCurrency(pricing.median)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Explanations */}
        {Object.keys(pricingData.explanations).length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h4 className="font-semibold text-primary flex items-center gap-2">
              <Icon iconId="faLightbulbLight" className="h-4 w-4" />
              Pricing Insights
            </h4>
            <div className="space-y-2">
              {Object.entries(pricingData.explanations).map(([key, explanation]) => (
                <div key={key} className="p-3 rounded bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {explanation.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{explanation.description}</p>
                  {explanation.factors && explanation.factors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {explanation.factors.map((factor, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Trends */}
        {pricingData.pricingTrends.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h4 className="font-semibold text-primary flex items-center gap-2">
              <Icon iconId="faChartLineLight" className="h-4 w-4" />
              Pricing Trends
            </h4>
            <div className="grid gap-2">
              {pricingData.pricingTrends.slice(0, 6).map((trend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{trend.period}</span>
                    <Icon
                      iconId={
                        trend.trend === 'INCREASING'
                          ? 'faArrowUpLight'
                          : trend.trend === 'DECREASING'
                            ? 'faArrowDownLight'
                            : 'faArrowRightLight'
                      }
                      className={`h-3 w-3 ${
                        trend.trend === 'INCREASING'
                          ? 'text-success'
                          : trend.trend === 'DECREASING'
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(trend.averageRate)}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {trend.trend.toLowerCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Quality Indicator */}
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 mb-1">
            <Icon iconId="faShieldCheckLight" className="h-4 w-4 text-success" />
            <span className="text-sm font-semibold text-success">Verified Pricing Data</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pricing intelligence based on verified collaborations and market analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
