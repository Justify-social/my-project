/**
 * @component UpcomingCampaignsTable
 * @category organism
 * @subcategory data-display
 * @description Displays a table of upcoming campaigns within a card.
 * @status 10th April
 * @param {UpcomingCampaignsTableProps} props - The props for the UpcomingCampaignsTable component.
 * @param {CampaignData[]} props.campaigns - An array of campaign data objects to display.
 * @param {string} [props.className] - Additional CSS classes for the Card container.
 * @param {(campaignId: string | number) => void} [props.onRowClick] - Optional callback when a row is clicked.
 * @returns {React.ReactElement | null} The rendered table component or null if no campaigns are provided.
 */
'use client';

import React from 'react';
import { format, isSameDay, isSameMonth, isSameYear } from 'date-fns';
import Link from 'next/link'; // Import Link from Next.js
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component is available
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components
import Image from 'next/image'; // Import Image
import { getCampaignStatusInfo, CampaignStatusKey } from '@/utils/statusUtils'; // Import centralized utility

// Data structure for a single campaign row
export interface CampaignData {
  id: string | number;
  title: string;
  platform?: string;
  influencer?: {
    name: string;
    image?: string;
  };
  budget?: number;
  startDate: Date;
  endDate?: Date;
  status?: CampaignStatusKey; // Use CampaignStatusKey
}

// Props for the UpcomingCampaignsTable component
export interface UpcomingCampaignsTableProps {
  campaigns?: CampaignData[];
  className?: string;
  onRowClick?: (campaignId: string | number) => void;
}

// Helper function to map platform names to icon registry IDs/paths
// (Copied from calendar-upcoming.tsx for consistency)
const platformIconMapForCard: Record<string, string> = {
  facebook: '/icons/brands/brandsFacebook.svg',
  github: '/icons/brands/brandsGithub.svg',
  instagram: '/icons/brands/brandsInstagram.svg',
  linkedin: '/icons/brands/brandsLinkedin.svg',
  tiktok: '/icons/brands/brandsTiktok.svg',
  x: '/icons/brands/brandsXTwitter.svg',
  twitter: '/icons/brands/brandsXTwitter.svg', // Alias
  youtube: '/icons/brands/brandsYoutube.svg',
};

const getPlatformIconPathForCard = (platformName?: string): string | undefined => {
  if (!platformName) return undefined;
  return platformIconMapForCard[platformName.toLowerCase()];
};

export function UpcomingCampaignsTable({
  campaigns = [],
  className,
  onRowClick,
}: UpcomingCampaignsTableProps) {
  const handleRowClick = (campaignId: string | number) => {
    if (onRowClick) {
      onRowClick(campaignId);
    }
  };

  // Helper to format currency
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
  };

  // Helper to format single dates (remains for tooltip or single date display)
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    try {
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  // New helper to format campaign duration
  const formatCampaignDuration = (startDate?: Date, endDate?: Date): string => {
    if (!startDate) return '-';

    const startFormatted = format(startDate, 'MMM d');
    const startYearFormatted = format(startDate, 'yyyy');
    const startFullFormatted = format(startDate, 'MMM d, yyyy');

    if (!endDate || isSameDay(startDate, endDate)) {
      return startFullFormatted;
    }

    const endFormatted = format(endDate, 'd');
    const endMonthFormatted = format(endDate, 'MMM d');
    const endYearFormatted = format(endDate, 'yyyy');
    const endFullFormatted = format(endDate, 'MMM d, yyyy');

    if (isSameYear(startDate, endDate)) {
      if (isSameMonth(startDate, endDate)) {
        // Same month and year: May 7 - 14, 2025
        return `${startFormatted} - ${endFormatted}, ${startYearFormatted}`;
      } else {
        // Different months, same year: May 7 - Jun 14, 2025
        return `${startFormatted} - ${endMonthFormatted}, ${startYearFormatted}`;
      }
    } else {
      // Different years: Dec 28, 2024 - Jan 5, 2025
      return `${startFullFormatted} - ${endFullFormatted}`;
    }
  };

  // Determine the number of columns for the empty state cell
  const columnCount = 5; // Campaign, Status, Influencer, Budget, Date (Platform removed, Dates combined)

  return (
    <TooltipProvider>
      <div className={cn('overflow-x-auto', className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Influencer</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead>Campaign Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!campaigns || campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Icon iconId="faCircleQuestionLight" className="w-12 h-12 mb-3" />
                    <p className="text-base font-medium">No Campaigns Yet</p>
                    <p className="text-sm">Get started by creating your first campaign.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map(campaign => {
                const statusInfo = getCampaignStatusInfo(campaign.status);
                return (
                  <TableRow
                    key={campaign.id}
                    className={
                      onRowClick && !campaign.title
                        ? 'cursor-pointer hover:bg-muted/50'
                        : 'hover:bg-muted/50'
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {(() => {
                          if (campaign.platform) {
                            const iconPath = getPlatformIconPathForCard(campaign.platform);
                            if (iconPath) {
                              return (
                                <Image
                                  src={iconPath}
                                  alt={campaign.platform}
                                  width={16}
                                  height={16}
                                  title={campaign.platform}
                                  className="opacity-80"
                                />
                              );
                            }
                          }
                          return null;
                        })()}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/campaigns/${campaign.id}`}
                              className="hover:underline text-accent"
                            >
                              {campaign.title}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="w-64 p-3 text-sm bg-background text-foreground border shadow-md rounded-md">
                            <div className="space-y-1.5">
                              <p className="font-semibold text-base mb-1 text-primary">
                                {campaign.title}
                              </p>
                              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
                                <span className="font-medium text-muted-foreground">Platform:</span>
                                {campaign.platform && campaign.platform.trim() !== '' ? (
                                  <div className="flex items-center space-x-1.5">
                                    {campaign.platform
                                      .split(/[,\s]+/)
                                      .map(p => p.trim())
                                      .filter(Boolean)
                                      .map(platformName => {
                                        const iconPath = getPlatformIconPathForCard(platformName);
                                        return iconPath ? (
                                          <Image
                                            key={platformName}
                                            src={iconPath}
                                            alt={platformName}
                                            width={14}
                                            height={14}
                                            title={platformName}
                                            className="opacity-80"
                                          />
                                        ) : (
                                          <span
                                            key={platformName}
                                            className="text-muted-foreground text-xs"
                                          >
                                            {platformName}
                                          </span>
                                        );
                                      })}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">N/A</span>
                                )}

                                <span className="font-medium text-muted-foreground">Status:</span>
                                <span className="text-muted-foreground">
                                  {statusInfo.text || 'N/A'}
                                </span>

                                <span className="font-medium text-muted-foreground">Duration:</span>
                                <span className="text-muted-foreground">
                                  {formatCampaignDuration(campaign.startDate, campaign.endDate)}
                                </span>

                                <span className="font-medium text-muted-foreground">Budget:</span>
                                <span className="text-muted-foreground">
                                  {formatCurrency(campaign.budget)}
                                </span>

                                <span className="font-medium text-muted-foreground">
                                  Influencer:
                                </span>
                                <span
                                  className="text-muted-foreground truncate"
                                  title={campaign.influencer?.name}
                                >
                                  {campaign.influencer?.name || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell>
                      {' '}
                      {/* Status cell - Use getStatusInfo */}
                      {campaign.status ? (
                        <span
                          className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}
                        >
                          {statusInfo.text}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {campaign.influencer ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={campaign.influencer.image}
                              alt={campaign.influencer.name}
                            />
                            <AvatarFallback className="text-xs">
                              {campaign.influencer.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{campaign.influencer.name}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(campaign.budget)}</TableCell>
                    <TableCell>
                      {formatCampaignDuration(campaign.startDate, campaign.endDate)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
