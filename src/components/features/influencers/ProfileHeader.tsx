'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon';
import { Button as _Button } from '@/components/ui/button';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { getInitials as _getInitials } from '@/lib/utils';
import { cn as _cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ProfileHeaderProps {
  influencer: InfluencerProfileData;
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
      return 'faCircleQuestionLight';
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

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ influencer }) => {
  const {
    avatarUrl,
    name,
    handle,
    bio,
    platforms,
    isVerified,
    justifyScore,
    audienceQualityIndicator,
    contactEmail,
    website,
    followersCount,
    engagementRate,
    category,
  } = influencer;

  // Extract additional contact info from InsightIQ data if available
  const extendedInfluencer = influencer as InfluencerProfileData & {
    insightiq?: {
      contacts?: {
        email?: string;
        phone?: string;
        website?: string;
      };
    };
  };
  const insightiqContacts = extendedInfluencer.insightiq?.contacts;

  const handleCopyEmail = async () => {
    const emailToCopy = contactEmail || insightiqContacts?.email;
    if (emailToCopy && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(emailToCopy);
        toast.success('Email copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy email.');
        console.error('Copy email error:', err);
      }
    } else if (emailToCopy) {
      toast.error('Clipboard access not available.');
    }
  };

  const handleCopyHandle = async () => {
    if (handle && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`@${handle}`);
        toast.success('Handle copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy handle.');
        console.error('Copy handle error:', err);
      }
    }
  };

  const getInitials = (name: string) => {
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

  return (
    <Card className="mb-8 overflow-hidden border-border/50 shadow-lg bg-gradient-to-br from-background via-background to-muted/10">
      <CardContent className="p-8">
        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN - Influencer Information (Widest - 7 columns) */}
          <div className="lg:col-span-7">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-accent/20 shadow-lg">
                  <AvatarImage src={avatarUrl ?? undefined} alt={name ?? ''} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/10 to-accent/10">
                    {getInitials(name ?? '')}
                  </AvatarFallback>
                </Avatar>
                {/* Verification Badge on Avatar */}
                {isVerified && (
                  <div className="absolute -bottom-2 -right-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="bg-sky-500 p-2 rounded-full border-4 border-background shadow-lg">
                            <Icon iconId="faCircleCheckSolid" className="h-4 w-4 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verified Account</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1 space-y-4">
                {/* Name and Handle */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">{name}</h1>
                    {category && (
                      <Badge variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-muted-foreground">@{handle}</p>
                    <IconButtonAction
                      iconBaseName="faCopy"
                      hoverColorClass="text-accent"
                      onClick={handleCopyHandle}
                      ariaLabel="Copy handle"
                    />
                  </div>
                </div>

                {/* Bio */}
                {bio && (
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <p className="text-sm leading-relaxed text-foreground">{bio}</p>
                  </div>
                )}

                {/* Key Metrics Row */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatNumber(followersCount)}
                    </div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {engagementRate ? `${(engagementRate * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Engagement</div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{platforms?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Platforms</div>
                  </div>
                </div>

                {/* Platform Icons */}
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-sm font-medium text-muted-foreground">Active on:</span>
                  <div className="flex items-center gap-3">
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

          {/* MIDDLE COLUMN - Contact Information (3 columns) */}
          <div className="lg:col-span-3">
            <div className="bg-accent/5 p-6 rounded-lg border border-accent/20 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Icon iconId="faEnvelopeLight" className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-primary">Contact Information</h3>
              </div>

              <div className="space-y-4">
                {/* Email */}
                {(contactEmail || insightiqContacts?.email) && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon
                        iconId="faEnvelopeLight"
                        className="h-4 w-4 text-muted-foreground flex-shrink-0"
                      />
                      <span className="text-sm font-medium truncate flex-1">
                        {contactEmail || insightiqContacts?.email}
                      </span>
                      <IconButtonAction
                        iconBaseName="faCopy"
                        hoverColorClass="text-accent"
                        onClick={handleCopyEmail}
                        ariaLabel="Copy email"
                      />
                    </div>
                  </div>
                )}

                {/* Phone */}
                {insightiqContacts?.phone && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Phone
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon
                        iconId="faPhoneLight"
                        className="h-4 w-4 text-muted-foreground flex-shrink-0"
                      />
                      <span className="text-sm font-medium">{insightiqContacts.phone}</span>
                    </div>
                  </div>
                )}

                {/* Website */}
                {(website || insightiqContacts?.website) && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Website
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon
                        iconId="faGlobeLight"
                        className="h-4 w-4 text-muted-foreground flex-shrink-0"
                      />
                      <a
                        href={website || insightiqContacts?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-interactive hover:underline truncate"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                {/* Audience Quality */}
                {audienceQualityIndicator && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Audience Quality
                    </div>
                    <Badge
                      variant={
                        audienceQualityIndicator === 'High'
                          ? 'default'
                          : audienceQualityIndicator === 'Medium'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="text-xs"
                    >
                      {audienceQualityIndicator}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Justify Score & Verification (2 columns) */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
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
                        {typeof justifyScore === 'number' ? justifyScore.toFixed(1) : 'N/A'}
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
                      <p className="text-sm">Account connection verified via InsightIQ platform</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
