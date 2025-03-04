'use client';

import React from 'react';
import { useCampaignWizardContext } from '@/contexts/CampaignWizardContext';
import { AutosaveIndicator } from './AutosaveIndicator';
import { cn } from '@/lib/utils';

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
    progress
  } = useCampaignWizardContext();

  // Step titles
  const stepTitles = [
    'Campaign Overview',
    'Campaign Objectives',
    'Target Audience',
    'Creative Assets'
  ];

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="w-full h-2 mb-4 bg-gray-200 rounded-full">
        <div
          className="h-2 transition-all duration-300 ease-in-out bg-primary rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 mb-2 text-sm font-medium border-2 rounded-full',
                step === currentStep
                  ? 'border-primary bg-primary text-white'
                  : step < currentStep
                  ? 'border-primary bg-white text-primary'
                  : 'border-gray-300 bg-white text-gray-400'
              )}
            >
              {step < currentStep ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step
              )}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                step === currentStep
                  ? 'text-primary'
                  : step < currentStep
                  ? 'text-gray-700'
                  : 'text-gray-400'
              )}
            >
              {stepTitles[step - 1]}
            </span>
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Back button */}
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={isFirstStep || isLoading || isSaving}
            className={cn(
              'px-4 py-2 text-sm font-medium border rounded-md',
              isFirstStep
                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            Previous
          </button>

          {/* Save as draft button */}
          <button
            type="button"
            onClick={saveAsDraft}
            disabled={isLoading || isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Save as Draft
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Autosave indicator */}
          <AutosaveIndicator />

          {/* Next/Submit button */}
          <button
            type="button"
            onClick={isLastStep ? submitCampaign : goToNextStep}
            disabled={isLoading || isSaving}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-md',
              isLoading || isSaving
                ? 'bg-primary/70 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            )}
          >
            {isLoading || isSaving ? (
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isLastStep ? 'Submitting...' : 'Saving...'}
              </span>
            ) : isLastStep ? (
              'Submit Campaign'
            ) : (
              'Next Step'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WizardNavigation; 