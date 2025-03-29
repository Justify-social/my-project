# Button Components

A collection of button components designed for consistent user interactions across the application. Buttons enable users to trigger actions, submit forms, navigate, and make choices.

## Components

- **Button**: Primary button component with multiple variants and sizes
- **ButtonWithIcon**: Button with dedicated icon placement (left or right)
- **IconButton**: Button that displays only an icon with proper accessibility
- **ActionButtons**: Group of action buttons for common actions (save, cancel, etc.)

## Button Component

The core Button component provides a flexible and customizable button with various visual styles, sizes, and states.

### Usage

```tsx
import { Button } from '@/components/ui/atoms/button';

function ButtonExample() {
  return (
    <div className="space-y-4">
      {/* Basic button with default style */}
      <Button onClick={() => alert('Clicked!')}>
        Click Me
      </Button>

      {/* Different variants */}
      <Button variant="default">Default Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="ghost">Ghost Button</Button>
      <Button variant="link">Link Button</Button>
      <Button variant="destructive">Destructive Button</Button>
      <Button variant="danger">Danger Button</Button>

      {/* Different sizes */}
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>

      {/* Loading state */}
      <Button loading>Loading...</Button>

      {/* Disabled state */}
      <Button disabled>Disabled</Button>

      {/* Full width */}
      <Button fullWidth>Full Width Button</Button>
    </div>
  );
}
```

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link' \| 'danger' | 'default' | Visual style of the button |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Size of the button |
| loading | boolean | false | Shows a loading spinner and disables the button |
| leftIcon | ReactNode | - | Icon element to display before the button text |
| rightIcon | ReactNode | - | Icon element to display after the button text |
| fullWidth | boolean | false | Makes the button take up 100% of available width |
| disabled | boolean | false | Disables the button |

Plus all standard HTML button attributes.

## ButtonWithIcon

Button with dedicated icon placement and proper spacing.

### Usage

```tsx
import { ButtonWithIcon } from '@/components/ui/atoms/button';
import { Icon } from '@/components/ui/atoms/icons';

function ButtonWithIconExample() {
  return (
    <div className="space-y-4">
      <ButtonWithIcon 
        icon={<Icon name="faPlus" />} 
        iconPosition="left"
      >
        Add Item
      </ButtonWithIcon>

      <ButtonWithIcon 
        icon={<Icon name="faArrowRight" />} 
        iconPosition="right"
        variant="secondary"
      >
        Continue
      </ButtonWithIcon>
    </div>
  );
}
```

## IconButton

Button that displays only an icon with proper accessibility.

### Usage

```tsx
import { IconButton } from '@/components/ui/atoms/button';
import { Icon } from '@/components/ui/atoms/icons';

function IconButtonExample() {
  return (
    <div className="space-x-4">
      <IconButton 
        icon={<Icon name="faTrash" />} 
        aria-label="Delete item"
        variant="danger"
      />

      <IconButton 
        icon={<Icon name="faEdit" />} 
        aria-label="Edit item"
      />
    </div>
  );
}
```

## ActionButtons

Group of action buttons for common actions.

### Usage

```tsx
import { ActionButtons } from '@/components/ui/atoms/button';

function ActionButtonsExample() {
  return (
    <ActionButtons 
      onCancel={() => console.log('Cancelled')}
      onSave={() => console.log('Saved')}
      saveText="Save Changes"
      cancelText="Discard"
      loading={false}
    />
  );
}
```

## Accessibility

- All buttons maintain a minimum touch target size of 44×44 pixels
- Loading states are properly communicated to screen readers
- IconButtons require an aria-label for screen reader accessibility
- Focus states are clearly visible for keyboard navigation
- Disabled states are properly styled and communicated to assistive technology
