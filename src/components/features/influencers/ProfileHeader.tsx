'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component path
import { Button } from '@/components/ui/button'; // Import Button for Copy action
import { toast } from 'sonner'; // Assuming sonner for toast notifications
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { getInitials } from '@/lib/utils'; // Ensure correct import path
import { cn } from '@/lib/utils';

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

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  influencer,
  // isSelected, // Selection state likely managed by parent profile page
  // onSelectToggle,
}) => {
  const {
    id,
    avatarUrl,
    name,
    handle,
    bio,
    platforms,
    isVerified, // Corrected property name
    justifyScore,
    audienceQualityIndicator,
    contactEmail, // Destructure contactEmail
    website,
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

  // Determine badge styling based on quality
  let qualityBadgeStyles = '';
  if (audienceQualityIndicator === 'High') {
    qualityBadgeStyles =
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent'; // Success-like style
  } else if (audienceQualityIndicator === 'Medium') {
    qualityBadgeStyles =
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-transparent'; // Warning-like style
  } else if (audienceQualityIndicator === 'Low') {
    qualityBadgeStyles = badgeVariants({ variant: 'destructive' }); // Destructive style
  } else {
    qualityBadgeStyles = badgeVariants({ variant: 'secondary' }); // Fallback style
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-6 flex flex-col sm:flex-row items-start gap-6">
        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0">
          <AvatarImage src={avatarUrl ?? undefined} alt={name ?? ''} />
          <AvatarFallback>{getInitials(name ?? '')}</AvatarFallback>
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
          {isVerified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 text-xs border-transparent"
                  >
                    <Icon iconId="faCheckCircleSolid" className="h-3 w-3 mr-1" size="xs" />
                    Verified
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Account connection verified via InsightIQ.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
      </CardContent>
    </Card>
  );
};
