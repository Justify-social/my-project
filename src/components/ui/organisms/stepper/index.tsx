import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Step, StepperProps, StepStatus } from './types';

const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onStepChange,
  allowStepBack = true,
  allowSkipAhead = false,
  showProgress = false,
  completedSteps,
  errorSteps,
  variant = 'horizontal',
  layout = 'default',
  className,
  stepClassName,
  connectorClassName,
  activeStepClassName,
  completedStepClassName,
  errorStepClassName,
  renderStepIcon,
  labels = {
    next: 'Next',
    previous: 'Back',
    finish: 'Finish',
    skip: 'Skip',
  },
  showNavigation = true,
  disabled = false,
}) => {
  const [internalActiveStep, setInternalActiveStep] = useState(activeStep);

  // Sync internal state with prop
  useEffect(() => {
    setInternalActiveStep(activeStep);
  }, [activeStep]);

  // Calculate step status
  const getStepStatus = (stepIndex: number): StepStatus => {
    if (errorSteps && errorSteps[stepIndex]) {
      return 'error';
    }
    if (completedSteps && completedSteps[stepIndex]) {
      return 'complete';
    }
    if (stepIndex === internalActiveStep) {
      return 'current';
    }
    return 'incomplete';
  };

  // Handle step click
  const handleStepClick = (stepIndex: number) => {
    if (disabled) return;
    
    const isStepCompleted = completedSteps ? completedSteps[stepIndex] : stepIndex < internalActiveStep;
    
    // Can only go back if allowStepBack is true
    if (stepIndex < internalActiveStep && !allowStepBack) {
      return;
    }
    
    // Can only go forward to completed steps if allowSkipAhead is true
    if (stepIndex > internalActiveStep && !isStepCompleted && !allowSkipAhead) {
      return;
    }
    
    setInternalActiveStep(stepIndex);
    if (onStepChange) {
      onStepChange(stepIndex);
    }
  };

  // Handle next button click
  const handleNext = async () => {
    if (disabled) return;

    const currentStep = steps[internalActiveStep];
    
    // If the current step has a validation function, run it
    if (currentStep.validate) {
      const isValid = await currentStep.validate();
      if (!isValid) return;
    }
    
    if (internalActiveStep < steps.length - 1) {
      setInternalActiveStep(internalActiveStep + 1);
      if (onStepChange) {
        onStepChange(internalActiveStep + 1);
      }
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (disabled || !allowStepBack || internalActiveStep === 0) return;
    
    setInternalActiveStep(internalActiveStep - 1);
    if (onStepChange) {
      onStepChange(internalActiveStep - 1);
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.round(((internalActiveStep) / (steps.length - 1)) * 100);

  // Default step icon renderer
  const defaultRenderStepIcon = (step: Step, status: StepStatus, index: number) => {
    if (layout === 'numbered') {
      return <div className="stepper-step-number">{index + 1}</div>;
    }

    if (status === 'complete') {
      return <i className="fa-solid fa-check"></i>;
    }
    
    if (status === 'error') {
      return <i className="fa-solid fa-exclamation"></i>;
    }
    
    if (step.icon) {
      return <i className={`fa-light ${step.icon}`}></i>;
    }
    
    return <div className="stepper-step-circle"></div>;
  };

  const rootClasses = classNames(
    'stepper',
    `stepper-${variant}`,
    `stepper-${layout}`,
    { 'stepper-disabled': disabled },
    className
  );

  return (
    <div className={rootClasses}>
      {showProgress && (
        <div className="stepper-progress">
          <div className="stepper-progress-label">Progress: {progressPercentage}%</div>
          <div className="stepper-progress-bar">
            <div 
              className="stepper-progress-bar-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className={`stepper-steps stepper-steps-${variant}`}>
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          const isActive = index === internalActiveStep;
          const isCompleted = stepStatus === 'complete';
          const hasError = stepStatus === 'error';
          
          const stepClasses = classNames(
            'stepper-step',
            {
              'stepper-step-active': isActive,
              'stepper-step-completed': isCompleted,
              'stepper-step-error': hasError,
              'stepper-step-clickable': allowStepBack || (allowSkipAhead && isCompleted),
              'stepper-step-optional': step.optional,
            },
            isActive ? activeStepClassName : '',
            isCompleted ? completedStepClassName : '',
            hasError ? errorStepClassName : '',
            stepClassName,
          );

          return (
            <React.Fragment key={step.id}>
              <div 
                className={stepClasses} 
                onClick={() => handleStepClick(index)}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className="stepper-step-icon">
                  {renderStepIcon 
                    ? renderStepIcon(step, stepStatus, index) 
                    : defaultRenderStepIcon(step, stepStatus, index)
                  }
                </div>
                <div className="stepper-step-content">
                  <div className="stepper-step-label">{step.label}</div>
                  {step.description && (
                    <div className="stepper-step-description">{step.description}</div>
                  )}
                  {step.optional && (
                    <div className="stepper-step-optional-label">(Optional)</div>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className={classNames('stepper-connector', connectorClassName)}>
                  <div 
                    className={classNames(
                      'stepper-connector-line',
                      { 'stepper-connector-completed': index < internalActiveStep }
                    )}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {steps[internalActiveStep]?.content && (
        <div className="stepper-content">
          {steps[internalActiveStep].content}
        </div>
      )}

      {showNavigation && (
        <div className="stepper-navigation">
          <button 
            className="stepper-button stepper-button-back" 
            onClick={handleBack}
            disabled={internalActiveStep === 0 || !allowStepBack || disabled}
          >
            {labels.previous}
          </button>
          
          {steps[internalActiveStep]?.optional && (
            <button 
              className="stepper-button stepper-button-skip" 
              onClick={handleNext}
              disabled={disabled}
            >
              {labels.skip}
            </button>
          )}
          
          <button 
            className="stepper-button stepper-button-next" 
            onClick={handleNext}
            disabled={disabled}
          >
            {internalActiveStep === steps.length - 1 ? labels.finish : labels.next}
          </button>
        </div>
      )}
    </div>
  );
};

export default Stepper;
export * from './types'; 