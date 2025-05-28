'use client';

import React from 'react';
// import Image from 'next/image'; // Using standard img for simplicity unless optimization needed
import { InfluencerSummary } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge'; // Import badgeVariants
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon'; // Use direct path for clarity
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils'; // Import from utils
import { useRouter as _useRouter } from 'next/navigation'; // Prefixed
import { logger } from '@/utils/logger'; // Import logger
import { ButtonAddToCampaign as _ButtonAddToCampaign } from '@/components/ui/button-add-to-campaign'; // Import the new component - Prefixed
import { showSuccessToast as _showSuccessToast } from '@/components/ui/toast'; // Updated import path - Prefixed

interface InfluencerSummaryCardProps {
  influencer: InfluencerSummary;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
  onViewProfile: (identifier: string) => void;
  className?: string;
}

// Map PlatformEnum to the correct IDs from brands-icon-registry.json
const platformIconMap: Record<PlatformEnum, string> = {
  [PlatformEnum.Instagram]: 'brandsInstagram', // Corrected ID
  [PlatformEnum.TikTok]: 'brandsTiktok', // Corrected ID
  [PlatformEnum.YouTube]: 'brandsYoutube', // Corrected ID
  [PlatformEnum.Twitter]: 'brandsXTwitter', // Corrected ID (Assuming XTwitter)
  [PlatformEnum.Facebook]: 'brandsFacebook', // Corrected ID
  [PlatformEnum.Twitch]: 'brandsTwitch', // Corrected ID
  [PlatformEnum.Pinterest]: 'brandsPinterest', // Corrected ID
  [PlatformEnum.LinkedIn]: 'brandsLinkedin', // Corrected ID
  // Add other platforms as needed
};

export const InfluencerSummaryCard: React.FC<InfluencerSummaryCardProps> = ({
  influencer,
  isSelected,
  onSelectToggle,
  onViewProfile,
  className,
}) => {
  const _router = _useRouter(); // Prefixed

  // Determine badge styling based on quality
  let _qualityBadgeStyles = ''; // Prefixed
  if (influencer.audienceQualityIndicator === 'High') {
    _qualityBadgeStyles =
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent'; // Success-like style
  } else if (influencer.audienceQualityIndicator === 'Medium') {
    _qualityBadgeStyles =
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-transparent'; // Warning-like style
  } else if (influencer.audienceQualityIndicator === 'Low') {
    // Use the destructive variant styling directly if appropriate or define custom low style
    _qualityBadgeStyles = badgeVariants({ variant: 'destructive' }); // Or custom low-quality styles
  } else {
    _qualityBadgeStyles = badgeVariants({ variant: 'secondary' }); // Fallback style
  }

  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden relative',
        isSelected ? 'border-2 border-sky-500 dark:border-sky-400' : 'border', // Apply conditional border
        className
      )}
      data-testid="influencer-card"
    >
      {/* Selection Checkbox Area - Positioned relative to card */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          id={`select-${influencer.id}`}
          checked={isSelected}
          onCheckedChange={() => onSelectToggle(influencer.id)}
          aria-label={`Select ${influencer.name}`}
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
        />
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4 pt-8">
        {' '}
        {/* Increased padding top */}
        {/* Avatar and Name */}
        <div className="flex items-center mb-3">
          <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
            {/* Using standard img tag as next/image caused issues previously */}
            <AvatarImage src={influencer.avatarUrl ?? undefined} alt={influencer.name ?? ''} />
            <AvatarFallback>{getInitials(influencer.name ?? '')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {' '}
            {/* Ensure text truncates */}
            <p className="text-md font-semibold text-gray-900 dark:text-white truncate">
              {influencer.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              @{influencer.handle}
            </p>
          </div>
        </div>
        {/* Platform Icons & Verification */}
        <div className="flex items-center space-x-2 mb-3 flex-wrap">
          {influencer.platforms?.map(platform => (
            <Icon
              key={platform}
              iconId={platformIconMap[platform] || 'faCircleQuestionLight'} // Use correct map, keep fallback
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              aria-label={platform}
              size="sm" // Added size prop for consistency
            />
          ))}
          {influencer.isVerified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Use secondary variant, style manually for success appearance */}
                  <Badge
                    variant="secondary"
                    // Add pointer-events-none and force non-hover colors
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-1.5 py-0.5 text-xs border-transparent pointer-events-none hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900 dark:hover:text-green-200"
                  >
                    {/* Use iconId prop - Corrected ID */}
                    <Icon iconId="faCircleCheckSolid" className="h-3 w-3 mr-1" size="xs" /> Verified
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Account verified by Justify.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {/* Audience Tags */}
        <div className="flex flex-wrap gap-1 mb-3 text-xs">
          {influencer.primaryAudienceLocation && (
            <Badge variant="outline">{influencer.primaryAudienceLocation}</Badge>
          )}
          {influencer.primaryAudienceAgeRange && (
            <Badge variant="outline">{influencer.primaryAudienceAgeRange}</Badge>
          )}
          {influencer.primaryAudienceGender && (
            <Badge variant="outline">{influencer.primaryAudienceGender}</Badge>
          )}
        </div>
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
          <div className="font-medium text-gray-700 dark:text-gray-300">Followers:</div>
          <div className="text-right text-gray-900 dark:text-white">
            {influencer.followersCount ? influencer.followersCount.toLocaleString() : 'No data'}
          </div>

          <div className="font-medium text-gray-700 dark:text-gray-300">Justify Score:</div>
          <div
            className="text-right text-gray-900 dark:text-white flex items-center justify-end"
            data-testid="justify-score"
          >
            {influencer.justifyScore ?? 'Analyzing...'}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block ml-1 cursor-help">
                    <Icon iconId="appJustify" className="h-3 w-3 text-gray-400" size="xs" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-left whitespace-normal">
                    <p className="text-sm">
                      <strong>Justify Score (V2):</strong> Calculated based on audience credibility,
                      account verification, engagement quality, and follower data from InsightIQ
                      API.
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      This score provides a comprehensive view of an influencer's overall quality
                      and potential using real platform data.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="font-medium text-gray-700 dark:text-gray-300">Engagement Rate:</div>
          <div className="text-right text-gray-900 dark:text-white">
            {/* Display with 2 decimal places if available */}
            {influencer.engagementRate
              ? `${(influencer.engagementRate * 100).toFixed(2)}%`
              : 'No data'}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="mt-auto pt-3 space-y-2">
          {' '}
          {/* Adjusted for multiple buttons */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              if (influencer.id) {
                onViewProfile(influencer.id);
              } else {
                logger.error(
                  '[InfluencerSummaryCard] Missing influencer.id, cannot view profile.',
                  { influencerData: influencer }
                );
              }
            }}
          >
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
};
