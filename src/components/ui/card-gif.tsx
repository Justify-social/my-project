/**
 * @component GifCard
 * @category organism
 * @description Displays gif as a tile with a selectable answer option.
 * Uses Shadcn UI Card, Icon.
 * @status In progress
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Icon } from './icon/icon';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from '@/components/ui/input';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { Textarea } from '@/components/ui/textarea';

export interface GifCardProps {
  /** URL of the GIF */
  gifUrl?: string | null;
  /** Alternative text for the GIF */
  altText?: string;
  /** Text for the answer option associated with this GIF */
  optionText: string;
  /** Whether this option is currently selected */
  isSelected?: boolean;
  /** Callback when the card/option is clicked */
  onClick?: () => void;
  /** Callback when the search icon is clicked */
  onSearchClick?: () => void;
  /** Additional CSS classes for the Card */
  className?: string;
  /** Is the card/actions disabled */
  disabled?: boolean;
  /** Title for disabled state */
  disabledTitle?: string;
  /** Whether the option text is currently being edited */
  isEditingText?: boolean;
  /** Current value of the text being edited */
  editingTextValue?: string;
  /** Callback when the editing text value changes */
  onEditingTextChange?: (newText: string) => void;
  /** Callback when the text editing is saved */
  onSaveText?: () => void;
  /** Callback when text editing is cancelled */
  onCancelText?: () => void;
  /** Whether the save button for text editing should be disabled */
  editTextSaveDisabled?: boolean;
}

export function GifCard({
  gifUrl,
  altText = 'Survey option GIF',
  optionText,
  isSelected,
  onClick,
  onSearchClick,
  className,
  disabled,
  disabledTitle,
  isEditingText,
  editingTextValue,
  onEditingTextChange,
  onSaveText,
  onCancelText,
  editTextSaveDisabled,
}: GifCardProps) {
  const [isPaused, setIsPaused] = useState(false); // Visual state for pause

  const handleCardClick = () => {
    if (disabled) return;
    onClick?.();
  };

  const handleSearchAction = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation(); // Prevent card click if the overlay/button is clicked
    onSearchClick?.();
  };

  return (
    <Card
      className={cn(
        'overflow-hidden w-full flex flex-col h-full',
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md',
        disabled ? 'opacity-70 cursor-not-allowed' : 'border-slate-200',
        className
      )}
      title={disabled ? disabledTitle : altText || optionText}
    >
      <CardContent className="p-0 relative aspect-square flex-grow flex items-center justify-center bg-slate-50 group overflow-hidden">
        {gifUrl ? (
          <>
            <img
              src={gifUrl}
              alt={altText || optionText}
              className="object-contain w-full h-full"
            />
            {onSearchClick && !disabled && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer rounded-none"
                onClick={handleSearchAction}
                title="Change GIF"
              >
                <Icon iconId="faMagnifyingGlassLight" className="h-7 w-7 text-white" />
              </div>
            )}
          </>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
            title={disabled ? disabledTitle : 'Add a GIF to this option'}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearchAction}
              disabled={disabled}
              className="bg-white hover:bg-slate-100 shadow-sm"
            >
              <Icon iconId="faMagnifyingGlassPlusLight" className="mr-2 h-4 w-4" />
              Add GIF
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 border-t flex items-center justify-center min-h-[70px]">
        {isEditingText ? (
          <div className="flex flex-col w-full space-y-2 items-stretch">
            <Textarea
              value={editingTextValue || ''}
              onChange={e => onEditingTextChange?.(e.target.value)}
              className="text-sm w-full min-h-[60px] resize-none p-2 border border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Option text"
              rows={2}
              disabled={disabled}
              onKeyDown={e => {
                if (e.key === ' ') {
                  e.stopPropagation(); // Prevent spacebar from bubbling to DND listeners
                }
                if (e.key === 'Enter' && !e.shiftKey && !editTextSaveDisabled) {
                  e.preventDefault();
                  onSaveText?.();
                }
                if (e.key === 'Escape') {
                  e.stopPropagation(); // Also good to stop propagation for Escape if it causes issues
                  onCancelText?.();
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <IconButtonAction
                iconBaseName="faFloppyDisk"
                ariaLabel="Save option text"
                onClick={() => !disabled && !editTextSaveDisabled && onSaveText?.()}
                className={cn(
                  'h-8 w-8 p-1.5',
                  (disabled || editTextSaveDisabled) && 'opacity-50 cursor-not-allowed'
                )}
                hoverColorClass="text-primary"
              />
              <IconButtonAction
                iconBaseName="faCircleXmark"
                ariaLabel="Cancel editing"
                onClick={() => !disabled && onCancelText?.()}
                className={cn('h-8 w-8 p-1.5', disabled && 'opacity-50 cursor-not-allowed')}
                hoverColorClass="text-destructive"
              />
            </div>
          </div>
        ) : (
          <Button
            variant={isSelected ? 'default' : 'ghost'}
            className="w-full rounded-none h-auto py-2.5 px-3 text-sm whitespace-normal text-center justify-center flex-grow min-h-[40px]"
            onClick={handleCardClick}
            disabled={disabled}
            title={disabled ? disabledTitle : optionText}
          >
            {optionText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
