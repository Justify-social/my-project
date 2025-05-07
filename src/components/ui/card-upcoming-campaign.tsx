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
  status?: string; // e.g., 'Planning', 'Active', 'Completed'
}

// Props for the UpcomingCampaignsTable component
export interface UpcomingCampaignsTableProps {
  campaigns?: CampaignData[];
  className?: string;
  onRowClick?: (campaignId: string | number) => void;
}

// Added getStatusInfo function (logic copied from campaigns/page.tsx)
// TODO: Consider moving this to a shared util file
const getStatusInfo = (status: string | null | undefined) => {
  const normalizedStatus = (status || '').toLowerCase();
  switch (normalizedStatus) {
    case 'approved':
      return { class: 'bg-green-100 text-green-800', text: 'Approved' };
    case 'active':
      return { class: 'bg-green-100 text-green-800', text: 'Active' };
    case 'in_review':
      return { class: 'bg-yellow-100 text-yellow-800', text: 'In Review' };
    case 'draft':
      return { class: 'bg-gray-100 text-gray-800', text: 'Draft' };
    case 'completed':
      return { class: 'bg-blue-100 text-blue-800', text: 'Completed' };
    case 'paused': // Assuming style for paused
      return { class: 'bg-red-100 text-red-800', text: 'Paused' };
    default:
      const defaultText = status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : 'Unknown';
      return { class: 'bg-gray-100 text-gray-800', text: defaultText };
  }
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

  // Map platform names to correct brand icon IDs
  const platformIconMap: { [key: string]: string } = {
    instagram: 'brandsInstagram',
    tiktok: 'brandsTiktok',
    youtube: 'brandsYoutube',
    facebook: 'brandsFacebook',
    twitter: 'brandsXTwitter',
    linkedin: 'brandsLinkedin',
    // Add other platforms if needed
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
                const statusInfo = getStatusInfo(campaign.status);
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
                        {campaign.platform && platformIconMap[campaign.platform.toLowerCase()] && (
                          <Icon
                            iconId={platformIconMap[campaign.platform.toLowerCase()]}
                            className="h-4 w-4 text-muted-foreground flex-shrink-0"
                          />
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/campaigns/${campaign.id}`}
                              className="hover:underline text-accent"
                            >
                              {campaign.title}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="w-64 p-3 text-sm">
                            <div className="space-y-1.5">
                              <p className="font-semibold text-base mb-1">{campaign.title}</p>
                              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                                <span className="font-medium text-muted-foreground">Platform:</span>
                                <span>{campaign.platform || 'N/A'}</span>
                                <span className="font-medium text-muted-foreground">Status:</span>
                                <span>{statusInfo.text || 'N/A'}</span>
                                <span className="font-medium text-muted-foreground">Duration:</span>
                                <span>
                                  {formatCampaignDuration(campaign.startDate, campaign.endDate)}
                                </span>
                                <span className="font-medium text-muted-foreground">Budget:</span>
                                <span>{formatCurrency(campaign.budget)}</span>
                                <span className="font-medium text-muted-foreground">
                                  Influencer:
                                </span>
                                <span>{campaign.influencer?.name || 'N/A'}</span>
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
