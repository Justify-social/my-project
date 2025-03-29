# Stepper Component

The Stepper component is a navigation tool for multi-step processes, enabling users to track progress through a series of steps and move between them. It's ideal for workflows like onboarding, form completion, and checkout processes.

## Features

- **Multiple Variants**: Supports both horizontal and vertical layouts to fit different UI designs.
- **Three Layouts**: Choose from default, compact, or numbered layouts.
- **Progress Tracking**: Optional progress bar to show completion percentage.
- **Validation**: Built-in support for step validation before proceeding.
- **Optional Steps**: Mark steps as optional with bypass functionality.
- **Customization**: Extensive styling options with class name props.
- **Accessibility**: Implements ARIA attributes for screen readers.
- **State Management**: Handles step completion, errors, and navigation.

## Usage

### Basic Usage

```tsx
import React, { useState } from 'react';
import Stepper from '@/components/ui/organisms/stepper';
import { Step } from '@/components/ui/organisms/stepper/types';

const MyComponent = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps: Step[] = [
    {
      id: 'step1',
      label: 'Personal Information',
      description: 'Enter your basic details',
      icon: 'fa-user',
      content: <div>Step 1 content goes here</div>,
    },
    {
      id: 'step2',
      label: 'Contact Details',
      description: 'How can we reach you?',
      icon: 'fa-envelope',
      content: <div>Step 2 content goes here</div>,
    },
    {
      id: 'step3',
      label: 'Review',
      description: 'Review and submit',
      icon: 'fa-check-circle',
      content: <div>Step 3 content goes here</div>,
    },
  ];
  
  return (
    <Stepper
      steps={steps}
      activeStep={activeStep}
      onStepChange={setActiveStep}
    />
  );
};
```

### With Custom Step Status

```tsx
<Stepper
  steps={steps}
  activeStep={1}
  completedSteps={{ 0: true }}
  errorSteps={{ 2: true }}
  onStepChange={handleStepChange}
  showProgress={true}
/>
```

### Vertical Variant

```tsx
<Stepper
  steps={steps}
  activeStep={activeStep}
  onStepChange={setActiveStep}
  variant="vertical"
/>
```

### With Step Validation

```tsx
const stepsWithValidation: Step[] = [
  {
    id: 'step1',
    label: 'Personal Details',
    validate: () => {
      // Return true if valid, false if invalid
      return formIsValid();
    },
    content: <PersonalDetailsForm />,
  },
  // Additional steps...
];

<Stepper
  steps={stepsWithValidation}
  activeStep={activeStep}
  onStepChange={setActiveStep}
/>
```

## Props

### StepperProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `Step[]` | Required | Array of step objects to display |
| `activeStep` | `number` | Required | The currently active step index (0-based) |
| `onStepChange` | `(newStep: number) => void` | - | Callback when a step is changed |
| `allowStepBack` | `boolean` | `true` | Whether users can navigate to previous steps |
| `allowSkipAhead` | `boolean` | `false` | Whether users can skip ahead to future steps |
| `showProgress` | `boolean` | `false` | Whether to show a progress bar |
| `completedSteps` | `Record<number, boolean>` | - | Map of which steps are completed |
| `errorSteps` | `Record<number, boolean>` | - | Map of which steps have errors |
| `variant` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction of the stepper |
| `layout` | `'default' \| 'compact' \| 'numbered'` | `'default'` | Layout style for the stepper |
| `className` | `string` | - | Custom class for the container |
| `stepClassName` | `string` | - | Custom class for individual steps |
| `connectorClassName` | `string` | - | Custom class for step connectors |
| `activeStepClassName` | `string` | - | Custom class for the active step |
| `completedStepClassName` | `string` | - | Custom class for completed steps |
| `errorStepClassName` | `string` | - | Custom class for steps with errors |
| `renderStepIcon` | `(step: Step, status: StepStatus, index: number) => ReactNode` | - | Custom renderer for step icons |
| `labels` | `{ next?: string; previous?: string; finish?: string; skip?: string; }` | See below | Labels for buttons |
| `showNavigation` | `boolean` | `true` | Whether to show navigation buttons |
| `disabled` | `boolean` | `false` | Whether the stepper is disabled |

Default labels:
```typescript
{
  next: 'Next',
  previous: 'Back',
  finish: 'Finish',
  skip: 'Skip'
}
```

### Step Interface

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the step |
| `label` | `string` | Yes | Display text for the step |
| `description` | `string` | No | Additional description text |
| `icon` | `string` | No | Font Awesome icon class |
| `content` | `ReactNode` | No | Content to display when active |
| `validate` | `() => boolean \| Promise<boolean>` | No | Validation function |
| `optional` | `boolean` | No | Whether the step is optional |

## Variants & Layouts

### Variants

- **Horizontal**: Steps displayed in a row, suited for desktop views
- **Vertical**: Steps stacked vertically, better for mobile or complex steps

### Layouts

- **Default**: Standard layout with icons and labels
- **Compact**: Minimalist design with smaller elements
- **Numbered**: Uses numbers instead of icons for steps

## Accessibility

The Stepper component includes the following accessibility features:

- Proper ARIA attributes on steps and buttons
- Keyboard navigation support
- Screen reader announcements for step changes
- Focus management between steps

## Examples

For more detailed examples, please refer to the examples directory:

```
src/components/ui/organisms/stepper/examples/StepperExamples.tsx
```

## Styling

The Stepper component uses a set of CSS classes that you can override in your application:

- `.stepper`: Main container
- `.stepper-steps`: Step container
- `.stepper-step`: Individual step
- `.stepper-step-active`: Currently active step
- `.stepper-step-completed`: Completed step
- `.stepper-step-error`: Step with error
- `.stepper-connector`: Line connecting steps
- `.stepper-content`: Content area for active step
- `.stepper-navigation`: Navigation buttons container

You can also customize individual elements using the className props provided. 