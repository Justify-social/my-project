'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter as _useRouter } from 'next/navigation'; // May not be needed here if navigation is handled by parent - Prefixed
import { Button, ButtonProps } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon/icon';
import { toast } from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';
import logger from '@/lib/logger';
import { PlatformEnum } from '@/types/enums';
import { Label } from '@/components/ui/label';

// Simplified CampaignType for the dropdown
interface CampaignDropdownItem {
  id: string;
  name: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ButtonAddToCampaignProps {
  influencerHandle: string;
  influencerName: string; // For dialog title
  /** The platform the influencer is being added from, or their primary platform */
  currentPlatform: PlatformEnum;
  /** All platforms the influencer is available on, if selection is needed */
  availablePlatforms?: PlatformEnum[];
  onSuccess?: (campaignId: string, campaignName: string) => void;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
  buttonText?: string;
}

export const ButtonAddToCampaign: React.FC<ButtonAddToCampaignProps> = ({
  influencerHandle,
  influencerName,
  currentPlatform,
  availablePlatforms,
  onSuccess,
  variant = 'default', // Default variant for the trigger button
  size = 'sm',
  className,
  buttonText = 'Add to Campaign',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [campaignsList, setCampaignsList] = useState<CampaignDropdownItem[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedPlatformForCampaign, setSelectedPlatformForCampaign] =
    useState<PlatformEnum | null>(currentPlatform);
  const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);
  const [isAddingToCampaign, setIsAddingToCampaign] = useState(false);

  const fetchCampaignsForDropdown = useCallback(async () => {
    if (!isDialogOpen) return;
    logger.info('[ButtonAddToCampaign] Fetching campaigns...');
    setIsFetchingCampaigns(true);
    try {
      const response = await fetch('/api/campaigns/selectable-list');
      const result = await response.json();
      if (response.ok && result.success) {
        const allCampaigns = result.data || [];
        const suitableCampaigns = allCampaigns.filter(
          (campaign: CampaignDropdownItem) =>
            campaign.status && campaign.status.toUpperCase() !== 'COMPLETED'
        );
        setCampaignsList(suitableCampaigns);
        if (suitableCampaigns.length === 0) {
          toast('No suitable (non-completed) campaigns available to add this influencer to.');
        }
      } else {
        logger.error('[ButtonAddToCampaign] Failed to fetch campaigns:', result.error);
        showErrorToast(result.error || 'Failed to load campaigns.');
        setCampaignsList([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      logger.error('[ButtonAddToCampaign] Error fetching campaigns:', {
        error: message,
        originalError: err,
      });
      showErrorToast(`Failed to load campaigns: ${message}`);
      setCampaignsList([]);
    } finally {
      setIsFetchingCampaigns(false);
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (isDialogOpen) {
      fetchCampaignsForDropdown();
      // Reset selected platform if influencer has multiple and dialog re-opens
      if (availablePlatforms && availablePlatforms.length > 1) {
        setSelectedPlatformForCampaign(currentPlatform);
      } else if (availablePlatforms && availablePlatforms.length === 1) {
        setSelectedPlatformForCampaign(availablePlatforms[0]);
      } else {
        setSelectedPlatformForCampaign(currentPlatform);
      }
    }
  }, [isDialogOpen, fetchCampaignsForDropdown, availablePlatforms, currentPlatform]);

  const handleAddToCampaignSubmit = async () => {
    if (!selectedCampaignId) {
      showErrorToast('Please select a campaign.');
      return;
    }

    let platformToSubmit: PlatformEnum;
    if (availablePlatforms && availablePlatforms.length > 1) {
      if (!selectedPlatformForCampaign) {
        showErrorToast('Please select a platform for this campaign.');
        return;
      }
      platformToSubmit = selectedPlatformForCampaign;
    } else {
      platformToSubmit = currentPlatform;
    }

    const payload = {
      handle: influencerHandle,
      platform: platformToSubmit,
    };

    logger.info('[ButtonAddToCampaign] Submitting Add to Campaign:', {
      campaignId: selectedCampaignId,
      payload,
    });
    setIsAddingToCampaign(true);
    const toastId = toast.loading('Adding influencer to campaign...');

    try {
      const response = await fetch(`/api/campaigns/${selectedCampaignId}/influencers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toast.dismiss(toastId);
        showSuccessToast(result.message || 'Influencer added successfully!');
        setIsDialogOpen(false);
        if (onSuccess) {
          const selectedCampaign = campaignsList.find(c => c.id === selectedCampaignId);
          onSuccess(selectedCampaignId, selectedCampaign?.name || 'Selected Campaign');
        }
      } else {
        toast.dismiss(toastId);
        logger.error('[ButtonAddToCampaign] Failed to add influencer:', result);
        showErrorToast(result.error || result.message || 'Failed to add influencer.');
      }
    } catch (err) {
      toast.dismiss(toastId);
      const message = err instanceof Error ? err.message : 'Network error';
      logger.error('[ButtonAddToCampaign] Error submitting:', {
        error: message,
        originalError: err,
      });
      showErrorToast(`Error: ${message}`);
    } finally {
      setIsAddingToCampaign(false);
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={() => {
            setSelectedCampaignId(null); // Reset selection when opening
            // setSelectedPlatformForCampaign(currentPlatform); // Reset platform handled by useEffect
            setIsDialogOpen(true);
          }}
        >
          {buttonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add {influencerName} to Campaign</AlertDialogTitle>
          <AlertDialogDescription>
            Select a campaign and platform (if applicable) to add this influencer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="campaign-select" className="block text-sm font-medium mb-1">
              Campaign
            </Label>
            {isFetchingCampaigns ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : campaignsList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No draft or active campaigns found.
              </p>
            ) : (
              <Select
                onValueChange={setSelectedCampaignId}
                value={selectedCampaignId || ''}
                disabled={isFetchingCampaigns}
              >
                <SelectTrigger id="campaign-select" className="w-full">
                  <SelectValue placeholder="Select a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {campaignsList.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}{' '}
                      <span className="text-xs opacity-70 ml-2">({campaign.status})</span>
                      {campaign.startDate && campaign.endDate && (
                        <span className="text-xs opacity-50 ml-2">
                          {new Date(campaign.startDate).toLocaleDateString()} -{' '}
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {availablePlatforms && availablePlatforms.length > 1 && (
            <div>
              <Label htmlFor="platform-select" className="block text-sm font-medium mb-1">
                Platform for this Campaign
              </Label>
              <Select
                onValueChange={value => setSelectedPlatformForCampaign(value as PlatformEnum)}
                value={selectedPlatformForCampaign || ''}
              >
                <SelectTrigger id="platform-select" className="w-full">
                  <SelectValue placeholder="Select platform..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePlatforms.map(platformValue => (
                    <SelectItem key={platformValue} value={platformValue}>
                      {platformValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsDialogOpen(false)} disabled={isAddingToCampaign}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAddToCampaignSubmit}
            disabled={
              isAddingToCampaign ||
              isFetchingCampaigns ||
              !selectedCampaignId ||
              (availablePlatforms && availablePlatforms.length > 1 && !selectedPlatformForCampaign)
            }
          >
            {isAddingToCampaign ? (
              <>
                <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" /> Adding...
              </>
            ) : (
              'Add to Campaign'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ButtonAddToCampaign;
