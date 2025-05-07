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
import { format } from 'date-fns';
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
import { Badge } from '@/components/ui/badge';
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

// Helper function to determine Badge variant based on status
const getStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status?.toLowerCase()) {
    case 'live':
    case 'active':
    case 'completed':
      return 'default'; // Use primary color for active/complete
    case 'scheduled':
    case 'confirmed':
      return 'secondary'; // Use secondary for scheduled
    case 'draft':
    case 'planning':
      return 'outline'; // Use outline for planning/drafts
    case 'paused':
    case 'error':
      return 'destructive'; // Use destructive for paused/errors
    default:
      return 'outline';
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

  // Helper to format dates
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    try {
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
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
  const columnCount = 7; // Campaign, Platform, Influencer, Budget, Start Date, End Date, Status

  return (
    <TooltipProvider>
      <div className={cn('overflow-x-auto', className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Influencer</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
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
              campaigns.map(campaign => (
                <TableRow
                  key={campaign.id}
                  className={
                    onRowClick && !campaign.title
                      ? 'cursor-pointer hover:bg-muted/50'
                      : 'hover:bg-muted/50'
                  }
                >
                  <TableCell className="font-medium">
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
                            <span>{campaign.status || 'N/A'}</span>
                            <span className="font-medium text-muted-foreground">Start:</span>
                            <span>{formatDate(campaign.startDate)}</span>
                            <span className="font-medium text-muted-foreground">End:</span>
                            <span>{campaign.endDate ? formatDate(campaign.endDate) : 'N/A'}</span>
                            <span className="font-medium text-muted-foreground">Budget:</span>
                            <span>{formatCurrency(campaign.budget)}</span>
                            <span className="font-medium text-muted-foreground">Influencer:</span>
                            <span>{campaign.influencer?.name || 'N/A'}</span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {campaign.platform ? (
                      <span className="flex items-center">
                        {platformIconMap[campaign.platform.toLowerCase()] && (
                          <Icon
                            iconId={platformIconMap[campaign.platform.toLowerCase()]}
                            className="mr-1.5 h-4 w-4 text-muted-foreground"
                          />
                        )}
                        <span className="text-sm">{campaign.platform}</span>
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
                  <TableCell>{formatDate(campaign.startDate)}</TableCell>
                  <TableCell>{formatDate(campaign.endDate)}</TableCell>
                  <TableCell>
                    {campaign.status ? (
                      <Badge variant={getStatusVariant(campaign.status)} className="text-xs">
                        {campaign.status}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
