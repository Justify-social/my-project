# Container Component

A fundamental layout component used to control the maximum width of content and ensure consistent spacing across the application. The Container component helps maintain proper layout constraints and responsive behavior.

## Features

- **Responsive Widths**: Predefined size options for common screen widths
- **Automatic Centering**: Centers content horizontally with optional control
- **Consistent Padding**: Applies responsive padding that adjusts based on screen size
- **Customizable**: Accepts all standard div HTML attributes

## Usage

```tsx
import { Container } from '@/components/ui/atoms/layout/container';

// Basic usage (defaults to lg size, centered with padding)
function BasicContainer() {
  return (
    <Container>
      <h1>This content is contained</h1>
      <p>The container provides proper spacing and width constraints</p>
    </Container>
  );
}

// Different size variants
function ContainerSizes() {
  return (
    <>
      <Container size="sm">
        Small container - great for narrow content like forms
      </Container>
      
      <Container size="md">
        Medium container - balanced width for most content
      </Container>
      
      <Container size="lg">
        Large container - default size for main content areas
      </Container>
      
      <Container size="xl">
        Extra large container - for wider layouts on large screens
      </Container>
      
      <Container size="full">
        Full width container - spans the entire width of its parent
      </Container>
    </>
  );
}

// Container without centering or padding
function CustomContainer() {
  return (
    <Container 
      centered={false} 
      withPadding={false}
      className="bg-gray-100"
    >
      This container aligns to the left and has no padding
    </Container>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | 'lg' | Controls the maximum width of the container |
| centered | boolean | true | When true, centers the container horizontally |
| withPadding | boolean | true | When true, applies responsive horizontal padding |
| children | ReactNode | - | Content to be contained |
| className | string | - | Additional CSS classes to apply |

Plus all standard `div` HTML attributes.

## Size Reference

| Size | CSS Class | Approximate Width |
|------|-----------|------------------|
| sm | max-w-screen-sm | 640px |
| md | max-w-screen-md | 768px |
| lg | max-w-screen-lg | 1024px |
| xl | max-w-screen-xl | 1280px |
| full | max-w-full | 100% |

## Best Practices

- Use the Container component as a primary layout tool for page content
- For consistent spacing across the application, use Container instead of adding margins or paddings directly to content
- The default `lg` size works well for most main content areas
- For forms and narrow content, consider the `sm` or `md` size
- Use `size="full"` when you want to fill the entire width while still benefiting from the padding features 