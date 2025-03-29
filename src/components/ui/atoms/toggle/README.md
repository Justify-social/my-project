# Toggle

A toggle/switch component for boolean inputs with customizable styling.

## Usage

```tsx
import { Toggle } from '@/components/ui/atoms/toggle';

function MyComponent() {
  const [isEnabled, setIsEnabled] = useState(false);
  
  return (
    <Toggle
      id="my-toggle"
      label="Enable feature"
      checked={isEnabled}
      onChange={(e) => setIsEnabled(e.target.checked)}
    />
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | ID for the input element (required for accessibility) |
| size | 'sm' \| 'md' \| 'lg' | 'md' | The size of the toggle |
| colorScheme | 'primary' \| 'accent' \| 'success' \| 'warning' \| 'error' | 'accent' | The color scheme when active |
| label | string | undefined | Label for the toggle control |
| showLabel | boolean | true | Whether to show the label |
| labelPosition | 'left' \| 'right' | 'right' | Position of the label relative to the toggle |
| disabled | boolean | false | Whether the toggle is disabled |
| readOnly | boolean | false | Whether the toggle is read-only |
| description | string | undefined | Optional description text below the toggle |
| checked | boolean | - | Whether the toggle is checked |
| onChange | function | - | Callback for when the toggle value changes |

## Variants

### Sizes

```tsx
<Toggle id="small-toggle" size="sm" label="Small toggle" />
<Toggle id="medium-toggle" size="md" label="Medium toggle" /> // Default
<Toggle id="large-toggle" size="lg" label="Large toggle" />
```

### Color Schemes

```tsx
<Toggle id="primary-toggle" colorScheme="primary" label="Primary" checked />
<Toggle id="accent-toggle" colorScheme="accent" label="Accent" checked /> // Default
<Toggle id="success-toggle" colorScheme="success" label="Success" checked />
<Toggle id="warning-toggle" colorScheme="warning" label="Warning" checked />
<Toggle id="error-toggle" colorScheme="error" label="Error" checked />
```

### Label Positions

```tsx
<Toggle id="right-label" labelPosition="right" label="Label on right" /> // Default
<Toggle id="left-label" labelPosition="left" label="Label on left" />
```

### States

```tsx
<Toggle id="disabled-toggle" label="Disabled toggle" disabled />
<Toggle id="readonly-toggle" label="Read-only toggle" readOnly checked />
```

### With Description

```tsx
<Toggle
  id="with-description"
  label="Send notifications"
  description="You'll receive email notifications for important updates"
/>
```

## Accessibility

The Toggle component is built with accessibility in mind:
- Uses a proper checkbox input with label
- Requires an ID to ensure label association
- Supports keyboard navigation
- Uses appropriate ARIA attributes

## Related Components

- Checkbox - For binary selection that looks like a traditional checkbox
- Radio - For selecting one option from a group
- FormField - For complete form fields with validation