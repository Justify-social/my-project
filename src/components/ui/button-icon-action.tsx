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
  iconBaseName: string; // e.g., "faEye", "faPenToSquare"
  hoverColorClass: string; // e.g., "text-accent", "text-destructive"
  ariaLabel: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function IconButtonAction({
  iconBaseName,
  hoverColorClass,
  ariaLabel,
  className,
  onClick,
}: IconButtonActionProps) {
  const [isHovered, setIsHovered] = useState(false);

  const iconId = isHovered ? `${iconBaseName}Solid` : `${iconBaseName}Light`;
  const iconClassName = isHovered ? hoverColorClass : 'text-muted-foreground';

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
