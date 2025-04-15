/**
 * @component AutosaveIndicator
 * @category molecule
 * @description Displays the status of an autosave operation.
 * Uses FontAwesome icons and accepts status props.
 * @status 10th April
 */

'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils';

// Define possible statuses for the indicator
export type AutosaveStatus = 'idle' | 'saving' | 'success' | 'error' | 'syncing';

interface AutosaveIndicatorProps {
    /** Current autosave status */
    status: AutosaveStatus;
    /** Timestamp of the last successful save */
    lastSaved?: Date | null;
    /** Optional error message to display */
    errorMessage?: string;
    /** Additional CSS classes */
    className?: string;
}

// Helper to format time
function formatTime(date: Date): string {
    return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        // second: '2-digit', // Keep it simple
        hour12: true,
    });
}

export function AutosaveIndicator({ status, lastSaved, errorMessage, className }: AutosaveIndicatorProps) {

    let iconId: string | null = null;
    let text: React.ReactNode = null;
    let colorClasses = "text-muted-foreground"; // Default grey

    switch (status) {
        case 'saving':
        case 'syncing': // Treat syncing visually same as saving
            iconId = "faSpinnerThirdLight";
            text = "Saving...";
            colorClasses = "text-blue-600"; // Or interactive blue
            break;
        case 'success':
            iconId = "faFloppyDiskSolid";
            text = lastSaved ? `Saved ${formatTime(lastSaved)}` : "Saved";
            colorClasses = "text-green-700 bg-green-50 border border-green-500 rounded-md px-3 py-1";
            break;
        case 'error':
            iconId = "faExclamationTriangleLight";
            text = errorMessage || "Save failed";
            colorClasses = "text-destructive";
            break;
        case 'idle':
        default:
            // Show last saved time if idle and available
            if (lastSaved) {
                iconId = "faCheckCircleLight"; // Lighter check for idle but saved state
                text = `Saved ${formatTime(lastSaved)}`;
                colorClasses = "text-muted-foreground";
            } else {
                // Optional: Show nothing or a generic message when truly idle with no save history
                // iconId = "faCloudLight";
                // text = "Autosave enabled";
                return null; // Render nothing if idle and never saved
            }
            break;
    }

    // Conditionally apply base padding/styling unless it's success/error which have specific styles
    const baseClasses = "flex items-center text-xs font-medium";
    const conditionalClasses = status === 'success' || status === 'error'
        ? colorClasses // Success/Error have self-contained styles
        : `${baseClasses} ${colorClasses}`; // Idle/Saving apply color to base

    return (
        <div
            className={cn(conditionalClasses, className)} // Use combined classes
            role="status"
            aria-live="polite" // Announce changes politely
            aria-atomic="true"
        >
            {iconId && <Icon iconId={iconId} className={cn("mr-1.5 h-3.5 w-3.5", status === 'saving' || status === 'syncing' ? 'animate-spin' : '')} />}
            <span>{text}</span>
        </div>
    );
} 