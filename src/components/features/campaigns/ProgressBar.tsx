// Updated import paths via tree-shake script - 2025-04-01T17:13:32.218Z
'use client';

import React from 'react';
// Restore SidebarProvider import
import { useSidebar } from '@/providers/SidebarProvider';
// Removed unused SettingsPositionProvider import
// import { useSettingsPosition } from "@/providers/SettingsPositionProvider";
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils'; // Import cn if it wasn't already (it likely was)

export interface ProgressBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  onBack: (() => void) | null;
  onNext: () => void;
  onSaveDraft?: () => void;
  disableNext?: boolean;
  isFormValid?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

// Helper function to format the date
const formatLastSaved = (date: Date | null): string => {
  if (!date) return 'Not saved yet';

  // If saved less than a minute ago, show "Just now"
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) {
    return 'Just now';
  }

  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Format with hours and minutes
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const STEPS = [
  'Campaign Details',
  'Objectives & Messaging',
  'Target Audience',
  'Creative Assets',
  'Review',
];

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  onStepClick,
  onBack,
  onNext,
  onSaveDraft,
  disableNext = false,
  isFormValid = true,
  isDirty = true,
  isSaving = false,
  lastSaved = null,
}) => {
  // Restore sidebar hook
  const { isOpen: isSidebarOpen } = useSidebar();
  // Removed unused settings position hook
  // const { position } = useSettingsPosition();

  const isNextDisabled = disableNext || (!isFormValid && isDirty);

  // Removed progressBarHeight calculation
  // const progressBarHeight = ... ;

  console.log('ProgressBar State:', {
    currentStep,
    disableNext,
    isFormValid,
    isDirty,
    isNextDisabled,
  });

  return (
    <footer
      className={cn(
        'fixed bottom-0 border-t shadow z-40 flex justify-between items-center',
        'text-xs sm:text-sm md:text-base leading-none bg-background',
        'transition-all duration-300 ease-in-out font-body',
        'h-[var(--footer-height)]',
        // Default to full width starting at left-0
        'left-0 w-full',
        // On md+ screens, IF sidebar is open, adjust left and width
        isSidebarOpen && 'md:left-64 md:w-[calc(100%-16rem)]'
      )}
    >
      {/* Inner content needs relative positioning and width to work within the footer */}
      <div className="relative w-full h-full flex justify-between items-center">
        {/* Use h-full on step list container */}
        <ul className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap px-2 h-full flex-grow min-w-0 font-body">
          {STEPS.map((label, index) => {
            const stepNumber = index + 1;
            const status =
              stepNumber < currentStep
                ? 'completed'
                : stepNumber === currentStep
                  ? 'current'
                  : 'upcoming';

            return (
              <li
                key={index}
                className={`
                  flex items-center
                  transition-colors
                  duration-200
                  ${status !== 'upcoming' ? 'cursor-pointer' : 'cursor-default'} font-body`}
                onClick={() => {
                  if (status !== 'upcoming') {
                    onStepClick(stepNumber);
                  }
                }}
              >
                {status === 'completed' && (
                  <span className="mr-1 font-body" aria-hidden="true">
                    <Icon iconId="faCircleCheckSolid" className="h-4 w-4 text-success" />
                  </span>
                )}
                <span
                  className={`${status === 'current'
                    ? 'font-bold bg-accent px-2 py-0.5 rounded-full'
                    : status === 'upcoming'
                      ? 'text-muted-foreground'
                      : 'text-foreground'
                    } font-body`}
                  style={status === 'current' ? { color: 'hsl(var(--primary-foreground))' } : {}}
                >
                  {label}
                </span>
                {index < STEPS.length - 1 && (
                  <span className="mx-1 text-muted-foreground font-body">
                    <Icon iconId="faChevronRightLight" className="h-3 w-3" />
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {/* Use h-full on button container */}
        <div className="flex space-x-2 px-4 h-full items-center flex-shrink-0 font-body">
          {/* Last saved indicator */}
          {lastSaved && (
            <div className="text-xs text-muted-foreground mr-3 hidden md:flex items-center font-body">
              {isSaving ? (
                <span className="flex items-center font-body">
                  <Icon
                    iconId="faSpinnerLight"
                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-accent"
                  />
                  <span className="font-body">Saving...</span>
                </span>
              ) : (
                <span className="font-body">Last saved: {formatLastSaved(lastSaved)}</span>
              )}
            </div>
          )}

          {onBack && currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 bg-background border border-secondary text-secondary rounded-md hover:bg-muted/50 transition duration-200 flex items-center font-body"
            >
              <Icon iconId="faArrowLeftLight" className="h-3 w-3 mr-2" />
              Back
            </button>
          )}
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="px-3 py-1.5 bg-background border border-primary text-primary rounded-md hover:bg-muted/50 transition duration-200 flex items-center font-body"
            >
              <Icon iconId="faFloppyDiskLight" className="h-3 w-3 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            data-cy="next-button"
            className={`
              px-3 py-1.5 
              rounded-md
              transition duration-200
              flex items-center
              ${isNextDisabled
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-accent text-accent-foreground hover:opacity-90'
              } font-body`}
          >
            {currentStep < STEPS.length ? (
              <>
                Next
                <Icon iconId="faArrowRightLight" className="h-3 w-3 ml-2" />
              </>
            ) : (
              <>
                Submit Campaign
                <Icon iconId="faCheckLight" className="h-3 w-3 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default ProgressBar;
