'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component is available

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
  dialogTitle?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  requiredInputText?: string;
  descriptionText?: string;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  dialogTitle = 'Confirm Deletion',
  confirmButtonText = 'Delete',
  cancelButtonText = 'Cancel',
  requiredInputText = 'DELETE',
  descriptionText,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset input when dialog is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
      setIsProcessing(false); // Also reset processing state
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      // The onConfirm function is responsible for its own toasts.
      // Dialog will close if onConfirm resolves, regardless of its internal success/failure handling.
    } catch (error) {
      // Errors should ideally be handled within onConfirm (e.g., show an error toast).
      // This catch is a safety net, but primary error feedback should be in onConfirm.
      console.error('Error during onConfirm in ConfirmDeleteDialog:', error);
    } finally {
      setIsProcessing(false);
      onClose(); // Close the dialog after processing, success or caught error.
    }
  };

  const isConfirmDisabled = inputValue !== requiredInputText || isProcessing;

  const defaultDescription = (
    <>
      This action cannot be undone. This will permanently delete the
      <span className="font-semibold text-foreground"> {itemName}</span>.
      <br />
      Please type <strong className="text-foreground">{requiredInputText}</strong> to confirm.
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{descriptionText || defaultDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-input" className="sr-only">
              {requiredInputText}
            </Label>
            <Input
              id="confirm-input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={`Type "${requiredInputText}" here`}
              className="col-span-4"
              disabled={isProcessing}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              {cancelButtonText}
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isConfirmDisabled}>
            {isProcessing ? (
              <>
                <Icon iconId="faCircleNotchLight" className="animate-spin mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              confirmButtonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
