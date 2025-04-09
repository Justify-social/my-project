/**
 * @component SectionHeader
 * @category atom
 * @description A section header component for displaying a title, optional description, and optional icon.
 * @param {SectionHeaderProps} props - The props for the SectionHeader component.
 * @param {string} props.title - The main title text for the section.
 * @param {string} [props.description] - Optional descriptive text below the title.
 * @param {string} [props.iconId] - Optional ID for an icon to display next to the title (uses the Icon component).
 * @param {string} [props.className] - Additional CSS classes for the main container div.
 * @param {string} [props.titleClassName] - Additional CSS classes for the title (h2) element.
 * @param {string} [props.descriptionClassName] - Additional CSS classes for the description (p) element.
 * @param {string} [props.iconClassName] - Additional CSS classes for the Icon component.
 * @returns {React.ReactElement} The rendered section header.
 */

'use client';

import React from 'react';
// Assuming IconProps might be needed later or for stricter Icon typing
import { Icon, IconProps } from '@/components/ui/icon';
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    description?: string;
    iconId?: string; // Use iconId consistent with Icon component
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    iconClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    description,
    iconId,
    className,
    titleClassName,
    descriptionClassName,
    iconClassName
}) => {
    return (
        <div className={cn("mb-6 flex items-start space-x-3", className)}>
            {iconId && (
                <div className="flex-shrink-0 mt-1">
                    <Icon
                        iconId={iconId}
                        // Use semantic color, allow override via iconClassName
                        className={cn("h-6 w-6 text-secondary", iconClassName)}
                        aria-hidden="true"
                    />
                </div>
            )}
            <div>
                {/* Use semantic color, rely on global font config, allow override */}
                <h2 className={cn("text-lg font-semibold text-primary", titleClassName)}>
                    {title}
                </h2>
                {description && (
                    // Use semantic color, rely on global font config, allow override
                    <p className={cn("mt-1 text-sm text-muted-foreground", descriptionClassName)}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}; 