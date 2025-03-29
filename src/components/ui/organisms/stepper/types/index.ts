import { ReactNode } from 'react';

/**
 * Interface for an individual step in the stepper
 */
export interface Step {
  /**
   * Unique identifier for the step
   */
  id: string;

  /**
   * The label shown for this step
   */
  label: string;

  /**
   * Optional description of this step
   */
  description?: string;

  /**
   * Optional icon for this step
   */
  icon?: string;

  /**
   * Optional content to display when this step is active
   */
  content?: ReactNode;

  /**
   * Optional validation function that determines if this step can be proceeded from
   */
  validate?: () => boolean | Promise<boolean>;

  /**
   * Optional flag to indicate if the step is optional
   */
  optional?: boolean;
}

/**
 * Status of a step
 */
export type StepStatus = 'incomplete' | 'current' | 'complete' | 'error';

/**
 * Variant of the stepper
 */
export type StepperVariant = 'horizontal' | 'vertical';

/**
 * Layout options for the stepper
 */
export type StepperLayout = 'default' | 'compact' | 'numbered';

/**
 * Props for the Stepper component
 */
export interface StepperProps {
  /**
   * The steps to display in the stepper
   */
  steps: Step[];

  /**
   * The currently active step index (0-based)
   */
  activeStep: number;

  /**
   * Function called when a step is changed
   */
  onStepChange?: (newStep: number) => void;

  /**
   * Whether the stepper allows going back to previous steps
   * @default true
   */
  allowStepBack?: boolean;

  /**
   * Whether the stepper allows skipping ahead to future steps
   * This will only work for steps that have been previously completed
   * @default false
   */
  allowSkipAhead?: boolean;

  /**
   * Whether the stepper should show progress as a percentage
   * @default false
   */
  showProgress?: boolean;

  /**
   * Mapping of which steps are completed (by index)
   * If not provided, all steps before activeStep are considered complete
   */
  completedSteps?: Record<number, boolean>;

  /**
   * Mapping of which steps have errors (by index)
   */
  errorSteps?: Record<number, boolean>;

  /**
   * Direction of the stepper (horizontal or vertical)
   * @default 'horizontal'
   */
  variant?: StepperVariant;

  /**
   * Layout style for the stepper
   * @default 'default'
   */
  layout?: StepperLayout;

  /**
   * Custom class for the stepper container
   */
  className?: string;

  /**
   * Custom class for individual steps
   */
  stepClassName?: string;

  /**
   * Custom class for the step connector
   */
  connectorClassName?: string;

  /**
   * Custom class for the active step
   */
  activeStepClassName?: string;

  /**
   * Custom class for completed steps
   */
  completedStepClassName?: string;

  /**
   * Custom class for steps with errors
   */
  errorStepClassName?: string;

  /**
   * Custom renderer for step icons
   */
  renderStepIcon?: (step: Step, status: StepStatus, index: number) => ReactNode;

  /**
   * Labels for the buttons
   */
  labels?: {
    next?: string;
    previous?: string;
    finish?: string;
    skip?: string;
  };

  /**
   * Whether to show the navigation buttons
   * @default true
   */
  showNavigation?: boolean;

  /**
   * Whether the stepper is disabled
   * @default false
   */
  disabled?: boolean;
} 