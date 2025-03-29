# Textarea

A customizable multi-line text input component with various styling options and features.

## Usage

```tsx
import { Textarea } from '@/components/ui/atoms/textarea';

function MyComponent() {
  return (
    <Textarea
      id="my-textarea"
      label="Description"
      placeholder="Enter your description here..."
      helperText="Maximum 500 characters"
    />
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | ID for the textarea (required for accessibility) |
| size | 'sm' \| 'md' \| 'lg' | 'md' | The size of the textarea |
| variant | 'default' \| 'outline' \| 'ghost' \| 'filled' | 'default' | The variant style of the textarea |
| status | 'default' \| 'error' \| 'success' \| 'warning' | 'default' | The validation status of the textarea |
| disabled | boolean | false | Whether the textarea is disabled |
| readOnly | boolean | false | Whether the textarea is read-only |
| placeholder | string | undefined | Placeholder text |
| label | string | undefined | Label for the textarea |
| showLabel | boolean | true | Whether to show the label |
| helperText | string | undefined | Helper text to display below the textarea |
| errorMessage | string | undefined | Error message to display when status is 'error' |
| autoResize | boolean | false | Whether to auto-resize the textarea based on content |
| maxHeight | number \| string | undefined | Maximum height for auto-resizing |
| minRows | number | 3 | Minimum rows to display |
| maxRows | number | undefined | Maximum rows to display |

## Variants

### Sizes

```tsx
<Textarea id="small-textarea" size="sm" label="Small" />
<Textarea id="medium-textarea" size="md" label="Medium" /> // Default
<Textarea id="large-textarea" size="lg" label="Large" />
```

### Variants

```tsx
<Textarea id="default-variant" variant="default" label="Default" /> // Default
<Textarea id="outline-variant" variant="outline" label="Outline" />
<Textarea id="ghost-variant" variant="ghost" label="Ghost" />
<Textarea id="filled-variant" variant="filled" label="Filled" />
```

### Validation Status

```tsx
<Textarea id="default-status" label="Default status" /> // Default
<Textarea
  id="error-status"
  status="error"
  label="Error status"
  errorMessage="This field is required"
/>
<Textarea id="success-status" status="success" label="Success status" />
<Textarea id="warning-status" status="warning" label="Warning status" />
```

### States

```tsx
<Textarea id="disabled-textarea" label="Disabled textarea" disabled />
<Textarea id="readonly-textarea" label="Read-only textarea" readOnly value="This content cannot be edited" />
```

### Auto-resize

```tsx
<Textarea
  id="auto-resize"
  label="Auto-resize textarea"
  autoResize
  minRows={2}
  maxRows={6}
/>
```

### Helper text

```tsx
<Textarea
  id="with-helper"
  label="With helper text"
  helperText="This is some helpful information"
/>
```

## Accessibility

The Textarea component is built with accessibility in mind:
- Uses proper semantic HTML elements
- Includes label association with the textarea using 'for'/'id'
- Uses appropriate ARIA attributes for validation states
- Associates helper/error text with the textarea using aria-describedby
- Supports keyboard navigation

## Related Components

- Input - For single-line text input
- FormField - For composite form fields with validation
- Select - For dropdown selection 