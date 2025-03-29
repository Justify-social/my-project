# Command Menu

The Command Menu component provides a keyboard-driven navigation interface similar to Command Palette (⌘K or Ctrl+K) patterns popular in modern applications. It offers a searchable, keyboard-navigable command list that enhances navigation efficiency for power users.

## Features

- **Keyboard Accessibility**: Open with ⌘K or Ctrl+K, navigate with arrow keys, select with Enter
- **Search Functionality**: Filter commands as you type
- **Command Grouping**: Organize commands into logical categories
- **Custom Command Icons**: Support for icons/emojis for visual recognition
- **Command Shortcuts**: Display keyboard shortcuts for commands
- **Command Descriptions**: Add helpful descriptions for each command
- **Responsive Design**: Works well on both desktop and mobile
- **Theme Support**: Dark and light mode compatibility
- **Fully Customizable**: Extend with your own UI elements if needed

## Usage

```tsx
import { useState } from 'react';
import { CommandMenu } from '@/components/ui/molecules/command-menu';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  const commandGroups = [
    {
      title: 'Navigation',
      commands: [
        {
          id: 'dashboard',
          name: 'Go to Dashboard',
          icon: <span>🏠</span>,
          description: 'Navigate to the main dashboard',
          onSelect: () => console.log('Navigating to dashboard')
        },
        // More commands...
      ]
    },
    // More groups...
  ];

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Command Menu
      </button>
      
      <CommandMenu
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        commandGroups={commandGroups}
      />
    </>
  );
}
```

## Props

### CommandMenu Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | (required) | Whether the command menu is open |
| `onOpen` | () => void | (required) | Function to call when opening the menu |
| `onClose` | () => void | (required) | Function to call when closing the menu |
| `commandGroups` | CommandGroup[] | [] | Array of command groups to display |
| `placeholder` | string | 'Search commands...' | Placeholder text for the search input |
| `shortcut` | string | '⌘K' | Keyboard shortcut to display |
| `width` | 'sm' \| 'md' \| 'lg' \| 'full' | 'md' | Width of the command menu |
| `className` | string | - | Additional CSS classes |
| `children` | ReactNode | - | Custom children to render instead of default UI |

### CommandGroup Type

| Name | Type | Description |
|------|------|-------------|
| `title` | string | Title of the command group |
| `commands` | Command[] | Array of commands in this group |

### Command Type

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the command |
| `name` | string | Display name of the command |
| `icon` | ReactNode \| (() => ReactNode) | Icon to display for the command |
| `description` | string | Short description of what the command does |
| `shortcut` | string | Keyboard shortcut for this command if applicable |
| `onSelect` | () => void | Function to execute when this command is selected |
| `tags` | string[] | Tags for filtering commands |

## Advanced Usage

### Custom Trigger Button

```tsx
<div 
  className="flex items-center space-x-2 border rounded px-3 py-2"
  onClick={() => setIsOpen(true)}
>
  <svg className="w-4 h-4">
    {/* Search icon */}
  </svg>
  <span>Search commands...</span>
  <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">⌘K</kbd>
</div>

<CommandMenu
  isOpen={isOpen}
  onOpen={() => setIsOpen(true)}
  onClose={() => setIsOpen(false)}
  commandGroups={commandGroups}
/>
```

### Custom Width

```tsx
<CommandMenu
  isOpen={isOpen}
  onOpen={() => setIsOpen(true)}
  onClose={() => setIsOpen(false)}
  commandGroups={commandGroups}
  width="lg" // Options: 'sm', 'md', 'lg', 'full'
/>
```

### Dynamic Command Groups

```tsx
// Generated command groups based on data
const navigationCommands = pages.map(page => ({
  id: page.slug,
  name: page.title,
  icon: page.icon,
  description: page.description,
  onSelect: () => router.push(page.path)
}));

const commandGroups = [
  {
    title: 'Navigation',
    commands: navigationCommands
  },
  // Other groups...
];
```

### Custom Render

```tsx
<CommandMenu
  isOpen={isOpen}
  onOpen={() => setIsOpen(true)}
  onClose={() => setIsOpen(false)}
>
  <div className="p-4">
    <h2 className="text-xl font-bold">Custom Command UI</h2>
    {/* Your custom UI here */}
  </div>
</CommandMenu>
```

## Accessibility

The CommandMenu component follows accessibility best practices:

- Fully keyboard navigable
- Proper focus management
- ARIA attributes for screen readers
- High contrast for visibility
- Responsive design for all devices

## Notes

- The command menu is rendered in a portal at the document body level
- Keyboard shortcuts are automatically bound when the component is mounted
- The menu is designed to work in both dark and light modes 