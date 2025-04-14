// Updated import paths via tree-shake script - 2025-04-01T17:13:32.220Z
'use client';

import React from 'react';
import { useCampaignWizardContext } from '@/components/features/campaigns/CampaignWizardContext';
import { AutosaveIndicator } from '@/components/features/campaigns/AutosaveIndicator';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/icon/icon';

interface WizardNavigationProps {
  className?: string;
}

/**
 * Navigation component for the wizard that shows progress and step controls
 */
export function WizardNavigation({ className }: WizardNavigationProps) {
  const {
    currentStep,
    isFirstStep,
    isLastStep,
    isSaving,
    isLoading,
    goToNextStep,
    goToPreviousStep,
    saveAsDraft,
    submitCampaign,
    progress,
  } = useCampaignWizardContext();

  // Step titles
  const stepTitles = [
    'Campaign Overview',
    'Campaign Objectives',
    'Target Audience',
    'Creative Assets',
  ];

  return (
    <div className={`${cn('w-full', className)} font-body`}>
      {/* Progress bar */}
      <div className="w-full h-2 mb-4 bg-muted rounded-full font-body">
        <div
          className="h-2 transition-all duration-300 ease-in-out bg-accent rounded-full font-body"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6 font-body">
        {[1, 2, 3, 4].map(step => (
          <div key={step} className="flex flex-col items-center font-body">
            <div
              className={`${cn(
                'flex items-center justify-center w-8 h-8 mb-2 text-sm font-medium border-2 rounded-full',
                step === currentStep
                  ? 'border-accent bg-accent text-accent-foreground'
                  : step < currentStep
                    ? 'border-accent bg-background text-accent'
                    : 'border text-muted-foreground'
              )} font-body`}
            >
              {step < currentStep ? (
                <Icon iconId="faCheckCircleSolid" className="w-5 h-5 text-success" />
              ) : (
                step
              )}
            </div>
            <span
              className={`${cn(
                'text-xs font-medium',
                step === currentStep
                  ? 'text-accent'
                  : step < currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground'
              )} font-body`}
            >
              {stepTitles[step - 1]}
            </span>
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between pt-4 mt-6 border-t font-body">
        <div className="flex items-center space-x-4 font-body">
          {/* Back button */}
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={isFirstStep || isLoading || isSaving}
            className={`${cn(
              'px-4 py-2 text-sm font-medium border rounded-md flex items-center',
              isFirstStep
                ? 'border bg-muted text-muted-foreground cursor-not-allowed'
                : 'border-secondary bg-background text-secondary hover:bg-muted/50'
            )} font-body`}
          >
            <Icon iconId="faArrowLeftLight" className="w-4 h-4 mr-2" />
            Previous
          </button>

          {/* Save as draft button */}
          <button
            type="button"
            onClick={saveAsDraft}
            disabled={isLoading || isSaving}
            className="px-4 py-2 text-sm font-medium text-primary bg-background border border-primary rounded-md hover:bg-muted/50 flex items-center font-body"
          >
            <Icon iconId="faFloppyDiskLight" className="w-4 h-4 mr-2" />
            Save Draft
          </button>
        </div>

        <div className="flex items-center space-x-4 font-body">
          {/* Autosave indicator */}
          <AutosaveIndicator />

          {/* Next/Submit button */}
          <button
            type="button"
            onClick={isLastStep ? submitCampaign : goToNextStep}
            disabled={isLoading || isSaving}
            className={`${cn(
              'px-4 py-2 text-sm font-medium text-accent-foreground rounded-md flex items-center',
              isLoading || isSaving
                ? 'bg-accent/70 cursor-not-allowed'
                : 'bg-accent hover:opacity-90'
            )} font-body`}
          >
            {isLoading || isSaving ? (
              <span className="flex items-center font-body">
                <Icon iconId="faCircleNotchLight" className="w-4 h-4 mr-2 animate-spin" />
                {isLastStep ? 'Submitting...' : 'Saving...'}
              </span>
            ) : isLastStep ? (
              <>
                Submit Campaign
                <Icon iconId="faCheckLight" className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next Step
                <Icon iconId="faArrowRightLight" className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WizardNavigation;
