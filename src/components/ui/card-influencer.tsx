/**
 * @component InfluencerCard
 * @category organism
 * @description Displays information about a single social media influencer.
 * Uses Shadcn UI Card, Avatar, Icon.
 * @status 10th April
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from './icon/icon';
import { cn } from '@/lib/utils';
import { PlatformEnum } from '@/types/enums';
import { z as _z } from 'zod';

// Helper function to format large numbers (e.g., follower counts)
const formatNumber = (num: number | undefined | null): string => {
  if (num === null || num === undefined) return 'N/A';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Update mapping to use PlatformEnum
const platformIcons: Record<PlatformEnum, string> = {
  [PlatformEnum.Instagram]: 'brandsInstagram',
  [PlatformEnum.TikTok]: 'brandsTiktok',
  [PlatformEnum.YouTube]: 'brandsYoutube',
  [PlatformEnum.Twitter]: 'brandsXTwitter',
  [PlatformEnum.Facebook]: 'brandsFacebook',
  [PlatformEnum.Twitch]: 'brandsTwitch',
  [PlatformEnum.Pinterest]: 'brandsPinterest',
  [PlatformEnum.LinkedIn]: 'brandsLinkedin',
  // Add other PlatformEnum members if they exist
};

export interface InfluencerCardProps {
  /** Platform the influencer is on (use SSOT enum) */
  platform: PlatformEnum;
  /** Influencer's handle/username */
  handle: string;
  /** Optional display name */
  displayName?: string | null;
  /** Optional URL for the avatar image */
  avatarUrl?: string | null;
  /** Optional follower count */
  followerCount?: number | null;
  /** Optional engagement rate (e.g., 0.02 for 2%) */
  engagementRate?: number | null;
  /** Optional verified status */
  verified?: boolean | null;
  /** Optional URL to the influencer's profile */
  profileUrl?: string | null;
  /** Additional CSS classes */
  className?: string;
}

export function InfluencerCard({
  platform,
  handle,
  displayName,
  avatarUrl,
  followerCount,
  engagementRate,
  verified,
  profileUrl,
  className,
}: InfluencerCardProps) {
  const nameToDisplay = displayName || handle;
  const platformIconId = platformIcons[platform] || 'faUserLight';

  const cardContent = (
    <div className="flex items-center space-x-4">
      <Avatar className="h-12 w-12 border">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={`${nameToDisplay} avatar`} /> : null}
        <AvatarFallback className="text-lg bg-muted">
          {!avatarUrl ? (
            <Icon iconId="faUserLight" className="h-6 w-6 text-muted-foreground" />
          ) : (
            (nameToDisplay?.substring(0, 2).toUpperCase() ?? '??')
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-0.5">
          {/* Platform Icon */}
          <Icon iconId={platformIconId} className="h-4 w-4 mr-1.5 text-muted-foreground" />
          {/* Display Name / Handle */}
          <p className="text-sm font-semibold text-primary truncate flex items-center">
            {nameToDisplay}
            {verified && (
              <Icon
                iconId="faCheckCircleSolid"
                className="ml-1.5 h-3.5 w-3.5 text-blue-500 flex-shrink-0"
                title="Verified"
              />
            )}
          </p>
        </div>
        <div className="text-xs text-muted-foreground space-x-2">
          {followerCount !== null && followerCount !== undefined && (
            <span>{formatNumber(followerCount)} followers</span>
          )}
          {engagementRate !== null && engagementRate !== undefined && (
            <span>• {(engagementRate * 100).toFixed(1)}% engagement</span>
          )}
        </div>
      </div>
    </div>
  );

  // Render as a link if profileUrl is provided, otherwise just a div
  return (
    <Card
      className={cn(
        'overflow-hidden',
        profileUrl ? 'hover:shadow-md transition-shadow cursor-pointer' : '',
        className
      )}
      onClick={() => profileUrl && window.open(profileUrl, '_blank')} // Simple onClick for demo
    >
      <CardContent className="p-3">
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
          >
            {cardContent}
          </a>
        ) : (
          cardContent
        )}
      </CardContent>
    </Card>
  );
}
