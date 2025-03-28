# Spinner Component

## Overview

The Spinner component provides visual feedback when content is loading or an action is being processed. It offers multiple variants and configuration options to suit different UI contexts.

## Usage

```tsx
import { Spinner } from '@/components/ui/spinner';

// Basic usage
function LoadingState() {
  return <Spinner size="md" />;
}

// With label
function LoadingWithLabel() {
  return <Spinner size="lg" label="Loading data..." />;
}

// Button spinner
function SubmitButton() {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Button 
      onClick={() => setIsLoading(true)}
      disabled={isLoading}
    >
      {isLoading ? <Spinner size="sm" /> : 'Submit'}
    </Button>
  );
}
```

## API Reference

### Spinner Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Controls the size of the spinner |
| `type` | `'circle' \| 'dots' \| 'svg'` | `'circle'` | Determines the visual style of the spinner |
| `label` | `string` | `undefined` | Optional text label to display alongside the spinner |
| `labelPosition` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Controls the position of the label relative to the spinner |
| `className` | `string` | `''` | Additional CSS classes to apply |
| `color` | `string` | Primary brand color | The color of the spinner |

### Specialized Variants

The spinner directory also exports several specialized spinner components:

- `ButtonSpinner`: Optimized for use within buttons
- `InlineSpinner`: Designed to be used inline with text
- `FullscreenSpinner`: Covers the entire screen/container with an overlay
- `DotsSpinner`: Animated dots style spinner
- `AuthSpinner`: Specialized spinner for authentication flows

## Directory Structure

```
/spinner
├── README.md                # This documentation
├── index.tsx                # Main exports
├── loading-spinner.tsx      # Legacy component (deprecated)
└── svg-spinner.tsx          # SVG implementation
```

## Accessibility

- All spinner components include appropriate ARIA attributes (`role="status"`, `aria-live="polite"`)
- When using a spinner with a label, the label text is properly associated with the spinner
- For spinners without visible text, an `aria-label` is provided

## Related Components

- `LoadingSkeleton`: For content placeholder loading states
- `ProgressBar`: For loading states with determinate progress 