'use client';

import React from 'react';
import { InfluencerProfileData } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component path
import { Button as _Button } from '@/components/ui/button'; // Import Button for Copy action - Prefixed
import { IconButtonAction } from '@/components/ui/button-icon-action'; // Correct import name
import { toast } from 'sonner'; // Assuming sonner for toast notifications
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { getInitials as _getInitials } from '@/lib/utils'; // Import from utils - Prefixed
import { cn as _cn } from '@/lib/utils'; // Prefixed

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
      return 'brandsInstagram'; // Corrected ID
    case PlatformEnum.YouTube:
      return 'brandsYoutube'; // Corrected ID
    case PlatformEnum.TikTok:
      return 'brandsTiktok'; // Corrected ID
    // TODO: Add other platform mappings
    default:
      return 'faCircleQuestionLight'; // Corrected fallback icon ID
  }
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  influencer,
  // isSelected, // Selection state likely managed by parent profile page
  // onSelectToggle,
}) => {
  const {
    id: _id, // Prefixed
    avatarUrl,
    name,
    handle,
    bio,
    platforms,
    isVerified, // Corrected property name
    justifyScore,
    audienceQualityIndicator,
    contactEmail, // Destructure contactEmail
    website: _website, // Prefixed
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
  let _qualityBadgeStyles = ''; // Prefixed
  if (audienceQualityIndicator === 'High') {
    _qualityBadgeStyles =
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent'; // Success-like style
  } else if (audienceQualityIndicator === 'Medium') {
    _qualityBadgeStyles =
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-transparent'; // Warning-like style
  } else if (audienceQualityIndicator === 'Low') {
    _qualityBadgeStyles = badgeVariants({ variant: 'destructive' }); // Destructive style
  } else {
    _qualityBadgeStyles = badgeVariants({ variant: 'secondary' }); // Fallback style
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

          {/* Contact Email - Use IconButtonAction */}
          {contactEmail && (
            <div className="flex items-center gap-2 pt-1">
              <Icon iconId="faEnvelopeLight" className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">{contactEmail}</span>
              <IconButtonAction
                iconBaseName="faCopy"
                hoverColorClass="text-accent"
                onClick={handleCopyEmail}
                ariaLabel="Copy email"
              />
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
        <div className="w-full md:w-auto space-y-3 md:text-right pt-2 md:pt-0 flex flex-col items-end">
          {/* Justify Score - Enhanced Display inside its own container */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center bg-muted p-3 rounded-lg min-w-[100px] cursor-help">
                  <span className="text-xs text-muted-foreground mb-1">Justify Score</span>
                  <div className="flex items-center justify-center gap-2">
                    <Icon iconId="appJustify" className="h-5 w-5 text-primary" /> {/* App Icon */}
                    <span className="text-2xl font-bold text-primary">
                      {typeof justifyScore === 'number' ? justifyScore.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-left">
                <p className="text-sm">
                  <strong>Justify Score (V2):</strong> Calculated based on audience credibility,
                  account verification, engagement quality, and follower data.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This score provides a comprehensive view of an influencer's overall quality and
                  potential.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Verification Badge */}
          {isVerified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    // Apply sky blue colors AND force no change on hover
                    className="bg-sky-100 text-sky-800 hover:bg-sky-100 hover:text-sky-800 px-2 py-0.5 text-xs border-transparent cursor-default"
                  >
                    <Icon iconId="faCircleCheckSolid" className="h-3 w-3 mr-1" size="xs" />
                    Justify Verified Influencer
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
            <Badge variant="outline">{`Audience: ${audienceQualityIndicator}`}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
