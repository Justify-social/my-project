/**
 * @component UpcomingCampaignsTable
 * @category organism
 * @subcategory data-display
 * @description Displays a table of upcoming campaigns within a card.
 * @status 10th April
 * @param {UpcomingCampaignsTableProps} props - The props for the UpcomingCampaignsTable component.
 * @param {CampaignData[]} props.campaigns - An array of campaign data objects to display.
 * @param {string} [props.title="Upcoming Campaigns"] - Optional title for the card.
 * @param {string} [props.description] - Optional description below the title.
 * @param {string} [props.className] - Additional CSS classes for the Card container.
 * @param {(campaignId: string | number) => void} [props.onRowClick] - Optional callback when a row is clicked.
 * @returns {React.ReactElement | null} The rendered table component or null if no campaigns are provided.
 */
'use client';

import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon/icon"; // Assuming Icon component is available

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
    title?: string;
    description?: string;
    className?: string;
    onRowClick?: (campaignId: string | number) => void;
}

// Helper function to determine Badge variant based on status
const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
        case 'live':
        case 'active':
        case 'completed': return 'default'; // Use primary color for active/complete
        case 'scheduled':
        case 'confirmed': return 'secondary'; // Use secondary for scheduled
        case 'draft':
        case 'planning': return 'outline'; // Use outline for planning/drafts
        case 'paused':
        case 'error': return 'destructive'; // Use destructive for paused/errors
        default: return 'outline';
    }
};

export function UpcomingCampaignsTable({
    campaigns = [],
    title = "Upcoming Campaigns",
    description,
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
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
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
        linkedin: 'brandsLinkedin'
        // Add other platforms if needed
    };

    if (!campaigns || campaigns.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No upcoming campaigns to display.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="px-0">
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
                        {campaigns.map((campaign) => (
                            <TableRow
                                key={campaign.id}
                                onClick={() => handleRowClick(campaign.id)}
                                className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                            >
                                <TableCell className="font-medium">{campaign.title}</TableCell>
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
                                                <AvatarImage src={campaign.influencer.image} alt={campaign.influencer.name} />
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
                                        <Badge variant={getStatusVariant(campaign.status)} className="text-xs">{campaign.status}</Badge>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
