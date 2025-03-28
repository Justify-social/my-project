# UI Components Examples

This directory contains example components for the UI system.

## Overview

The examples in this directory serve as both documentation and testing tools for the UI component library. They demonstrate how to use various components, their available props, and different combinations of settings.

## Components

- **ColorPaletteLogosExamples**: Displays color palettes and logos used throughout the application
- **IconGrid**: Displays a grid of all available icons with search functionality

## Usage

These example components are primarily used in the debug tools and documentation pages. They can be imported individually for use in documentation:

```tsx
import { ColorPaletteLogosExamples } from '@/components/ui/examples/ColorPaletteLogosExamples';
import { IconGrid } from '@/components/ui/examples/IconGrid';

// Example usage
function DocumentationPage() {
  return (
    <div>
      <h2>Color Palette</h2>
      <ColorPaletteLogosExamples />
      
      <h2>Icons</h2>
      <IconGrid />
    </div>
  );
}
```

## Note

These example components have been separated from the main examples file to eliminate circular dependencies in the codebase. The main examples file imports from the UI component index, while these specialized examples are imported by the index. 