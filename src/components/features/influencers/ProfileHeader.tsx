'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { extractInsightIQData } from '@/lib/data-extraction/insightiq-extractor';

interface ProfileHeaderProps {
  influencer: InfluencerProfileData;
  isLoading?: boolean;
}

// Helper function to get platform icon names
const getPlatformIcon = (platform: PlatformEnum): string => {
  switch (platform) {
    case PlatformEnum.Instagram:
      return 'brandsInstagram';
    case PlatformEnum.YouTube:
      return 'brandsYoutube';
    case PlatformEnum.TikTok:
      return 'brandsTiktok';
    case PlatformEnum.LinkedIn:
      return 'brandsLinkedin';
    case PlatformEnum.Facebook:
      return 'brandsFacebook';
    case PlatformEnum.Twitter:
      return 'brandsXTwitter';
    default:
      return 'faUsersLight';
  }
};

// Helper function to get platform display name
const getPlatformDisplayName = (platform: PlatformEnum): string => {
  switch (platform) {
    case PlatformEnum.Instagram:
      return 'Instagram';
    case PlatformEnum.YouTube:
      return 'YouTube';
    case PlatformEnum.TikTok:
      return 'TikTok';
    case PlatformEnum.LinkedIn:
      return 'LinkedIn';
    case PlatformEnum.Facebook:
      return 'Facebook';
    case PlatformEnum.Twitter:
      return 'X (Twitter)';
    default:
      return platform;
  }
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ influencer, isLoading = false }) => {
  const {
    avatarUrl,
    name,
    handle,
    bio,
    platforms,
    isVerified,
    justifyScore,
    followersCount,
    engagementRate,
    category,
  } = influencer || {};

  // Extract ALL available data from Justify Intelligence
  const extractedData = influencer ? extractInsightIQData(influencer) : null;
  const professionalData = extractedData?.professional;
  const trustData = extractedData?.trust;
  const performanceData = extractedData?.performance;

  // Use ONLY real API data - extract all possible values
  const realFollowersCount = followersCount || performanceData?.reputation?.followerCount || null;

  const realEngagementRate =
    engagementRate ||
    performanceData?.engagement?.rate ||
    (performanceData?.engagement?.averageLikes && realFollowersCount
      ? performanceData.engagement.averageLikes / realFollowersCount
      : null);

  const realJustifyScore =
    typeof justifyScore === 'number'
      ? justifyScore
      : trustData?.credibilityScore
        ? trustData.credibilityScore / 10 // Convert 0-100 to 0-10 scale
        : null;

  const handleCopyHandle = async () => {
    if (handle && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`@${handle}`);
        showSuccessToast('Handle copied to clipboard!');
      } catch (err) {
        showErrorToast('Failed to copy handle.');
        console.error('Copy handle error:', err);
      }
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRiskIcon = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'faCircleCheckLight';
      case 'medium':
        return 'faTriangleExclamationLight';
      case 'high':
        return 'faCircleXmarkLight';
      default:
        return 'faShieldLight';
    }
  };

  // Show loading skeleton if needed
  if (isLoading && !name) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden border-border/50 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
              <div className="flex flex-col sm:flex-row items-start gap-6 flex-1">
                <div className="h-32 w-32 bg-muted rounded-full"></div>
                <div className="space-y-4 flex-1">
                  <div className="h-8 bg-muted rounded w-64"></div>
                  <div className="h-6 bg-muted rounded w-32"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </div>
              <div className="lg:w-80 space-y-4">
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clean Profile Header - Apple/Shopify Standard */}
      <Card className="overflow-hidden border-border/50 shadow-lg bg-gradient-to-br from-background via-background to-muted/10">
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT SECTION - Main Profile Information */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                  <Avatar className="h-32 w-32 border-4 border-accent/20 shadow-lg">
                    <AvatarImage src={avatarUrl ?? undefined} alt={name ?? ''} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/10 to-accent/10">
                      {getInitials(name ?? '')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Information */}
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  {/* Name and Handle */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <h1 className="text-3xl font-bold tracking-tight text-primary">{name}</h1>
                      {category && (
                        <Badge variant="outline" className="mx-auto sm:mx-0 w-fit">
                          {category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <p className="text-lg text-muted-foreground">@{handle}</p>
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={handleCopyHandle}
                        ariaLabel="Copy handle"
                        className="h-4 w-4"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  {bio && (
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                      <p className="text-sm leading-relaxed text-foreground text-center sm:text-left">
                        {bio}
                      </p>
                    </div>
                  )}

                  {/* Key Metrics */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatNumber(realFollowersCount)}
                      </div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {realEngagementRate ? `${(realEngagementRate * 100).toFixed(1)}%` : '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {platforms?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Platforms</div>
                    </div>
                    {trustData && (
                      <>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="text-center">
                          <div
                            className={`text-2xl font-bold ${
                              trustData.riskLevel === 'LOW'
                                ? 'text-success'
                                : trustData.riskLevel === 'MEDIUM'
                                  ? 'text-warning'
                                  : 'text-destructive'
                            }`}
                          >
                            {trustData.credibilityScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">Trust Score</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Platform Icons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <span className="text-sm font-medium text-muted-foreground">Active on:</span>
                    <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                      {platforms?.map(platform => (
                        <TooltipProvider key={platform}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <Icon
                                  iconId={getPlatformIcon(platform)}
                                  className="h-6 w-6 text-foreground"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getPlatformDisplayName(platform)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION - Quick Actions & Scores */}
            <div className="lg:w-80 space-y-6">
              {/* Justify Score */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20 text-center cursor-help">
                      <div className="mb-2">
                        <Icon iconId="appJustify" className="h-8 w-8 text-primary mx-auto" />
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                        Justify Score
                      </div>
                      <div className="text-4xl font-bold text-primary mb-1">
                        {realJustifyScore !== null
                          ? realJustifyScore.toFixed(1)
                          : trustData?.credibilityScore
                            ? (trustData.credibilityScore / 10).toFixed(1)
                            : '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">Quality Rating</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="text-left">
                      <p className="text-sm font-medium mb-2">Justify Score (V2)</p>
                      <p className="text-xs leading-relaxed">
                        Comprehensive quality metric based on audience credibility, account
                        verification, engagement authenticity, and performance consistency.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Verification Status */}
              {isVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg text-center">
                        <Icon
                          iconId="faCircleCheckSolid"
                          className="h-6 w-6 text-sky-600 mx-auto mb-2"
                        />
                        <div className="text-xs font-semibold text-sky-800 mb-1">
                          Justify Verified
                        </div>
                        <div className="text-xs text-sky-600">Authentic Influencer</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Account verified by Justify.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
