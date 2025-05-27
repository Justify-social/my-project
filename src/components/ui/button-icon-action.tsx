/**
 * @component ButtonIconAction
 * @category atom
 * @subcategory button
 * @description A specialized button component displaying only an icon that changes state (e.g., light to solid variant) on hover.
 * Ideal for action icons in tables or lists. Leverages the base Button component with specific styling and behavior.
 * Use this instead of the standard Button component when an icon-only button with this hover effect is required.
 * @status 10th April
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils';

interface IconButtonActionProps {
  iconBaseName: string; // e.g., "faEye", "faPenToSquare", "faBell", "faCoins"
  hoverColorClass: string; // e.g., "text-accent", "text-destructive"
  ariaLabel: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  inverted?: boolean; // When true: solid → light on hover (default: light → solid)
  defaultColorClass?: string; // Default color class (defaults to "text-muted-foreground")
  staysSolid?: boolean; // When true: always use solid icon, only change color on hover
}

export function IconButtonAction({
  iconBaseName,
  hoverColorClass,
  ariaLabel,
  className,
  onClick,
  inverted = false,
  defaultColorClass = 'text-muted-foreground',
  staysSolid = false,
}: IconButtonActionProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine icon variant based on props
  let iconId: string;
  if (staysSolid) {
    // Always use solid icon, only change color on hover
    iconId = `${iconBaseName}Solid`;
  } else if (inverted) {
    // Inverted behavior: solid → light on hover
    iconId = isHovered ? `${iconBaseName}Light` : `${iconBaseName}Solid`;
  } else {
    // Normal behavior: light → solid on hover
    iconId = isHovered ? `${iconBaseName}Solid` : `${iconBaseName}Light`;
  }

  const iconClassName = isHovered ? hoverColorClass : defaultColorClass;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('hover:bg-transparent', className)}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <Icon iconId={iconId} className={iconClassName} />
    </Button>
  );
}
