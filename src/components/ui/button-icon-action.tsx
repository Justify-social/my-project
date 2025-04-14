/**
 * @component ButtonIconAction
 * @category atom
 * @subcategory button
 * @description An icon component that changes from a light to a solid icon on hover.
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
      className={cn('group hover:bg-transparent', className)}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <Icon iconId={iconId} className={iconClassName} />
    </Button>
  );
}
