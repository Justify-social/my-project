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
  id: number; // Changed to number based on CampaignWizardSubmission schema
  campaignName: string;
  createdAt: string;
  status: string; // Mapped status (e.g., COMPLETED)
}

interface CampaignSelectorProps {
  onCampaignSelected: (campaignId: number | null) => void; // Expecting number | null
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
        // Fetch COMPLETED campaigns (API defaults to this filter)
        const response = await fetch('/api/campaigns?status=completed'); // Explicitly add status for clarity
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch campaigns: ${response.statusText}`);
        }
        const data: Campaign[] = await response.json();
        setCampaigns(data);
        if (data.length === 0) {
          setError('No completed campaigns found. Please create and complete a campaign first.');
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
    const numericId = parseInt(selectedCampaignId, 10);
    if (!isNaN(numericId)) {
      onCampaignSelected(numericId);
    } else {
      logger.error('Attempted to submit with invalid campaign ID:', { selectedCampaignId });
      onCampaignSelected(null); // Pass null if invalid
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
        <CardDescription>
          Choose a completed campaign to set up your Brand Lift study.
        </CardDescription>
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
            No completed campaigns available.
          </p>
        )}
        {campaigns.length > 0 && (
          <Select onValueChange={handleSelectChange} value={selectedCampaignId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a completed campaign..." />
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
