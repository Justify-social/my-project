# FormField Component

This component provides a consistent wrapper for form inputs with label, validation, and help text.

## Overview

The FormField component is a molecule that combines multiple atoms to create a complete form field. It handles layout, labeling, validation, and accessibility.

## Features

- Vertical and horizontal layouts
- Required field indicators
- Error and help text support
- Icon placement (start/end)
- Accessible by default
- Responsive design

## Usage

```tsx
import { FormField } from '@/components/ui/molecules/form-field';
import { Input } from '@/components/ui/atoms/input';

// Basic usage
function ExampleForm() {
  return (
    <FormField
      id="email"
      label="Email Address"
      helperText="We'll never share your email"
      required
    >
      <Input type="email" placeholder="Enter your email" />
    </FormField>
  );
}

// With validation error
function ValidationExample() {
  return (
    <FormField
      id="password"
      label="Password"
      error="Password must be at least 8 characters"
    >
      <Input type="password" />
    </FormField>
  );
}

// Horizontal layout
function HorizontalExample() {
  return (
    <FormField
      id="name"
      label="Full Name"
      layout="horizontal"
      labelWidth="md"
    >
      <Input placeholder="Enter your full name" />
    </FormField>
  );
}

// With icons
function IconExample() {
  return (
    <FormField
      id="search"
      label="Search"
      startIcon={<Icon name="search" />}
    >
      <Input placeholder="Search..." />
    </FormField>
  );
}
``` 