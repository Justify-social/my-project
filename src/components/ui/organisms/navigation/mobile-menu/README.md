# Mobile Menu Component

A responsive slide-in navigation menu for mobile devices with support for nested navigation items and touch-friendly interactions.

## Features

- Slide-in animation from the right side
- Overlay background for focus on the menu
- Support for nested navigation with expandable sections
- Keyboard accessibility (escape key to close)
- Touch-friendly interaction design
- Scroll locking to prevent page scrolling when menu is open
- Customizable header and footer content

## Usage

```tsx
import { MobileMenu } from '@/components/ui/organisms/navigation/mobile-menu';
import { SidebarItem } from '@/components/ui/organisms/navigation/sidebar';

function MyComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigationItems: SidebarItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: 'fa-home',
      isActive: true
    },
    {
      id: 'products',
      label: 'Products',
      href: '#',
      icon: 'fa-box',
      children: [
        {
          id: 'product-a',
          label: 'Product A',
          href: '/products/a'
        },
        {
          id: 'product-b',
          label: 'Product B',
          href: '/products/b'
        }
      ]
    }
  ];
  
  return (
    <>
      <button onClick={() => setIsMenuOpen(true)}>
        Open Menu
      </button>
      
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={navigationItems}
        header={<Logo />}
        footer={<UserProfile />}
      />
    </>
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | boolean | required | Whether the mobile menu is open |
| onClose | () => void | required | Function to call when the menu should close |
| items | SidebarItem[] | required | Navigation items to display in the menu |
| header | ReactNode | undefined | Content to display in the menu header |
| footer | ReactNode | undefined | Content to display in the menu footer |
| className | string | undefined | Additional CSS classes for the menu |
| onItemClick | (item: SidebarItem) => void | undefined | Function to call when a menu item is clicked |

## Accessibility

- Uses `aria-modal="true"` and `role="dialog"` for screen reader support
- Closes when the Escape key is pressed
- Proper focus management
- Slide-in animation for visual indication of opening/closing
- All interactive elements are properly labeled
- Sufficient color contrast for text elements

## Related Components

- [Sidebar](/src/components/ui/organisms/navigation/sidebar) - Desktop navigation sidebar
- [NavigationBar](/src/components/ui/organisms/navigation/nav-bar) - Top navigation bar component 