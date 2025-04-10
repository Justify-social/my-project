'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface IconButtonActionProps {
    iconBaseName: string; // e.g., "faEye", "faPenToSquare"
    hoverColorClass: string; // e.g., "text-accent", "text-destructive"
    ariaLabel: string;
    className?: string;
}

export function IconButtonAction({
    iconBaseName,
    hoverColorClass,
    ariaLabel,
    className
}: IconButtonActionProps) {
    const [isHovered, setIsHovered] = useState(false);

    const iconId = isHovered ? `${iconBaseName}Solid` : `${iconBaseName}Light`;
    const iconClassName = isHovered ? hoverColorClass : 'text-muted-foreground';

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("group hover:bg-transparent", className)}
            aria-label={ariaLabel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Icon iconId={iconId} className={iconClassName} />
        </Button>
    );
} 