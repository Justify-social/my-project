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
import { Button } from './button'; // Added Button for selectable area

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

  return (
    <Card
      className={cn(
        'overflow-hidden w-full flex flex-col',
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md',
        disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      onClick={handleCardClick}
      title={disabled ? disabledTitle : undefined}
    >
      <CardContent className="p-0 relative aspect-square flex-grow flex items-center justify-center bg-muted overflow-hidden">
        <img src={gifUrl} alt={altText} className="object-contain w-full h-full" />
        {showPauseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white h-7 w-7 p-1"
            onClick={handlePauseClick}
            title={isPaused ? 'Play GIF' : 'Pause GIF'}
            disabled={disabled}
            aria-label={isPaused ? 'Play GIF' : 'Pause GIF'}
          >
            <Icon iconId={isPaused ? 'faPlayLight' : 'faPauseLight'} className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
      <CardFooter className="p-0">
        <Button
          variant={isSelected ? 'default' : 'outline'}
          className="w-full rounded-t-none h-auto py-2.5 px-3 text-sm whitespace-normal text-center justify-center flex-grow"
          onClick={handleCardClick} // Ensure button also triggers the main onClick
          disabled={disabled}
          title={disabled ? disabledTitle : optionText}
        >
          {optionText}
        </Button>
      </CardFooter>
    </Card>
  );
}
