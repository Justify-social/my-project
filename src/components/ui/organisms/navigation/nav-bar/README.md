# NavigationBar Component

The NavigationBar component is a responsive navigation bar that provides a consistent way to navigate throughout the application. It supports both desktop and mobile views, dropdown menus, and customization options.

## Features

- Responsive design with mobile menu support
- Support for dropdown menus
- Customizable appearance with multiple variants
- Badge support for navigation items
- Integration with the standardized Icon component
- Accessibility features

## Usage

```tsx
import { NavigationBar } from '@/components/ui/organisms/navigation/nav-bar';

function MyComponent() {
  return (
    <NavigationBar 
      logo={<Logo />}
      items={[
        { id: 'home', label: 'Home', href: '/', icon: 'faHome', isActive: true },
        { id: 'about', label: 'About', href: '/about', icon: 'faInfoCircle' },
        { 
          id: 'products', 
          label: 'Products', 
          href: '/products', 
          icon: 'faBoxes',
          children: [
            { id: 'new', label: 'New Arrivals', href: '/products/new' },
            { id: 'featured', label: 'Featured', href: '/products/featured' },
          ]
        },
        { id: 'contact', label: 'Contact', href: '/contact', icon: 'faEnvelope', badge: 'New' },
      ]}
      rightContent={<UserMenu />}
    />
  );
}
```

## Props

### NavigationBarProps

| Name | Type | Default | Description |
|------|------|---------|-------------|
| logo | ReactNode | - | Logo content to display in the navigation bar |
| items | NavItem[] | - | Main navigation items |
| rightContent | ReactNode | - | Additional content to display on the right side |
| mobileMenuEnabled | boolean | true | Whether to show a mobile menu toggle button |
| className | string | - | Custom class name for the navigation bar |
| variant | 'default' \| 'transparent' \| 'subtle' | 'default' | Variant of the navigation bar |
| position | 'relative' \| 'fixed' \| 'sticky' | 'relative' | Position of the navigation bar |
| withShadow | boolean | true | Whether to show a shadow |
| onItemClick | (item: NavItem) => void | - | Callback for when a navigation item is clicked |

### NavItem

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | Unique identifier for the navigation item |
| label | string | - | Display label for the navigation item |
| href | string | - | URL to navigate to when clicked |
| icon | string | - | Icon name to display (uses the standardized Icon component) |
| isActive | boolean | false | Whether the item is currently active |
| isDisabled | boolean | false | Whether the item is disabled |
| badge | string \| number | - | Optional badge text or count to display |
| children | NavItem[] | - | Children navigation items (for dropdown menus) |

## Variants

### Default

The default variant shows a white background with a border and shadow. It's suitable for most applications and provides good contrast with content.

### Transparent

The transparent variant has no background and is designed to be used on top of images or colored backgrounds. Text is white by default for better visibility.

### Subtle

The subtle variant has a light gray background and is designed to be less prominent than the default variant. It's suitable for secondary navigation or when you want a more subtle appearance.

## Accessibility

The NavigationBar component is built with accessibility in mind:

- Proper ARIA attributes for the navigation and menu items
- Keyboard navigation support
- Focus management for mobile menu
- Screen reader friendly

## Examples

See the examples directory for comprehensive demonstrations of the NavigationBar component:

```tsx
import { NavigationBarExamples } from '@/components/ui/organisms/navigation/nav-bar/examples';

// Renders a showcase of the NavigationBar component with various configurations
``` 