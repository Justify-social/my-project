'use client';

import React from 'react';
import { useCampaignWizardContext } from '@/contexts/CampaignWizardContext';
import { Spinner } from '@/components/ui/spinner';

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
    hour12: true
  });
}

/**
 * Component that displays the autosave status in the wizard
 */
export function AutosaveIndicator() {
  const { 
    isAutosaving, 
    isDirty, 
    lastAutosave 
  } = useCampaignWizardContext();

  // If autosaving is in progress
  if (isAutosaving) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Spinner size="sm" className="mr-2" />
        <span>Saving changes...</span>
      </div>
    );
  }

  // If there are unsaved changes
  if (isDirty) {
    return (
      <div className="flex items-center text-sm text-amber-500">
        <span className="inline-block w-2 h-2 mr-2 bg-amber-500 rounded-full"></span>
        <span>Unsaved changes</span>
      </div>
    );
  }

  // If there was a recent autosave
  if (lastAutosave) {
    return (
      <div className="flex items-center text-sm text-green-600">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-4 h-4 mr-1" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>Saved at {formatTime(lastAutosave)}</span>
      </div>
    );
  }

  // Default state (no recent activity)
  return (
    <div className="flex items-center text-sm text-gray-400">
      <span>Autosave enabled</span>
    </div>
  );
}

export default AutosaveIndicator; 