"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SurveyProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  estimatedTimeRemaining?: number; // in minutes
}

export default function SurveyProgressBar({
  currentStep,
  totalSteps,
  onStepClick,
  estimatedTimeRemaining
}: SurveyProgressBarProps) {
  const progressPercentage = Math.round(currentStep / (totalSteps - 1) * 100);

  return (
    <div className="mb-6 font-work-sans">
      <div className="flex justify-between items-center mb-2 font-work-sans">
        <div className="text-sm font-medium text-gray-700 font-work-sans">
          Progress: {progressPercentage}%
        </div>
        {estimatedTimeRemaining !== undefined &&
        <div className="text-sm text-gray-500 font-work-sans">
            ~{estimatedTimeRemaining} min remaining
          </div>
        }
      </div>
      
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden font-work-sans">
        <motion.div
          className="absolute top-0 left-0 h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }} />

      </div>
      
      <div className="flex justify-between mt-2 font-work-sans">
        {Array.from({ length: totalSteps }).map((_, index) =>
        <div
          key={index}
          className="flex flex-col items-center font-work-sans"
          onClick={() => onStepClick && onStepClick(index)}>

            <motion.div
            className={`w-3 h-3 rounded-full cursor-pointer ${
            index < currentStep ?
            'bg-blue-500' :
            index === currentStep ?
            'bg-blue-600 ring-2 ring-blue-200' :
            'bg-gray-300'}`
            }
            whileHover={onStepClick ? { scale: 1.2 } : {}}
            whileTap={onStepClick ? { scale: 0.9 } : {}}
            animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
            transition={index === currentStep ? {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5
            } : {}} />

            {totalSteps <= 10 &&
          <span className="text-xs mt-1 text-gray-500 font-work-sans">
                {index + 1}
              </span>
          }
          </div>
        )}
      </div>
    </div>);

}