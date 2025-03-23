# Loading Spinner Components

This directory contains reusable loading spinner components for creating consistent loading indicators across the application.

## Components

- `Spinner` - Configurable base spinner with various sizes and colors
- `AuthSpinner` - Full-screen authentication spinner
- `ButtonSpinner` - Inline spinner for buttons
- `FullscreenSpinner` - Modal overlay spinner
- `InlineSpinner` - Inline text spinner
- `DotsSpinner` - Three-dot loading animation
- `LoadingSpinner` - Legacy spinner for backward compatibility

## Usage Examples

### Basic Spinner

```tsx
import { Spinner } from '@/components/ui/loading-spinner';

// Default spinner
<Spinner />

// Spinner with size and color variant
<Spinner size="lg" variant="primary" />

// Spinner with label
<Spinner showLabel={true} label="Loading data..." />

// Spinner with label position
<Spinner showLabel={true} label="Please wait..." labelPosition="right" />
```

### Specialized Spinners

```tsx
import { 
  AuthSpinner, 
  ButtonSpinner, 
  FullscreenSpinner,
  InlineSpinner,
  DotsSpinner 
} from '@/components/ui/loading-spinner';

// Authentication spinner
<AuthSpinner label="Checking authentication..." />

// Button spinner (for loading buttons)
<button disabled={isLoading}>
  {isLoading && <ButtonSpinner />}
  Submit
</button>

// Fullscreen overlay spinner
{isSubmitting && <FullscreenSpinner label="Submitting your campaign..." />}

// Inline text spinner
<div>Loading your campaigns <InlineSpinner /></div>

// Three dots animation
<DotsSpinner />
```