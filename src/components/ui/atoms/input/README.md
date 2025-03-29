# Input Component

A versatile and accessible text input component that serves as a foundation for form elements in the application.

## Overview

The Input component provides a consistent interface for users to enter text data. It supports various states, sizes, icons, and supplementary text elements like labels, help text, and error messages.

## Features

- **Multiple Sizes**: Small, medium, and large variants
- **Icon Support**: Optional left and right icons
- **Form Integration**: Built-in support for labels, help text, and error states
- **Accessibility**: Properly labeled and described for screen readers
- **Full Width Option**: Flexibility to fit various layouts
- **Customizable**: Extensive className customization options

## Installation

The Input component is available as part of the UI library:

```tsx
import { Input } from '@/components/ui/atoms/input';
```

## Basic Usage

```tsx
import { Input } from '@/components/ui/atoms/input';

function BasicExample() {
  return (
    <div className="space-y-4">
      {/* Simple input */}
      <Input 
        placeholder="Enter your name"
      />

      {/* With label */}
      <Input 
        label="Email Address"
        type="email"
        placeholder="your.email@example.com"
      />

      {/* With help text */}
      <Input 
        label="Username"
        placeholder="username"
        helpText="Choose a unique username for your account"
      />

      {/* With error state */}
      <Input 
        label="Password"
        type="password"
        error="Password must be at least 8 characters"
      />
    </div>
  );
}
```

## With Icons

```tsx
import { Input } from '@/components/ui/atoms/input';
import { Icon } from '@/components/ui/atoms/icons';

function IconsExample() {
  return (
    <div className="space-y-4">
      {/* Left icon */}
      <Input 
        label="Search"
        placeholder="Search..."
        leftIcon={<Icon name="faSearch" iconType="static" />}
      />

      {/* Right icon */}
      <Input 
        label="Password"
        type="password"
        placeholder="Enter password"
        rightIcon={<Icon name="faEye" iconType="button" />}
      />

      {/* Both icons */}
      <Input 
        label="Website"
        placeholder="https://example.com"
        leftIcon={<Icon name="faGlobe" iconType="static" />}
        rightIcon={<Icon name="faExternalLink" iconType="button" />}
      />
    </div>
  );
}
```

## Sizes and Width

```tsx
import { Input } from '@/components/ui/atoms/input';

function SizesExample() {
  return (
    <div className="space-y-4">
      {/* Small input */}
      <Input 
        inputSize="sm"
        placeholder="Small input"
      />

      {/* Medium input (default) */}
      <Input 
        inputSize="md"
        placeholder="Medium input"
      />

      {/* Large input */}
      <Input 
        inputSize="lg"
        placeholder="Large input"
      />

      {/* Full width input */}
      <Input 
        fullWidth
        placeholder="Full width input"
      />
    </div>
  );
}
```

## Form Integration

```tsx
import { Input } from '@/components/ui/atoms/input';
import { useState } from 'react';

function FormExample() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const validateEmail = (value: string) => {
    if (!value) {
      setError('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };
  
  return (
    <form className="space-y-4">
      <Input 
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
        onBlur={() => validateEmail(email)}
        error={error}
        required
      />
      
      <button type="submit" disabled={!!error}>
        Submit
      </button>
    </form>
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Label text for the input field |
| helpText | string | - | Informational text displayed below the input |
| error | string | - | Error message displayed below the input (overrides helpText) |
| fullWidth | boolean | false | Whether the input should take full width of its container |
| inputSize | 'sm' \| 'md' \| 'lg' | 'md' | Size variant of the input |
| leftIcon | ReactNode | - | Icon element to display at the left side of the input |
| rightIcon | ReactNode | - | Icon element to display at the right side of the input |
| containerClassName | string | - | Additional CSS class for the container element |
| wrapperClassName | string | - | Additional CSS class for the input wrapper |
| labelClassName | string | - | Additional CSS class for the label element |
| helpTextClassName | string | - | Additional CSS class for the help text |
| errorClassName | string | - | Additional CSS class for the error message |

Plus all standard HTML input attributes (except 'size' which is renamed to 'inputSize').

## Accessibility

The Input component follows accessibility best practices:

- Uses semantic HTML elements (`<label>`, `<input>`)
- Associates labels with inputs via the `htmlFor` attribute
- Uses `aria-invalid` to indicate error states
- Uses `aria-describedby` to associate help text and error messages with the input
- Applies proper focus states for keyboard navigation
- Disabled states are visually distinct and properly communicated to assistive technologies

## Customization

The Input component provides several customization options through CSS class props:

```tsx
<Input 
  className="border-blue-500"          // Customize the input element
  containerClassName="mb-6"            // Customize the entire component container
  wrapperClassName="shadow-md"         // Customize the input wrapper (container for input and icons)
  labelClassName="text-blue-500"       // Customize the label
  helpTextClassName="italic"           // Customize the help text
  errorClassName="text-orange-500"     // Customize the error message
/>
``` 