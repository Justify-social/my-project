'use client';

import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/icon'; // Corrected path
import logger from '@/lib/logger';

// Matches the data structure returned by the corrected /api/campaigns GET endpoint
interface Campaign {
  id: string; // Changed to string to match CampaignWizard.id
  campaignName: string;
  createdAt: string;
  status: string;
}

interface CampaignSelectorProps {
  onCampaignSelected: (campaignId: string | null) => void; // Expecting string | null
}

const CampaignSelector: React.FC<CampaignSelectorProps> = ({ onCampaignSelected }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(''); // Select component value is string
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/campaigns/selectable-list');
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: `Failed to fetch campaigns: ${response.statusText}` }));
          throw new Error(errorData.error || `Failed to fetch campaigns: ${response.statusText}`);
        }
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Map API data to the local Campaign interface
          const campaignsData: Campaign[] = result.data.map((item: any) => ({
            id: String(item.id), // Ensure id is a string for the Campaign interface and SelectItem value
            campaignName: item.name, // API returns 'name', component expects 'campaignName' via interface
            status: item.status,
            // API selectable-list returns startDate, endDate, not createdAt.
            // For display, we can use one of those or a fixed string if createdAt is not critical here.
            // Or, adjust API to return createdAt/updatedAt for this display if needed.
            createdAt: item.startDate || item.updatedAt || new Date().toISOString(),
          }));

          setCampaigns(campaignsData);
          if (campaignsData.length === 0) {
            setError('No suitable campaigns available to set up a Brand Lift study.');
          }
        } else {
          logger.error(
            '[CampaignSelector] API call did not return success or data is not an array',
            result
          );
          throw new Error(result.error || 'Invalid data format received from API.');
        }
      } catch (err: any) {
        logger.error('Error fetching campaigns for Brand Lift Selector:', { error: err.message });
        setError(err.message || 'An unexpected error occurred while fetching campaigns.');
      }
      setIsLoading(false);
    };

    fetchCampaigns();
  }, []);

  const handleSelectChange = (value: string) => {
    setSelectedCampaignId(value);
  };

  const handleSubmit = () => {
    if (selectedCampaignId) {
      onCampaignSelected(selectedCampaignId);
    } else {
      logger.error('No campaign selected or invalid ID state.');
      onCampaignSelected(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <Skeleton className="h-6 w-3/5 mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Skeleton className="h-10 w-full" />
          {/* Placeholder for other potential elements like Edit/Create buttons */}
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Skeleton className="h-10 w-1/3" />
        </CardFooter>
      </Card>
    );
  }

  if (error && campaigns.length === 0) {
    return (
      <Alert variant="destructive">
        <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" /> {/* Example error icon */}
        <AlertTitle>Error Loading Campaigns</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Select a Campaign</CardTitle>
        <CardDescription>Choose a campaign to set up your Brand Lift study.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {error && campaigns.length > 0 && (
          <Alert variant="destructive">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {campaigns.length === 0 && !isLoading && !error && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No suitable campaigns available to set up a Brand Lift study.
          </p>
        )}
        {campaigns.length > 0 && (
          <Select onValueChange={handleSelectChange} value={selectedCampaignId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a campaign..." />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={String(campaign.id)}>
                  {' '}
                  {/* Value must be string for SelectItem */}
                  {campaign.campaignName}
                  <span className="text-xs text-muted-foreground ml-2">
                    (Created: {new Date(campaign.createdAt).toLocaleDateString()})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {/* TODO: Implement Edit/Create New Campaign Buttons if required by design */}
        {/* Example structure:
                <div className="flex space-x-2 pt-4">
                    <Button variant="outline" size="sm" disabled={!selectedCampaignId}>Edit Selected</Button>
                    <Button variant="outline" size="sm">+ Create New Campaign</Button>
                </div>
                */}
      </CardContent>
      <CardFooter className="flex justify-end pt-4">
        <Button onClick={handleSubmit} disabled={!selectedCampaignId || isLoading}>
          Setup Brand Lift Study
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CampaignSelector;
