# MultiSelect

A flexible and feature-rich multi-select dropdown component that allows users to select multiple options from a list.

## Usage

```tsx
import { MultiSelect, MultiSelectOption } from '@/components/ui/atoms/multi-select';
import { useState } from 'react';

function MyComponent() {
  const [selected, setSelected] = useState<string[]>([]);
  
  const options: MultiSelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', group: 'Group 1' },
    { value: 'option4', label: 'Option 4', group: 'Group 1' },
    { value: 'option5', label: 'Option 5', disabled: true },
  ];
  
  return (
    <MultiSelect
      id="my-multi-select"
      label="Select options"
      options={options}
      value={selected}
      onChange={setSelected}
    />
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | Unique identifier for the component |
| size | 'sm' \| 'md' \| 'lg' | 'md' | The size of the multi-select |
| variant | 'default' \| 'outline' \| 'filled' | 'default' | The variant style of the multi-select |
| status | 'default' \| 'error' \| 'success' \| 'warning' | 'default' | The validation status of the multi-select |
| disabled | boolean | false | Whether the multi-select is disabled |
| label | string | undefined | Label for the multi-select |
| showLabel | boolean | true | Whether to show the label |
| placeholder | string | 'Select options...' | Placeholder text when no options are selected |
| helperText | string | undefined | Helper text to display below the multi-select |
| errorMessage | string | undefined | Error message to display when status is 'error' |
| options | MultiSelectOption[] | [] | Array of available options |
| value | string[] | [] | Currently selected values |
| onChange | (value: string[]) => void | - | Callback fired when selection changes |
| maxItems | number | undefined | Maximum number of items that can be selected |
| minItems | number | 0 | Minimum number of items that must be selected |
| clearable | boolean | true | Whether to show a clear button to remove all selections |
| searchable | boolean | true | Whether to enable search filtering of options |
| creatable | boolean | false | Whether to allow creating new options |
| onCreateOption | (inputValue: string) => MultiSelectOption | - | Callback for creating a new option |
| showSelectedAsPills | boolean | true | Whether to show selected items as removable pills |
| groupOptions | boolean | auto | Whether to group options by the group property |
| isLoading | boolean | false | Whether the options are currently loading |
| loadingIndicator | React.ReactNode | - | Custom loading indicator |
| noOptionsMessage | string \| ((inputValue: string) => string) | 'No options available' | Custom no options message |
| closeMenuOnSelect | boolean | false | Whether to close the dropdown after selecting an option |

### MultiSelectOption Interface

| Name | Type | Description |
|------|------|-------------|
| value | string | Unique value for the option |
| label | string | Display label for the option |
| group | string | Optional group this option belongs to |
| disabled | boolean | Whether this option is disabled |
| description | string | Optional description for the option |
| icon | React.ReactNode | Optional icon or image for the option |

## Features

### Sizes

```tsx
<MultiSelect size="sm" id="small" label="Small" options={options} value={selected} onChange={setSelected} />
<MultiSelect size="md" id="medium" label="Medium" options={options} value={selected} onChange={setSelected} /> // Default
<MultiSelect size="lg" id="large" label="Large" options={options} value={selected} onChange={setSelected} />
```

### Variants

```tsx
<MultiSelect variant="default" id="default" label="Default" options={options} value={selected} onChange={setSelected} /> // Default
<MultiSelect variant="outline" id="outline" label="Outline" options={options} value={selected} onChange={setSelected} />
<MultiSelect variant="filled" id="filled" label="Filled" options={options} value={selected} onChange={setSelected} />
```

### Validation Status

```tsx
<MultiSelect status="default" id="default-status" label="Default" options={options} value={selected} onChange={setSelected} /> // Default
<MultiSelect 
  status="error" 
  id="error-status" 
  label="Error" 
  errorMessage="Please select at least one option" 
  options={options} 
  value={selected} 
  onChange={setSelected} 
/>
<MultiSelect status="success" id="success-status" label="Success" options={options} value={selected} onChange={setSelected} />
<MultiSelect status="warning" id="warning-status" label="Warning" options={options} value={selected} onChange={setSelected} />
```

### Option Grouping

```tsx
const groupedOptions = [
  { value: 'option1', label: 'Option 1', group: 'Group A' },
  { value: 'option2', label: 'Option 2', group: 'Group A' },
  { value: 'option3', label: 'Option 3', group: 'Group B' },
  { value: 'option4', label: 'Option 4', group: 'Group B' },
];

<MultiSelect 
  id="grouped" 
  label="Grouped Options" 
  options={groupedOptions}
  value={selected} 
  onChange={setSelected} 
/>
```

### Creatable

```tsx
<MultiSelect 
  id="creatable" 
  label="Create New Options" 
  options={options}
  value={selected} 
  onChange={setSelected}
  creatable
  onCreateOption={(inputValue) => ({ value: inputValue.toLowerCase(), label: inputValue })}
/>
```

### Limiting Selection

```tsx
<MultiSelect 
  id="max-items" 
  label="Select up to 3 options" 
  options={options}
  value={selected} 
  onChange={setSelected}
  maxItems={3}
  helperText={`Selected ${selected.length}/3 options`}
/>

<MultiSelect 
  id="min-items" 
  label="Select at least 2 options" 
  options={options}
  value={selected} 
  onChange={setSelected}
  minItems={2}
  helperText={`Selected ${selected.length} options (minimum 2)`}
/>
```

### Loading State

```tsx
<MultiSelect 
  id="loading" 
  label="Loading Options" 
  options={[]}
  value={selected} 
  onChange={setSelected}
  isLoading
/>
```

## Accessibility

The MultiSelect component is built with accessibility in mind:
- Uses appropriate ARIA attributes for the dropdown and options
- Supports keyboard navigation
- Ensures options are properly labeled and selectable
- Provides visual and textual feedback for selections and errors
- Associates helper/error text with the component
- Handles focus management appropriately

## Related Components

- Select - For single option selection
- Checkbox - For binary selection in a list of options
- FormField - For complete form fields with validation 