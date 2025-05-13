// Updated import paths via tree-shake script - 2025-04-01T17:13:32.218Z
'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Wizard step configuration
const STEPS = [
  { number: 1, label: 'Details' }, // Shortened labels for potentially smaller screens
  { number: 2, label: 'Objectives' },
  { number: 3, label: 'Audience' },
  { number: 4, label: 'Assets' },
  { number: 5, label: 'Review' },
];

export interface ProgressBarProps {
  /** The currently active step number (1-based) */
  currentStep: number;
  /** Callback when a step indicator is clicked */
  onStepClick: (step: number) => void;
  /** Callback for the Back button (null if disabled/not shown) */
  onBack: (() => void) | null;
  /** Callback for the Next/Submit button */
  onNext: () => void;
  /** Whether the Next/Submit button should be disabled */
  isNextDisabled?: boolean;
  /** Whether the Next/Submit action is currently loading */
  isNextLoading?: boolean;
  /** Timestamp of the last successful save (passed to AutosaveIndicator, not used directly here) */
  lastSaved?: Date | null; // Keep prop for consistency if needed elsewhere
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  onStepClick,
  onBack,
  onNext,
  isNextDisabled = false,
  isNextLoading = false,
  // lastSaved prop is received but not directly used for display here
}) => {
  return (
    <footer
      className={cn(
        'sticky bottom-0 border-t bg-background shadow z-40 flex justify-between items-center',
        'h-[var(--footer-height)] w-full px-4 sm:px-6 font-body text-sm' // Use standard padding
      )}
    >
      {/* Steps Indicator (Left Side) */}
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 flex-grow min-w-0">
        {STEPS.map(({ number, label }) => {
          const isCompleted = number < currentStep;
          const isCurrent = number === currentStep;
          const isUpcoming = number > currentStep;
          const canClick = !isUpcoming;

          return (
            <div
              key={number}
              onClick={() => canClick && onStepClick(number)}
              className={cn(
                'flex items-center p-1 rounded-md transition-colors',
                canClick ? 'cursor-pointer hover:bg-muted/50' : 'cursor-default opacity-50'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <Badge
                variant={isCompleted ? 'default' : isCurrent ? 'secondary' : 'outline'}
                className={cn(
                  'h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center mr-1 sm:mr-2 text-xs sm:text-sm flex-shrink-0',
                  isCompleted && 'bg-green-600 border-green-600 text-white',
                  isCurrent && 'border-primary text-primary'
                )}
              >
                {isCompleted ? <Icon iconId="faCheckSolid" className="h-2.5 w-2.5" /> : number}
              </Badge>
              <span
                className={cn(
                  'hidden sm:inline truncate',
                  isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Action Buttons (Right Side) */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {onBack && currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            disabled={isNextLoading} // Disable back if next is loading
          >
            <Icon iconId="faArrowLeftLight" className="h-4 w-4 mr-1.5" /> Back
          </Button>
        )}
        <Button
          type="button"
          variant="default" // Use default variant for primary action
          size="sm"
          onClick={onNext}
          disabled={isNextDisabled || isNextLoading}
          data-cy="next-button"
        >
          {isNextLoading ? (
            <Icon iconId="faSpinnerThirdLight" className="animate-spin mr-1.5 h-4 w-4" />
          ) : currentStep < STEPS.length ? (
            <Icon iconId="faArrowRightLight" className="h-4 w-4 mr-1.5" />
          ) : (
            <Icon iconId="faPaperPlaneLight" className="h-4 w-4 mr-1.5" /> // Submit icon
          )}
          {currentStep < STEPS.length ? 'Next' : 'Submit'}
        </Button>
      </div>
    </footer>
  );
};

export default ProgressBar;
