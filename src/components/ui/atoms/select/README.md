# Select Component

This directory contains the Select component, a styled dropdown input for selecting from a list of options.

## Overview

The Select component is an atomic element that extends the HTML select with consistent styling, accessibility improvements, and customization options.

## Features

- Multiple sizes (sm, md, lg)
- Custom chevron icon
- Placeholder support
- Error states
- Full width option
- Option-based or children-based usage

## Usage

```tsx
import { Select } from '@/components/ui/atoms/select';

// Basic usage with options array
function BasicExample() {
  return (
    <Select
      placeholder="Select an option"
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ]}
      onChange={(e) => console.log(e.target.value)}
    />
  );
}

// Using children elements
function ChildrenExample() {
  return (
    <Select placeholder="Select a country">
      <option value="us">United States</option>
      <option value="ca">Canada</option>
      <option value="mx">Mexico</option>
      <option value="uk">United Kingdom</option>
    </Select>
  );
}

// With error state
function ErrorExample() {
  return (
    <Select
      placeholder="Select an option"
      error={true}
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]}
    />
  );
}

// Different sizes
function SizeExample() {
  return (
    <>
      <Select size="sm" placeholder="Small select" />
      <Select size="md" placeholder="Medium select" />
      <Select size="lg" placeholder="Large select" />
    </>
  );
}

// Full width
function FullWidthExample() {
  return (
    <Select
      fullWidth
      placeholder="This select spans the full width of its container"
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]}
    />
  );
}
``` 