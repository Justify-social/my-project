"use client";

import React from "react";
import { useSidebar } from "@/providers/SidebarProvider";
import { useSettingsPosition } from "@/providers/SettingsPositionProvider";

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
  "Campaign Details",
  "Objectives & Messaging",
  "Target Audience",
  "Creative Assets",
  "Review"
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
  const { isOpen } = useSidebar();
  const { position } = useSettingsPosition();

  const isNextDisabled = disableNext || (!isFormValid && isDirty);

  console.log('ProgressBar State:', {
    currentStep,
    disableNext,
    isFormValid,
    isDirty,
    isNextDisabled
  });

  const progressBarHeight = position.topOffset
    ? Math.max(65, position.topOffset)
    : 65;

  return (
    <footer
      className={`
        fixed
        bottom-0
        left-0
        w-full
        border-t
        border-gray-300
        shadow
        z-40
        flex
        justify-between
        items-center
        text-[10px] sm:text-xs md:text-sm
        leading-none
        bg-white
        transition-all
        duration-300
        ease-in-out
        ${isOpen ? 'md:w-[calc(100%-12rem)] md:left-[12rem] lg:w-[calc(100%-16rem)] lg:left-[16rem]' : ''}
      `}
      style={{
        height: `${progressBarHeight}px`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[65px] flex justify-between items-center">
        <ul className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap px-2 h-full flex-grow min-w-0">
          {STEPS.map((label, index) => {
            const stepNumber = index + 1;
            const status = 
              stepNumber < currentStep ? "completed" :
              stepNumber === currentStep ? "current" : "upcoming";

            return (
              <li
                key={index}
                className={`
                  flex items-center
                  transition-colors
                  duration-200
                  ${status !== "upcoming" ? "cursor-pointer" : "cursor-default"}
                `}
                onClick={() => {
                  if (status !== "upcoming") {
                    onStepClick(stepNumber);
                  }
                }}
              >
                {status === "completed" && (
                  <span className="mr-1 text-green-600 font-bold" aria-hidden="true">
                    ✓
                  </span>
                )}
                <span
                  className={
                    status === "current"
                      ? "font-bold text-blue-600 underline"
                      : status === "upcoming"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }
                >
                  {label}
                </span>
                {index < STEPS.length - 1 && <span className="mx-1 text-gray-500">→</span>}
              </li>
            );
          })}
        </ul>

        <div className="flex space-x-2 px-4 h-full items-center flex-shrink-0">
          {/* Last saved indicator */}
          {lastSaved && (
            <div className="text-xs text-gray-500 mr-3 hidden md:flex items-center">
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </span>
              ) : (
                <span>Last saved: {formatLastSaved(lastSaved)}</span>
              )}
            </div>
          )}
          
          {onBack && currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
            >
              Back
            </button>
          )}
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition duration-200"
            >
              {isSaving ? "Saving..." : "Save as Draft"}
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            data-cy="next-button"
            className={`
              px-3 py-1 
              rounded 
              transition duration-200 
              ${isNextDisabled 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {currentStep < STEPS.length ? "Next" : "Submit Campaign"}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default ProgressBar;
