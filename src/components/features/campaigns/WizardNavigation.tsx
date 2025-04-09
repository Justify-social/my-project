// Updated import paths via tree-shake script - 2025-04-01T17:13:32.220Z
'use client';

import React from 'react';
import { useCampaignWizardContext } from '@/components/features/campaigns/CampaignWizardContext';
import { AutosaveIndicator } from '@/components/features/campaigns/AutosaveIndicator';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/icon'

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
    'Creative Assets'];


  return (
    <div className={`${cn('w-full', className)} font-work-sans`}>
      {/* Progress bar */}
      <div className="w-full h-2 mb-4 bg-gray-200 rounded-full font-work-sans">
        <div
          className="h-2 transition-all duration-300 ease-in-out bg-[var(--accent-color)] rounded-full font-work-sans"
          style={{ width: `${progress}%` }} />

      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6 font-work-sans">
        {[1, 2, 3, 4].map((step) =>
          <div key={step} className="flex flex-col items-center font-work-sans">
            <div
              className={`${cn(
                'flex items-center justify-center w-8 h-8 mb-2 text-sm font-medium border-2 rounded-full',
                step === currentStep ?
                  'border-[var(--accent-color)] bg-[var(--accent-color)] text-white' :
                  step < currentStep ?
                    'border-[var(--accent-color)] bg-white text-[var(--accent-color)]' :
                    'border-gray-300 bg-white text-gray-400'
              )} font-work-sans`}>

              {step < currentStep ?
                <Icon iconId="faCheckCircleSolid" className="w-5 h-5 text-green-500 font-work-sans" /> :

                step
              }
            </div>
            <span
              className={`${cn(
                'text-xs font-medium',
                step === currentStep ?
                  'text-[var(--accent-color)]' :
                  step < currentStep ?
                    'text-[var(--primary-color)]' :
                    'text-gray-400'
              )} font-work-sans`}>

              {stepTitles[step - 1]}
            </span>
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200 font-work-sans">
        <div className="flex items-center space-x-4 font-work-sans">
          {/* Back button */}
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={isFirstStep || isLoading || isSaving}
            className={`${cn(
              'px-4 py-2 text-sm font-medium border rounded-md flex items-center',
              isFirstStep ?
                'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' :
                'border-[var(--secondary-color)] bg-white text-[var(--secondary-color)] hover:bg-gray-50'
            )} font-work-sans`}>

            <Icon iconId="faArrowLeftLight" className="w-4 h-4 mr-2" />
            Previous
          </button>

          {/* Save as draft button */}
          <button
            type="button"
            onClick={saveAsDraft}
            disabled={isLoading || isSaving}
            className="px-4 py-2 text-sm font-medium text-[var(--primary-color)] bg-white border border-[var(--primary-color)] rounded-md hover:bg-gray-50 flex items-center font-work-sans">

            <Icon iconId="faFloppyDiskLight" className="w-4 h-4 mr-2" />
            Save Draft
          </button>
        </div>

        <div className="flex items-center space-x-4 font-work-sans">
          {/* Autosave indicator */}
          <AutosaveIndicator />

          {/* Next/Submit button */}
          <button
            type="button"
            onClick={isLastStep ? submitCampaign : goToNextStep}
            disabled={isLoading || isSaving}
            className={`${cn(
              'px-4 py-2 text-sm font-medium text-white rounded-md flex items-center',
              isLoading || isSaving ?
                'bg-[var(--accent-color)] opacity-70 cursor-not-allowed' :
                'bg-[var(--accent-color)] hover:opacity-90'
            )} font-work-sans`}>

            {isLoading || isSaving ?
              <span className="flex items-center font-work-sans">
                <Icon iconId="faCircleNotchLight" className="w-4 h-4 mr-2 animate-spin" />
                {isLastStep ? 'Submitting...' : 'Saving...'}
              </span> :
              isLastStep ?
                <>
                  Submit Campaign
                  <Icon iconId="faCheckLight" className="w-4 h-4 ml-2" />
                </> :

                <>
                  Next Step
                  <Icon iconId="faArrowRightLight" className="w-4 h-4 ml-2" />
                </>
            }
          </button>
        </div>
      </div>
    </div>);

}

export default WizardNavigation;