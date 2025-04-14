'use client';

import React from 'react';
import { useCampaignWizardContext } from '@/components/features/campaigns/CampaignWizardContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icon } from '@/components/ui/icon/icon';

/**
 * Formats a date to a readable time string
 * @param date The date to format
 * @returns A formatted time string (e.g., "2:30:45 PM")
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Component that displays the autosave status in the wizard
 */
export function AutosaveIndicator() {
  const { isAutosaving, isDirty, lastAutosave } = useCampaignWizardContext();

  // If autosaving is in progress
  if (isAutosaving) {
    return (
      <div className="flex items-center text-sm text-gray-500 font-body">
        <LoadingSpinner size="sm" className="mr-2" />
        <span className="font-body">Saving changes...</span>
      </div>
    );
  }

  // If there are unsaved changes
  if (isDirty) {
    return (
      <div className="flex items-center text-sm text-amber-500 font-body">
        <span className="inline-block w-2 h-2 mr-2 bg-amber-500 rounded-full font-body"></span>
        <span className="font-body">Unsaved changes</span>
      </div>
    );
  }

  // If there was a recent autosave
  if (lastAutosave) {
    return (
      <div className="flex items-center text-sm text-success font-body">
        <Icon iconId="faCheckCircleSolid" className="w-4 h-4 mr-1" />
        <span className="font-body">Saved at {formatTime(lastAutosave)}</span>
      </div>
    );
  }

  // Default state (no recent activity)
  return (
    <div className="flex items-center text-sm text-gray-400 font-body">
      <span className="font-body">Autosave enabled</span>
    </div>
  );
}

export default AutosaveIndicator;
