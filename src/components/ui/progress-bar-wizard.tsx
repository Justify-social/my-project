/**
 * @component ProgressBarWizard
 * @category organism
 * @description A fixed footer progress bar for multi-step wizards, providing navigation.
 * Uses Shadcn UI Button, Badge.
 * @status 10th April
 */

'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

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
}

export function ProgressBarWizard({
    currentStep,
    steps,
    onStepClick,
    onBack,
    onNext,
    isNextDisabled = false,
    isNextLoading = false,
    submitButtonText = "Submit",
    className
}: ProgressBarWizardProps) {

    const totalSteps = steps.length;

    return (
        <footer
            className={cn(
                'sticky bottom-0 border-t bg-background shadow z-40 flex justify-between items-center',
                'h-[var(--footer-height)] w-full px-4 sm:px-6 font-body text-sm',
                className
            )}
            role="navigation"
            aria-label="Wizard progress"
        >
            {/* Steps Indicator (Left Side) */}
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 flex-grow min-w-0">
                {steps.map(({ number, label, isComplete: explicitComplete }) => {
                    // Determine completion status: explicitly passed or based on current step
                    const isCompleted = explicitComplete ?? (number < currentStep);
                    const isCurrent = number === currentStep;
                    const isUpcoming = number > currentStep;
                    // Allow clicking completed or current steps
                    const canClick = isCompleted || isCurrent;

                    return (
                        <div
                            key={number}
                            onClick={() => canClick && onStepClick(number)}
                            className={cn(
                                "flex items-center p-1 rounded-md transition-colors",
                                canClick ? 'cursor-pointer hover:bg-muted/50' : 'cursor-default opacity-50',
                            )}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            <Badge
                                variant={isCompleted ? 'default' : isCurrent ? 'secondary' : 'outline'}
                                className={cn(
                                    "h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center mr-1 sm:mr-2 text-xs sm:text-sm flex-shrink-0",
                                    isCompleted && "bg-green-600 border-green-600 text-white", // Consistent completed style
                                    isCurrent && "border-primary text-primary"
                                )}
                            >
                                {isCompleted ? <Icon iconId="faCheckSolid" className="h-2.5 w-2.5" /> : number}
                            </Badge>
                            <span className={cn(
                                "hidden sm:inline truncate",
                                isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'
                            )}>
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
                    variant="default"
                    size="sm"
                    onClick={onNext}
                    disabled={isNextDisabled || isNextLoading}
                    data-cy="wizard-next-button"
                >
                    {isNextLoading ? (
                        <Icon iconId="faSpinnerThirdLight" className="animate-spin mr-1.5 h-4 w-4" />
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
