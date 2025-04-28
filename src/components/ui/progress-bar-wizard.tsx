/**
 * @component ProgressBarWizard
 * @category organism
 * @description A fixed footer progress bar for multi-step wizards, providing navigation.
 * Uses Shadcn UI Button, Badge.
 * @status 10th April
 * @example
 * // Example usage for a 5-step campaign wizard:
 * <ProgressBarWizard
 *   currentStep={currentStep} // e.g., 1, 2, 3, 4, or 5
 *   steps={[
 *     { number: 1, label: 'Setup' },
 *     { number: 2, label: 'Targeting' },
 *     { number: 3, label: 'Creative' },
 *     { number: 4, label: 'Budget' },
 *     { number: 5, label: 'Review' }
 *   ]}
 *   onStepClick={(step) => handleStepChange(step)}
 *   onBack={currentStep > 1 ? () => setCurrentStep(currentStep - 1) : null}
 *   onNext={() => {
 *     if (currentStep < 5) setCurrentStep(currentStep + 1);
 *     else handleSubmit();
 *   }}
 *   isNextDisabled={!isStepValid(currentStep)}
 *   isNextLoading={isLoading}
 *   submitButtonText="Launch Campaign"
 * />
 */

'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import { toast } from 'react-hot-toast';

// Define the structure for each step passed in
export interface WizardStepConfig {
  number: number;
  label: string;
  isComplete?: boolean; // Optional: Parent can explicitly mark steps complete
}

export interface ProgressBarWizardProps {
  /** The currently active step number (1-based) */
  currentStep: number;
  /** Array defining the steps in the wizard */
  steps: WizardStepConfig[];
  /** Callback when a step indicator is clicked */
  onStepClick: (stepNumber: number) => void;
  /** Callback for the Back button (null if disabled/not shown) */
  onBack: (() => void) | null;
  /** Callback for the Next/Submit button */
  onNext: () => void;
  /** Whether the Next/Submit button should be disabled */
  isNextDisabled?: boolean;
  /** Whether the Next/Submit action is currently loading */
  isNextLoading?: boolean;
  /** Optional: Text for the final step's submit button (defaults to "Submit") */
  submitButtonText?: string;
  /** Optional: Add custom class names */
  className?: string;
  /** Function to get the current step's validated form data */
  getCurrentFormData?: () => unknown | null; // Changed any to unknown - NOW OPTIONAL
  onPrevious?: () => void; // Added for consistency
  canGoPrevious?: boolean; // Control previous button state
  isLoadingNext?: boolean; // Optional loading state for Next button
  onSave?: () => Promise<boolean>; // New prop for manual save action, returns success
}

export function ProgressBarWizard({
  currentStep,
  steps,
  onStepClick,
  onBack,
  onNext,
  isNextDisabled = false,
  isNextLoading = false,
  submitButtonText = 'Submit',
  getCurrentFormData,
  className,
  onPrevious,
  canGoPrevious = false,
  isLoadingNext = false,
  onSave,
}: ProgressBarWizardProps) {
  const totalSteps = steps.length;
  const wizard = useWizard();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      const success = await onSave();
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 md:left-[var(--sidebar-width)] bg-background shadow z-40 flex justify-between items-center border-t',
        'h-[65px] w-full md:w-[calc(100%-var(--sidebar-width))] px-4 sm:px-6 font-body text-sm',
        className
      )}
      role="navigation"
      aria-label="Wizard progress"
    >
      {/* Steps Indicator (Left Side) */}
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 flex-grow min-w-0">
        {steps.map(({ number, label, isComplete: explicitComplete }) => {
          // Determine completion status: explicitly passed or based on current step
          const isCompleted = explicitComplete ?? number < currentStep;
          const isCurrent = number === currentStep;
          const isUpcoming = number > currentStep;
          // Allow clicking completed or current steps
          const canClick = isCompleted || isCurrent;

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
                className={cn(
                  'h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center mr-1 sm:mr-2 text-xs sm:text-sm flex-shrink-0 rounded-full',
                  isCompleted && 'bg-success border-success text-success-foreground',
                  isCurrent && 'bg-primary border-primary text-primary-foreground',
                  isUpcoming &&
                    'border border-muted-foreground text-muted-foreground bg-transparent'
                )}
              >
                {isCompleted ? (
                  <span className="relative z-50">
                    <Icon
                      iconId="faCheckSolid"
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-success-foreground"
                    />
                  </span>
                ) : (
                  number
                )}
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
            disabled={isNextLoading || isSaving}
          >
            <Icon iconId="faArrowLeftLight" className="h-4 w-4 mr-1.5" /> Back
          </Button>
        )}
        {onSave && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveClick}
            disabled={isSaving || isNextLoading}
            title="Save current progress"
          >
            <Icon
              iconId={isSaving ? 'faCircleNotchLight' : 'faFloppyDiskLight'}
              className={cn('h-4 w-4 mr-1.5', isSaving && 'animate-spin')}
            />
            Save
          </Button>
        )}
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onNext}
          disabled={isNextDisabled || isNextLoading || isSaving}
          data-cy="wizard-next-button"
        >
          {isNextLoading ? (
            <Icon iconId="faCircleNotchLight" className="animate-spin mr-1.5 h-4 w-4" />
          ) : currentStep < totalSteps ? (
            <Icon iconId="faArrowRightLight" className="h-4 w-4 mr-1.5" />
          ) : (
            <Icon iconId="faPaperPlaneLight" className="h-4 w-4 mr-1.5" />
          )}
          {currentStep < totalSteps ? 'Next' : submitButtonText}
        </Button>
      </div>
    </footer>
  );
}
