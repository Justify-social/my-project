'use client';

import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { toast } from 'sonner';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/components/ui/toast';
import { InfluencerProfileData } from '@/types/influencer';
import { logger } from '@/utils/logger';

export interface SaveInfluencerButtonProps {
  influencer: InfluencerProfileData;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
  buttonText?: string;
  onSuccess?: (influencerId: string) => void;
}

export const SaveInfluencerButton: React.FC<SaveInfluencerButtonProps> = ({
  influencer,
  variant = 'outline',
  size = 'sm',
  className,
  buttonText = 'Save',
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInfluencer = async () => {
    if (!influencer?.id && !influencer?.handle) {
      showErrorToast('Cannot save: Influencer information is incomplete.');
      return;
    }

    setIsSaving(true);
    const savingToastId = toast.loading('Saving influencer to your list...');

    try {
      // Prepare influencer data for saving
      const savePayload = {
        profileId: influencer.id || `temp-${Date.now()}`,
        handle: influencer.handle,
        name: influencer.name,
        platform: influencer.platforms?.[0] || 'INSTAGRAM',
        avatarUrl: influencer.avatarUrl,
        bio: influencer.bio,
        followerCount: influencer.followersCount,
        engagementRate: influencer.engagementRate,
        isVerified: influencer.isVerified,
        category: influencer.category,
        justifyScore: influencer.justifyScore,
        website: influencer.website,
        contactEmail: influencer.contactEmail,
        savedAt: new Date().toISOString(),
        savedBy: 'current-user', // This would come from auth context in real implementation
      };

      logger.info('[SaveInfluencerButton] Saving influencer to user list:', {
        influencerId: influencer.id,
        handle: influencer.handle,
        name: influencer.name,
      });

      // Make API call to save influencer to user's list
      const response = await fetch('/api/saved-influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savePayload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.dismiss(savingToastId);
        showSuccessToast(
          `${influencer.name || influencer.handle} saved to your list!`,
          'faFloppyDiskLight'
        );

        if (onSuccess) {
          onSuccess(influencer.id || influencer.handle!);
        }
      } else {
        toast.dismiss(savingToastId);
        logger.error('[SaveInfluencerButton] Failed to save influencer:', result);

        // Handle specific error cases
        if (result.error?.includes('already saved') || result.message?.includes('already exists')) {
          showWarningToast(
            `${influencer.name || influencer.handle} is already in your saved list.`
          );
        } else {
          showErrorToast(result.error || result.message || 'Failed to save influencer.');
        }
      }
    } catch (error) {
      toast.dismiss(savingToastId);
      const message = error instanceof Error ? error.message : 'Network error';
      logger.error('[SaveInfluencerButton] Error saving influencer:', {
        error: message,
        originalError: error,
      });
      showErrorToast(`Error saving influencer: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSaveInfluencer}
      disabled={isSaving}
    >
      {isSaving ? (
        <>
          <Icon iconId="faCircleNotchLight" className="animate-spin mr-2 h-4 w-4" />
          Saving...
        </>
      ) : (
        <>
          <Icon iconId="faFloppyDiskLight" className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default SaveInfluencerButton;
