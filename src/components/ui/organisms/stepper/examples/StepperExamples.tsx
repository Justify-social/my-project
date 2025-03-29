import React, { useState } from 'react';
import Stepper from '..';
import { Step } from '../types';

const BasicStepContent: React.FC<{ stepIndex: number }> = ({ stepIndex }) => (
  <div style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '16px' }}>
    <h3>Step {stepIndex + 1} Content</h3>
    <p>This is the content for step {stepIndex + 1}. In a real application, this would contain form fields or other content relevant to this step.</p>
  </div>
);

const StepperExamples: React.FC = () => {
  // Basic example with state management
  const [activeStep, setActiveStep] = useState(0);
  const basicSteps: Step[] = [
    {
      id: 'step1',
      label: 'Personal Information',
      description: 'Enter your basic details',
      icon: 'fa-user',
      content: <BasicStepContent stepIndex={0} />,
    },
    {
      id: 'step2',
      label: 'Contact Details',
      description: 'How can we reach you?',
      icon: 'fa-envelope',
      content: <BasicStepContent stepIndex={1} />,
    },
    {
      id: 'step3',
      label: 'Preferences',
      description: 'Set your account preferences',
      icon: 'fa-gear',
      content: <BasicStepContent stepIndex={2} />,
    },
    {
      id: 'step4',
      label: 'Review',
      description: 'Review and submit',
      icon: 'fa-check-circle',
      content: <BasicStepContent stepIndex={3} />,
    },
  ];

  // Example with completed and error steps
  const [customActiveStep, setCustomActiveStep] = useState(2);
  const completedSteps = { 0: true, 1: true };
  const errorSteps = { 1: false };

  const customSteps: Step[] = [
    {
      id: 'custom1',
      label: 'Define Project',
      description: 'Set project parameters',
      icon: 'fa-folder',
      content: <BasicStepContent stepIndex={0} />,
    },
    {
      id: 'custom2',
      label: 'Upload Documents',
      description: 'Add required files',
      icon: 'fa-upload',
      content: <BasicStepContent stepIndex={1} />,
    },
    {
      id: 'custom3',
      label: 'Configure Settings',
      description: 'Adjust project settings',
      icon: 'fa-sliders',
      content: <BasicStepContent stepIndex={2} />,
    },
    {
      id: 'custom4',
      label: 'Invite Team',
      description: 'Add team members',
      optional: true,
      icon: 'fa-users',
      content: <BasicStepContent stepIndex={3} />,
    },
    {
      id: 'custom5',
      label: 'Launch',
      description: 'Start your project',
      icon: 'fa-rocket',
      content: <BasicStepContent stepIndex={4} />,
    },
  ];

  // Example with validation 
  const [validationStep, setValidationStep] = useState(0);
  const [formValid, setFormValid] = useState(false);

  const toggleFormValid = () => {
    setFormValid(!formValid);
  };

  const validationSteps: Step[] = [
    {
      id: 'validation1',
      label: 'Personal Details',
      description: 'Your basic information',
      icon: 'fa-user',
      content: (
        <div style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '16px' }}>
          <h3>Personal Details</h3>
          <p>This step has validation. Toggle the checkbox below to simulate a valid/invalid form.</p>
          <div style={{ marginTop: '16px' }}>
            <label>
              <input 
                type="checkbox" 
                checked={formValid} 
                onChange={toggleFormValid} 
                style={{ marginRight: '8px' }} 
              />
              Form is valid
            </label>
          </div>
        </div>
      ),
      validate: () => {
        if (!formValid) {
          alert("Please complete all required fields before proceeding.");
          return false;
        }
        return true;
      },
    },
    {
      id: 'validation2',
      label: 'Review',
      description: 'Confirm your information',
      icon: 'fa-check-circle',
      content: <BasicStepContent stepIndex={1} />,
    },
  ];

  // Vertical stepper example
  const [verticalStep, setVerticalStep] = useState(0);
  const verticalSteps: Step[] = basicSteps.map(step => ({
    ...step,
    id: `vertical-${step.id}`
  }));

  return (
    <div className="stepper-examples">
      <h2>Stepper Examples</h2>

      <div className="example-section">
        <h3>Basic Horizontal Stepper</h3>
        <p>A standard stepper with 4 steps and default configuration.</p>
        <Stepper 
          steps={basicSteps}
          activeStep={activeStep}
          onStepChange={setActiveStep}
        />
      </div>

      <div className="example-section" style={{ marginTop: '48px' }}>
        <h3>Custom Stepper with Completed and Error Steps</h3>
        <p>A stepper with a custom combination of completed steps, optional steps, and step status management.</p>
        <Stepper 
          steps={customSteps}
          activeStep={customActiveStep}
          onStepChange={setCustomActiveStep}
          completedSteps={completedSteps}
          errorSteps={errorSteps}
          allowSkipAhead={true}
          showProgress={true}
        />
      </div>

      <div className="example-section" style={{ marginTop: '48px' }}>
        <h3>Stepper with Step Validation</h3>
        <p>This example demonstrates form validation before proceeding to the next step.</p>
        <Stepper 
          steps={validationSteps}
          activeStep={validationStep}
          onStepChange={setValidationStep}
          layout="numbered"
        />
      </div>

      <div className="example-section" style={{ marginTop: '48px' }}>
        <h3>Vertical Stepper</h3>
        <p>A vertical orientation for the stepper, useful for mobile layouts or when steps have more content.</p>
        <Stepper 
          steps={verticalSteps}
          activeStep={verticalStep}
          onStepChange={setVerticalStep}
          variant="vertical"
        />
      </div>
    </div>
  );
};

export default StepperExamples; 