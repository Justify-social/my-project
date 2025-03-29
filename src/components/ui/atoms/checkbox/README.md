# Checkbox Component

A customizable and accessible checkbox component that allows users to select one or multiple options from a set.

## Overview

The Checkbox component is an atomic form control that enables users to toggle between checked, unchecked, and indeterminate states. It follows design system guidelines for consistency and includes built-in accessibility features.

## Features

- **Multiple Sizes**: Small, medium, and large variants
- **Label Support**: Optional labels with positioning (left/right)
- **Indeterminate State**: Support for tri-state checkboxes
- **Accessibility**: Built-in ARIA attributes and keyboard interactions
- **Customizable**: Extensive styling options through className props

## Installation

The Checkbox component is available as part of the UI library:

```tsx
import { Checkbox } from '@/components/ui/atoms/checkbox';
```

## Basic Usage

```tsx
import { Checkbox } from '@/components/ui/atoms/checkbox';
import { useState } from 'react';

function BasicExample() {
  const [checked, setChecked] = useState(false);
  
  return (
    <div className="space-y-4">
      {/* Simple checkbox */}
      <Checkbox 
        label="Accept terms and conditions" 
        id="terms" 
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      
      {/* Disabled checkbox */}
      <Checkbox 
        label="Disabled option" 
        disabled
      />
      
      {/* Checkbox without label */}
      <Checkbox 
        aria-label="Option without visible label"
      />
    </div>
  );
}
```

## Label Positioning

```tsx
import { Checkbox } from '@/components/ui/atoms/checkbox';

function LabelPositionExample() {
  return (
    <div className="space-y-4">
      {/* Label on right (default) */}
      <Checkbox 
        label="Label on right side" 
        labelPosition="right" 
      />
      
      {/* Label on left */}
      <Checkbox 
        label="Label on left side" 
        labelPosition="left" 
      />
    </div>
  );
}
```

## Different Sizes

```tsx
import { Checkbox } from '@/components/ui/atoms/checkbox';

function SizesExample() {
  return (
    <div className="space-y-4">
      {/* Small checkbox */}
      <Checkbox 
        size="sm" 
        label="Small checkbox" 
      />
      
      {/* Medium checkbox (default) */}
      <Checkbox 
        size="md" 
        label="Medium checkbox" 
      />
      
      {/* Large checkbox */}
      <Checkbox 
        size="lg" 
        label="Large checkbox" 
      />
    </div>
  );
}
```

## Indeterminate State

The indeterminate state is useful for parent checkboxes that control a group of child checkboxes.

```tsx
import { Checkbox } from '@/components/ui/atoms/checkbox';
import { useState } from 'react';

function IndeterminateExample() {
  const [parentChecked, setParentChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const [children, setChildren] = useState([
    { id: 1, checked: true },
    { id: 2, checked: false },
    { id: 3, checked: true }
  ]);
  
  // Update parent checkbox based on children
  const updateParentState = (newChildren) => {
    const allChecked = newChildren.every(child => child.checked);
    const someChecked = newChildren.some(child => child.checked);
    
    setParentChecked(allChecked);
    setIndeterminate(!allChecked && someChecked);
  };
  
  // Handle parent checkbox change
  const handleParentChange = (e) => {
    const newCheckedState = e.target.checked;
    setParentChecked(newCheckedState);
    setIndeterminate(false);
    
    const newChildren = children.map(child => ({
      ...child,
      checked: newCheckedState
    }));
    
    setChildren(newChildren);
  };
  
  // Handle child checkbox change
  const handleChildChange = (id) => {
    const newChildren = children.map(child => 
      child.id === id ? { ...child, checked: !child.checked } : child
    );
    
    setChildren(newChildren);
    updateParentState(newChildren);
  };
  
  return (
    <div className="space-y-2">
      <Checkbox 
        label="Select all items" 
        checked={parentChecked}
        indeterminate={indeterminate}
        onChange={handleParentChange}
      />
      
      <div className="ml-6 space-y-1">
        {children.map(child => (
          <Checkbox 
            key={child.id}
            label={`Item ${child.id}`}
            checked={child.checked}
            onChange={() => handleChildChange(child.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

## Form Integration

```tsx
import { Checkbox } from '@/components/ui/atoms/checkbox';
import { useState } from 'react';

function FormExample() {
  const [formData, setFormData] = useState({
    newsletter: false,
    promotions: false,
    partners: false
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <h3 className="mb-2 font-medium">Email Preferences</h3>
        <div className="space-y-2">
          <Checkbox 
            label="Subscribe to newsletter" 
            checked={formData.newsletter}
            onChange={(e) => setFormData({
              ...formData,
              newsletter: e.target.checked
            })}
          />
          
          <Checkbox 
            label="Receive promotional emails" 
            checked={formData.promotions}
            onChange={(e) => setFormData({
              ...formData,
              promotions: e.target.checked
            })}
          />
          
          <Checkbox 
            label="Receive partner offers" 
            checked={formData.partners}
            onChange={(e) => setFormData({
              ...formData,
              partners: e.target.checked
            })}
          />
        </div>
      </div>
      
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Save Preferences
      </button>
    </form>
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| checked | boolean | false | Whether the checkbox is checked |
| indeterminate | boolean | false | Whether the checkbox is in an indeterminate state |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant of the checkbox |
| label | string | - | Label text for the checkbox |
| labelPosition | 'left' \| 'right' | 'right' | Position of the label relative to the checkbox |
| className | string | - | Additional CSS class for the wrapper element |
| checkboxClassName | string | - | Additional CSS class for the checkbox input |
| labelClassName | string | - | Additional CSS class for the label element |

Plus all standard HTML input attributes for checkbox type.

## Accessibility

The Checkbox component follows accessibility best practices:

- Uses semantic HTML elements (`<input type="checkbox">`)
- Associates labels with inputs using the `htmlFor` attribute
- Supports keyboard navigation and interaction
- Properly communicates states to assistive technologies
- Handles the indeterminate state correctly with the appropriate ARIA attributes
- Maintains sufficient contrast ratios for visual distinction

## Customization

The Checkbox component provides several customization options:

```tsx
<Checkbox 
  className="border-2 p-1"                // Customize the wrapper element
  checkboxClassName="accent-blue-500"     // Customize the checkbox input
  labelClassName="text-blue-700 font-bold" // Customize the label
/>
``` 