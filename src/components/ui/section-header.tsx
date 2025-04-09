
/**
 * @component SectionHeader
 * @category atom
 * @description A section header component for displaying a title and description
 */

'use client';

import React from 'react';
import { Icon, IconProps } from '@/components/ui/icon'; // Assuming IconProps is exported
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
                        className={cn("h-6 w-6 text-[var(--secondary-color)]", iconClassName)}
                        aria-hidden="true"
                    />
                </div>
            )}
            <div>
                <h2 className={cn("text-lg font-semibold text-[var(--primary-color)] font-sora", titleClassName)}>
                    {title}
                </h2>
                {description && (
                    <p className={cn("mt-1 text-sm text-[var(--secondary-color)] font-work-sans", descriptionClassName)}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SectionHeader; 