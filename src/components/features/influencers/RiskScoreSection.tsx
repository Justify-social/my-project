'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component path

interface RiskScoreSectionProps {
  influencer: InfluencerProfileData;
  // Note: Specific risk score fields (e.g., score, change) are not currently
  // defined in InfluencerProfileData. This component needs data passed via props
  // or the data model updated.
}

export function RiskScoreSection({ influencer: _influencer }: RiskScoreSectionProps) {
  // TODO: Replace with actual data from props or updated influencer object
  const riskScore: number | undefined = undefined; // influencer.riskScore ?? undefined;
  const riskChange: number | undefined = undefined; // influencer.riskChange ?? undefined;
  const riskBasedOn = 'last campaigns'; // Example text - could come from data

  // Handle missing data gracefully
  if (riskScore === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Risk score data not available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const riskChangeText =
    riskChange !== undefined && riskChange !== 0
      ? `${Math.abs(riskChange)}% from ${riskBasedOn}`
      : riskChange === 0
        ? `No change from ${riskBasedOn}`
        : ''; // Don't show text if change is undefined

  const riskChangeColor =
    riskChange !== undefined && riskChange < 0
      ? 'text-green-600'
      : riskChange !== undefined && riskChange > 0
        ? 'text-red-600'
        : 'text-muted-foreground';

  const riskChangeIcon =
    riskChange !== undefined && riskChange < 0
      ? 'faArrowDownLight'
      : riskChange !== undefined && riskChange > 0
        ? 'faArrowUpLight'
        : '';

  // TODO: Add logic to determine overall risk level (Low, Medium, High) based on score
  // const riskLevel = calculateRiskLevel(riskScore); // Placeholder

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Score</CardTitle>
        {/* Optional: Could add a subtitle or link to risk details */}
        {/* <CardDescription>Based on recent activity and content analysis.</CardDescription> */}
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-4xl font-bold">{riskScore}%</p>
        {riskChangeText && (
          <div
            className={`flex items-center justify-center text-sm font-medium ${riskChangeColor}`}
          >
            {riskChangeIcon && <Icon iconId={riskChangeIcon} className="h-4 w-4 mr-1" />}
            {riskChangeText}
          </div>
        )}
        {/* Optional: Display qualitative level */}
        {/* <p className="text-xs text-muted-foreground mt-2">Overall Risk Level: {riskLevel}</p> */}
      </CardContent>
    </Card>
  );
}
