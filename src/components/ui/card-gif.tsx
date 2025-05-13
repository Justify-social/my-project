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

export interface GifCardProps {
  /** URL of the GIF */
  gifUrl: string;
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
  /** Whether to show the pause button (visual cue only for now) */
  showPauseButton?: boolean;
  /** Additional CSS classes for the Card */
  className?: string;
  /** Is the card/actions disabled */
  disabled?: boolean;
  /** Title for disabled state */
  disabledTitle?: string;
}

export function GifCard({
  gifUrl,
  altText = 'Survey option GIF',
  optionText,
  isSelected,
  onClick,
  onSearchClick,
  showPauseButton = true,
  className,
  disabled,
  disabledTitle,
}: GifCardProps) {
  const [isPaused, setIsPaused] = useState(false); // Visual state for pause

  const handleCardClick = () => {
    if (disabled) return;
    onClick?.();
  };

  const handlePauseClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation(); // Prevent card click when pause is clicked
    setIsPaused(!isPaused);
    // Actual GIF pause/play functionality is complex with standard <img>
    // For now, this just toggles the icon.
  };

  const handleSearchOverlayClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation(); // Prevent card click if the overlay is clicked
    onSearchClick?.();
  };

  return (
    <Card
      className={cn(
        'overflow-hidden w-full flex flex-col',
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md',
        disabled ? 'opacity-70 cursor-not-allowed' : '',
        className
      )}
      title={disabled ? disabledTitle : altText}
    >
      <CardContent className="p-0 relative aspect-square flex-grow flex items-center justify-center bg-muted overflow-hidden group">
        <img src={gifUrl} alt={altText} className="object-contain w-full h-full" />

        {onSearchClick && !disabled && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer rounded-none"
            onClick={handleSearchOverlayClick}
            title="Change GIF"
          >
            <Icon iconId="faMagnifyingGlassLight" className="h-7 w-7 text-white" />
          </div>
        )}

        {showPauseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 bg-black/30 hover:bg-black/50 text-white h-6 w-6 p-0.5 z-10"
            onClick={handlePauseClick}
            title={isPaused ? 'Play GIF' : 'Pause GIF'}
            disabled={disabled}
            aria-label={isPaused ? 'Play GIF' : 'Pause GIF'}
          >
            <Icon iconId={isPaused ? 'faPlayLight' : 'faPauseLight'} className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
      <CardFooter className="p-0">
        <Button
          variant={isSelected ? 'default' : 'outline'}
          className="w-full rounded-t-none h-auto py-2.5 px-3 text-sm whitespace-normal text-center justify-center flex-grow"
          onClick={handleCardClick}
          disabled={disabled}
          title={disabled ? disabledTitle : optionText}
        >
          {optionText}
        </Button>
      </CardFooter>
    </Card>
  );
}
