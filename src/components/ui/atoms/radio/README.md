# Radio Components

This directory contains Radio components for creating radio buttons and radio groups.

## Overview

Radio components are atomic elements that allow users to select a single option from a set of mutually exclusive options. The components include both individual radio buttons and radio groups.

## Components

- **Radio**: A basic radio button with label support
- **RadioGroup**: A component for managing groups of related radio buttons

## Features

- Multiple sizes (sm, md, lg)
- Label support with positioning (left/right)
- Vertical and horizontal radio groups
- Consistent styling with the design system
- Accessible by default

## Usage

```tsx
import { Radio, RadioGroup } from '@/components/ui/atoms/radio';

// Individual radio button
function RadioExample() {
  return (
    <Radio 
      label="Option 1"
      name="example"
      value="option1"
      id="option1"
    />
  );
}

// Radio with left label position
function LabelPositionExample() {
  return (
    <Radio 
      label="Left-positioned label"
      labelPosition="left"
      name="position"
      value="left"
    />
  );
}

// Different sizes
function SizeExample() {
  return (
    <>
      <Radio size="sm" label="Small radio" name="size" value="sm" />
      <Radio size="md" label="Medium radio" name="size" value="md" />
      <Radio size="lg" label="Large radio" name="size" value="lg" />
    </>
  );
}

// Radio group
function RadioGroupExample() {
  const [selected, setSelected] = React.useState('option1');
  
  return (
    <RadioGroup
      name="group-example"
      value={selected}
      onChange={setSelected}
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ]}
    />
  );
}

// Horizontal radio group
function HorizontalGroupExample() {
  return (
    <RadioGroup
      name="orientation-example"
      orientation="horizontal"
      options={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'maybe', label: 'Maybe' }
      ]}
    />
  );
}
``` 