# Sidebar Component

A responsive, collapsible sidebar for application navigation with support for nested menu items and mobile functionality.

## Features

- Responsive design that adapts to desktop and mobile viewports
- Collapsible sidebar with toggle button
- Nested navigation with expandable sections
- Customizable header and footer content
- Support for icons, badges, and active states
- Accessible keyboard navigation

## Usage

```tsx
import { Sidebar, SidebarItem } from '@/components/ui/organisms/navigation/sidebar';

function MyComponent() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const items: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'fa-home',
      isActive: true
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '#',
      icon: 'fa-gear',
      children: [
        {
          id: 'profile',
          label: 'Profile',
          href: '/settings/profile'
        },
        {
          id: 'team',
          label: 'Team',
          href: '/settings/team'
        }
      ]
    }
  ];
  
  return (
    <Sidebar
      items={items}
      header={<YourHeaderComponent />}
      footer={<YourFooterComponent />}
      isCollapsed={isCollapsed}
      isMobileOpen={isMobileOpen}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      onMobileClose={() => setIsMobileOpen(false)}
    />
  );
}
```

## Props

### SidebarProps

| Name | Type | Default | Description |
|------|------|---------|-------------|
| items | SidebarItem[] | required | Navigation items to display in the sidebar |
| header | ReactNode | undefined | Content to display in the sidebar header |
| footer | ReactNode | undefined | Content to display in the sidebar footer |
| isCollapsed | boolean | false | Whether the sidebar is in its collapsed state |
| isMobileOpen | boolean | false | Whether the sidebar is open on mobile devices |
| onToggleCollapse | () => void | undefined | Function to call when the collapse toggle is clicked |
| onMobileClose | () => void | undefined | Function to call when the mobile sidebar should close |
| className | string | undefined | Additional CSS classes for the sidebar |
| width | string | '240px' | Width of the expanded sidebar |
| collapsedWidth | string | '64px' | Width of the collapsed sidebar |
| onItemClick | (item: SidebarItem) => void | undefined | Function to call when a navigation item is clicked |

### SidebarItem

| Name | Type | Description |
|------|------|-------------|
| id | string | Unique identifier for the item |
| label | string | Display text for the item |
| href | string | URL the item links to |
| icon | string | Optional icon name (FontAwesome) |
| isActive | boolean | Whether the item is currently active |
| isDisabled | boolean | Whether the item is disabled |
| badge | string \| number | Optional badge to display (e.g., notification count) |
| children | SidebarItem[] | Nested navigation items |

## Accessibility

- All interactive elements are keyboard navigable
- Proper ARIA attributes for expanded/collapsed states
- Focus management for mobile navigation
- Screen reader announcements for state changes
- Sufficient color contrast for all text elements

## Examples

See `examples/SidebarExamples.tsx` for complete implementation examples. 