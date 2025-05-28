/**
 * @component RemovableBadge
 * @category atom
 * @subcategory display
 * @description A beautiful removable badge with Apple/Shopify-inspired design, matching the KPI badge aesthetic.
 * Provides consistent styling throughout the application with excellent UX.
 * @status Ready for Production
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';

const removableBadgeVariants = cva(
    'inline-flex items-center justify-between gap-2 font-medium transition-all duration-200 hover:shadow-sm focus-within:ring-2 focus-within:ring-offset-1 focus-within:outline-none',
    {
        variants: {
            variant: {
                // Primary style (matches KPI primary badges) - Deep Sky Blue theme
                primary: 'bg-accent/15 border-accent/30 text-accent border hover:bg-accent/20',

                // Secondary style (matches KPI secondary badges) - Softer blue
                secondary: 'bg-accent/10 border-accent/20 text-accent border hover:bg-accent/15',

                // Jet style - Using primary brand color for high contrast
                jet: 'bg-primary/10 border-primary/20 text-primary border hover:bg-primary/15',

                // Payne's Grey style - Sophisticated neutral
                grey: 'bg-secondary/10 border-secondary/20 text-secondary border hover:bg-secondary/15',

                // Success style for positive actions
                success: 'bg-success/10 border-success/20 text-success border hover:bg-success/15',

                // Warning style for caution
                warning: 'bg-warning/10 border-warning/20 text-warning border hover:bg-warning/15',

                // Destructive style for removals
                destructive: 'bg-destructive/10 border-destructive/20 text-destructive border hover:bg-destructive/15',
            },
            size: {
                sm: 'text-xs px-2 py-1 rounded-lg',         // More compact
                md: 'text-sm px-2.5 py-1.5 rounded-xl',     // Reduced padding for sleeker look
                lg: 'text-base px-3 py-2 rounded-xl',       // Still compact but readable
            },
        },
        defaultVariants: {
            variant: 'secondary',
            size: 'md',
        },
    }
);

export interface RemovableBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof removableBadgeVariants> {
    /** The text content of the badge */
    children: React.ReactNode;
    /** Function called when the remove button is clicked */
    onRemove?: () => void;
    /** Whether the remove button is disabled */
    removeDisabled?: boolean;
    /** Accessible label for the remove button */
    removeAriaLabel?: string;
    /** Custom icon for the remove button */
    removeIcon?: string;
}

function RemovableBadge({
    className,
    variant,
    size,
    children,
    onRemove,
    removeDisabled = false,
    removeAriaLabel,
    removeIcon = 'faXmarkLight',
    ...props
}: RemovableBadgeProps) {
    const badgeClasses = cn(removableBadgeVariants({ variant, size }), className);

    const removeClasses = cn(
        'flex-shrink-0 rounded-full transition-all duration-150 hover:bg-current/15 focus:bg-current/20 focus:outline-none p-0.5',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
    );

    // Generate accessible label for remove button
    const ariaLabel = removeAriaLabel || `Remove ${typeof children === 'string' ? children : 'item'}`;

    return (
        <div className={badgeClasses} {...props}>
            <span className="truncate flex-1 min-w-0">{children}</span>
            {onRemove && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={removeClasses}
                    onClick={onRemove}
                    disabled={removeDisabled}
                    aria-label={ariaLabel}
                    tabIndex={0}
                >
                    <Icon
                        iconId={removeIcon}
                        className={cn(
                            'transition-transform duration-150 hover:scale-110',
                            size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-4 w-4' : 'h-4 w-4'
                        )}
                    />
                </Button>
            )}
        </div>
    );
}

export { RemovableBadge, removableBadgeVariants }; 