# Stack Component

A versatile layout component that arranges child elements either vertically or horizontally with consistent spacing. The Stack component helps create organized and well-spaced layouts with minimal effort.

## Features

- **Vertical or Horizontal Layout**: Easily switch between layout directions
- **Responsive Behavior**: Automatically adapt layout direction based on screen size
- **Consistent Spacing**: Apply uniform spacing between items with predefined options
- **Flexible Alignment**: Control both cross-axis alignment and main-axis distribution
- **Simple API**: Intuitive prop names matching CSS flexbox concepts
- **Customizable**: Accepts all standard div HTML attributes

## Usage

```tsx
import { Stack } from '@/components/ui/atoms/layout/stack';

// Basic vertical stack (default)
function VerticalStack() {
  return (
    <Stack>
      <div className="bg-blue-100 p-4 rounded">Item 1</div>
      <div className="bg-blue-100 p-4 rounded">Item 2</div>
      <div className="bg-blue-100 p-4 rounded">Item 3</div>
    </Stack>
  );
}

// Horizontal stack
function HorizontalStack() {
  return (
    <Stack direction="horizontal" spacing="lg">
      <div className="bg-green-100 p-4 rounded">Item 1</div>
      <div className="bg-green-100 p-4 rounded">Item 2</div>
      <div className="bg-green-100 p-4 rounded">Item 3</div>
    </Stack>
  );
}

// Responsive stack (horizontal on desktop, vertical on mobile)
function ResponsiveStack() {
  return (
    <Stack direction="horizontal" responsive spacing="md">
      <div className="bg-purple-100 p-4 rounded">Item 1</div>
      <div className="bg-purple-100 p-4 rounded">Item 2</div>
      <div className="bg-purple-100 p-4 rounded">Item 3</div>
    </Stack>
  );
}

// With alignment and distribution control
function AlignedStack() {
  return (
    <Stack 
      direction="horizontal" 
      align="center" 
      justify="between"
      className="h-32 border border-gray-200 p-4"
    >
      <div className="bg-yellow-100 p-4 rounded">Start</div>
      <div className="bg-yellow-100 p-4 rounded">Center</div>
      <div className="bg-yellow-100 p-4 rounded">End</div>
    </Stack>
  );
}

// Form field example with a label and input
function FormFieldStack() {
  return (
    <Stack spacing="xs">
      <label htmlFor="name">Name</label>
      <input 
        id="name"
        type="text"
        className="border border-gray-300 rounded p-2" 
        placeholder="Enter your name"
      />
      <p className="text-sm text-gray-500">Enter your full name</p>
    </Stack>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | 'vertical' \| 'horizontal' | 'vertical' | Layout direction for the stack |
| spacing | 'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Spacing between stack items |
| align | 'start' \| 'center' \| 'end' \| 'stretch' | 'start' | Cross-axis alignment |
| justify | 'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly' | 'start' | Main-axis distribution |
| fullWidth | boolean | true | Whether the stack takes full width |
| responsive | boolean | false | Whether to switch to vertical layout on small screens |
| children | ReactNode | - | Stack items |
| className | string | - | Additional CSS classes |

Plus all standard `div` HTML attributes.

## Spacing Reference

| Spacing | CSS Class | Approximate Size |
|---------|-----------|------------------|
| none | gap-0 | 0px |
| xs | gap-1 | 0.25rem (4px) |
| sm | gap-2 | 0.5rem (8px) |
| md | gap-4 | 1rem (16px) |
| lg | gap-6 | 1.5rem (24px) |
| xl | gap-8 | 2rem (32px) |

## Best Practices

- Use vertical stacks for typical form layouts and content sections
- Use horizontal stacks for navigation, toolbars, and side-by-side elements
- For responsive designs, use the `responsive` prop with a horizontal direction
- Combine stacks with different directions to create complex layouts
- Choose appropriate spacing based on the relationship between elements:
  - `xs` or `sm` for closely related elements (label and input)
  - `md` for standard spacing between components
  - `lg` or `xl` for major section divisions
- Use the `align` and `justify` props to control precise positioning of elements 