'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Import DialogClose for explicit closing
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon/icon';
// Import base toast for local helpers
import { toast } from 'react-hot-toast';
// import { showSuccessToast, showErrorToast } from '../../utils/toastUtils'; // Remove failing import
import { logger } from '@/utils/logger'; // Use logger

interface DuplicateCampaignButtonProps {
  campaignId: string;
  campaignName: string;
  onDuplicateSuccess?: () => void; // Optional callback after success
  // Add variant/size/className props if needed for the trigger button
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  className?: string;
  buttonContent?: React.ReactNode; // Allow custom button content (e.g., icon only)
}

export const DuplicateCampaignButton: React.FC<DuplicateCampaignButtonProps> = ({
  campaignId,
  campaignName,
  onDuplicateSuccess,
  variant = 'outline', // Default button style
  size = 'sm', // Default button size
  className,
  buttonContent = ( // Default button content
    <>
      <Icon iconId="faCopyLight" className="mr-2 h-4 w-4" />
      Duplicate
    </>
  ),
}) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState(`Copy of ${campaignName}`);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // --- Define Toast Helper Functions Locally ---
  const showSuccessToast = (message: string, iconId?: string) => {
    const finalIconId = iconId || 'faFloppyDiskLight';
    const successIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-success" />;
    toast.success(message, {
      duration: 3000,
      className: 'toast-success-custom', // Defined in globals.css
      icon: successIcon,
    });
  };

  const showErrorToast = (message: string, iconId?: string) => {
    const finalIconId = iconId || 'faTriangleExclamationLight';
    const errorIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-destructive" />;
    toast.error(message, {
      duration: 5000,
      className: 'toast-error-custom', // Defined in globals.css
      icon: errorIcon,
    });
  };
  // --- End Toast Helper Functions ---

  // Reset name when dialog opens
  useEffect(() => {
    if (isOpen) {
      setDuplicateName(`Copy of ${campaignName}`);
      setNameError(null); // Clear previous errors
      setIsCheckingName(false);
      setIsDuplicating(false);
    }
  }, [isOpen, campaignName]);

  const checkNameExists = async (name: string): Promise<boolean> => {
    if (!isLoaded) {
      showErrorToast('Authentication status is loading. Please try again shortly.');
      return true; // Indicate failure
    }
    if (!user) {
      showErrorToast('You must be signed in to check campaign names.');
      router.push('/sign-in');
      return true; // Indicate failure
    }

    setIsCheckingName(true);
    setNameError(null);
    try {
      const response = await fetch(`/api/campaigns/check-name?name=${encodeURIComponent(name)}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to check name validity.');
      }
      if (result.exists) {
        setNameError('This campaign name already exists. Please choose another.');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to check campaign name existence:', error);
      showErrorToast('Could not verify campaign name. Please try again.');
      return true;
    } finally {
      setIsCheckingName(false);
    }
  };

  const handleDuplicate = async () => {
    if (!isLoaded) {
      showErrorToast('Authentication status is loading. Please try again shortly.');
      return;
    }
    if (!user) {
      showErrorToast('You must be signed in to duplicate campaigns.');
      router.push('/sign-in');
      return;
    }

    const trimmedName = duplicateName.trim();
    if (!trimmedName) {
      setNameError('Campaign name cannot be empty.');
      return;
    }

    const nameExists = await checkNameExists(trimmedName);
    if (nameExists) {
      return; // Error message handled in checkNameExists
    }

    setIsDuplicating(true);
    try {
      // TODO: Implement the actual duplication API endpoint
      const response = await fetch(`/api/campaigns/${campaignId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: trimmedName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to duplicate campaign: ${response.status}`);
      }

      showSuccessToast('Campaign duplicated successfully!'); // Use local helper
      setIsOpen(false); // Close dialog on success
      onDuplicateSuccess?.(); // Trigger callback if provided
    } catch (error) {
      logger.error('Error duplicating campaign:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to duplicate campaign'); // Use local helper
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
        title={`Duplicate campaign: ${campaignName}`}
      >
        {buttonContent}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate Campaign</DialogTitle>
          <DialogDescription>
            Enter a new name for the duplicated campaign (originally "{campaignName}").
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="duplicate-name">New Campaign Name</Label>
          <Input
            id="duplicate-name"
            value={duplicateName}
            onChange={e => {
              setDuplicateName(e.target.value);
              if (nameError) setNameError(null); // Clear error on typing
            }}
            placeholder="Enter new campaign name"
            className={nameError ? 'border-destructive' : ''}
          />
          {isCheckingName && <p className="text-xs text-muted-foreground">Checking name...</p>}
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDuplicating || !isLoaded}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleDuplicate}
            disabled={
              !isLoaded ||
              !user ||
              isDuplicating ||
              isCheckingName ||
              !duplicateName.trim() ||
              !!nameError
            }
            className="bg-accent text-primary-foreground hover:bg-accent/90 hover:text-foreground"
          >
            {isDuplicating ? (
              <>
                <Icon iconId="faCircleNotchLight" className="animate-spin mr-2 h-4 w-4" />{' '}
                Duplicating...
              </>
            ) : (
              'Duplicate Campaign'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Export default if needed, or keep as named export
// export default DuplicateCampaignButton;
