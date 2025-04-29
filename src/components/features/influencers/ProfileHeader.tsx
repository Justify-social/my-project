'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component path
import { Button } from '@/components/ui/button'; // Import Button for Copy action
import { toast } from 'sonner'; // Assuming sonner for toast notifications
// TODO: Import Tooltip for Justify Score explanation
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProfileHeaderProps {
  influencer: InfluencerProfileData;
  // TODO: Add selection state/handlers later if needed directly in header (Ticket 2.3 might handle this in parent)
  // isSelected: boolean;
  // onSelectToggle: (id: string) => void;
}

// Helper function to get platform icon names (adjust based on actual icon names)
const getPlatformIcon = (platform: PlatformEnum): string => {
  switch (platform) {
    case PlatformEnum.Instagram:
      return 'faInstagram'; // Replace with actual icon ID
    case PlatformEnum.YouTube:
      return 'faYoutube'; // Replace with actual icon ID
    case PlatformEnum.TikTok:
      return 'faTiktok'; // Replace with actual icon ID
    default:
      return 'faQuestionCircle'; // Default icon
  }
};

export function ProfileHeader({ influencer }: ProfileHeaderProps) {
  const {
    avatarUrl,
    name,
    handle,
    bio,
    platforms,
    isPhylloVerified,
    justifyScore,
    audienceQualityIndicator,
    contactEmail, // Destructure contactEmail
  } = influencer;

  // Direct implementation for copying email
  const handleCopyEmail = async () => {
    if (contactEmail && navigator.clipboard) {
      // Check for clipboard support
      try {
        await navigator.clipboard.writeText(contactEmail);
        toast.success('Email copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy email.');
        console.error('Copy email error:', err);
      }
    } else if (contactEmail) {
      // Fallback for older browsers or insecure contexts (optional)
      toast.error('Clipboard access not available.');
    }
  };

  // Get initials for Avatar Fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-4 md:p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
      {/* Avatar */}
      <Avatar className="h-20 w-20 md:h-24 md:w-24 border">
        <AvatarImage src={avatarUrl} alt={`${name}'s avatar`} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>

      {/* Main Info Section */}
      <div className="flex-1 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        <p className="text-sm text-muted-foreground">@{handle}</p>
        {bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{bio}</p>}

        {/* Contact Email - Updated Section */}
        {contactEmail && (
          <div className="flex items-center gap-2 pt-1">
            <Icon iconId="faEnvelopeLight" className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate">{contactEmail}</span>
            <Button variant="ghost" size="icon" onClick={handleCopyEmail} aria-label="Copy email">
              <Icon iconId="faCopyLight" className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Platform Icons */}
        <div className="flex items-center gap-2 pt-1">
          {platforms?.map(platform => (
            <Icon
              key={platform}
              iconId={getPlatformIcon(platform)}
              className="h-5 w-5 text-muted-foreground"
              aria-label={platform}
            />
          ))}
        </div>
      </div>

      {/* Right Section: Score, Verification, Quality */}
      <div className="w-full md:w-auto space-y-3 md:text-right pt-2 md:pt-0">
        {/* Justify Score */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground">Justify Score</span>
          {/* TODO: Add Tooltip explaining the score */}
          <span className="text-2xl font-bold">
            {justifyScore !== null ? justifyScore.toFixed(1) : 'N/A'}
          </span>
        </div>
        {/* Verification Badge */}
        {isPhylloVerified && (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
          >
            <Icon iconId="faCheckCircleSolid" className="mr-1.5 h-3.5 w-3.5" />{' '}
            {/* Adjust icon as needed */}
            Phyllo Verified
          </Badge>
        )}
        {/* Audience Quality Badge */}
        {audienceQualityIndicator && (
          <Badge variant="outline">
            {/* TODO: Add Icon for quality? */}
            {`Audience: ${audienceQualityIndicator}`}
          </Badge>
        )}
        {/* TODO: Add Select/Deselect button if needed here (Ticket 2.3) */}
      </div>
    </div>
  );
}
