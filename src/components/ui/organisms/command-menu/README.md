# Command Menu Component

The Command Menu component is a powerful, keyboard-accessible command palette that enables users to quickly search and execute actions within an application. Inspired by popular command palettes like VS Code's Command Palette (⌘K / Ctrl+K), this component enhances navigation and productivity.

## Features

- **Powerful Search**: Fast filtering of commands as you type
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Grouping Support**: Organize commands into logical groups
- **Shortcuts Display**: Show keyboard shortcuts alongside commands
- **Dark/Light Themes**: Built-in theme support
- **Custom Rendering**: Flexible command item rendering
- **Responsive Design**: Works on mobile and desktop devices
- **Multiple Appearances**: Different visual styles to match your UI
- **Customizable Positioning**: Show at the top or center of the screen
- **Header/Footer Support**: Add custom content above or below commands

## Usage

### Basic Usage

```tsx
import React, { useState } from 'react';
import CommandMenu from '@/components/ui/organisms/command-menu';
import { Command } from '@/components/ui/organisms/command-menu/types';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const commands: Command[] = [
    {
      id: 'home',
      name: 'Go to Home',
      description: 'Navigate to the home page',
      icon: 'fa-home',
      action: () => navigate('/home'),
    },
    {
      id: 'settings',
      name: 'Open Settings',
      description: 'Open application settings',
      icon: 'fa-gear',
      action: () => navigate('/settings'),
    },
    // More commands...
  ];
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Command Menu</button>
      
      <CommandMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        commands={commands}
        placeholder="Search commands..."
      />
    </>
  );
};
```

### With Command Groups

```tsx
import { CommandGroup } from '@/components/ui/organisms/command-menu/types';

const commandGroups: CommandGroup[] = [
  {
    name: 'Navigation',
    commands: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        shortcut: '⌘D',
        action: () => navigate('/dashboard'),
      },
      // More navigation commands...
    ],
  },
  {
    name: 'Actions',
    commands: [
      {
        id: 'new-item',
        name: 'Create New Item',
        shortcut: '⌘N',
        action: () => createNewItem(),
      },
      // More action commands...
    ],
  },
];

// Create a flattened list of all commands (required)
const allCommands = commandGroups.flatMap(group => group.commands);

<CommandMenu
  isOpen={isOpen}
  onClose={handleClose}
  commands={allCommands}
  commandGroups={commandGroups}
  showGroups={true}
/>
```

### Dark Theme and Custom Appearance

```tsx
<CommandMenu
  isOpen={isOpen}
  onClose={handleClose}
  commands={commands}
  isDarkTheme={true}
  appearance="floating"
  position="top"
/>
```

### Custom Rendering

```tsx
const commands = [
  {
    id: 'custom-item',
    name: 'Custom Item',
    action: () => doSomething(),
    renderItem: (command, active) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          backgroundColor: 'green',
          marginRight: '8px',
        }}></div>
        <div>{command.name}</div>
        <div style={{ marginLeft: 'auto', fontSize: '12px' }}>Custom Badge</div>
      </div>
    ),
  },
  // More commands...
];
```

## Props

### CommandMenuProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | Required | Whether the command menu is open |
| `onClose` | `() => void` | Required | Callback when the command menu is closed |
| `commands` | `Command[]` | Required | Array of commands to display |
| `commandGroups` | `CommandGroup[]` | - | Optional array of command groups |
| `placeholder` | `string` | `"Search commands..."` | Placeholder text for search input |
| `position` | `'top' \| 'center'` | `'center'` | Position of the command menu |
| `appearance` | `'default' \| 'minimal' \| 'floating'` | `'default'` | Appearance style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the command menu |
| `className` | `string` | - | Custom class for the container |
| `inputClassName` | `string` | - | Custom class for the search input |
| `commandClassName` | `string` | - | Custom class for each command item |
| `maxResults` | `number` | `10` | Maximum number of results to show |
| `showShortcuts` | `boolean` | `true` | Whether to show keyboard shortcuts |
| `showIcons` | `boolean` | `true` | Whether to show icons |
| `showDescriptions` | `boolean` | `true` | Whether to show descriptions |
| `showGroups` | `boolean` | `true` | Whether to show group headers |
| `closeOnSelect` | `boolean` | `true` | Whether to close the menu on selection |
| `emptyStateLabel` | `string` | `"No results found"` | Label when no results match |
| `initialFilter` | `string` | `""` | Initial filter value |
| `isDarkTheme` | `boolean` | `false` | Whether to use dark theme |
| `headerContent` | `ReactNode` | - | Optional header content |
| `footerContent` | `ReactNode` | - | Optional footer content |
| `filterFunction` | `(command: Command, searchValue: string) => boolean` | - | Custom filter function |

### Command Interface

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Unique ID for the command |
| `name` | `string` | Yes | Command name shown in the menu |
| `description` | `string` | No | Optional description |
| `group` | `string` | No | Group the command belongs to |
| `icon` | `string` | No | FontAwesome icon class |
| `shortcut` | `string` | No | Keyboard shortcut to display |
| `action` | `() => void` | Yes | Action to perform when selected |
| `disabled` | `boolean` | No | Whether the command is disabled |
| `keywords` | `string[]` | No | Additional search keywords |
| `renderItem` | `(command: Command, active: boolean) => ReactNode` | No | Custom render function |

## Appearance Options

### Positions

- `center`: Centered in the middle of the screen
- `top`: Positioned at the top of the screen

### Appearance Styles

- `default`: Standard appearance with border
- `minimal`: Clean, borderless design
- `floating`: Elevated with shadow for a floating appearance

### Sizes

- `sm`: Small width (450px)
- `md`: Medium width (600px)
- `lg`: Large width (800px)

## Examples

For more detailed examples, please refer to the examples directory:

```
src/components/ui/organisms/command-menu/examples/CommandMenuExamples.tsx
```

## Keyboard Navigation

The Command Menu supports the following keyboard shortcuts:

- **Arrow Up/Down**: Navigate between commands
- **Enter**: Execute the selected command
- **Escape**: Close the command menu

## Best Practices

1. **Global Access**: Make the command menu accessible throughout your application with a consistent keyboard shortcut (typically ⌘K or Ctrl+K)

2. **Descriptive Commands**: Ensure commands have clear names and descriptions

3. **Group Related Commands**: Use command groups to organize commands logically

4. **Include Shortcuts**: Display keyboard shortcuts for frequently used commands to improve user experience

5. **Accessibility**: Ensure all commands can be accessed via keyboard navigation

## Styling

The Command Menu component uses CSS variables for easy theming. You can override these in your application's CSS:

```css
.command-menu-container {
  --command-menu-bg: #fff;
  --command-menu-text: #333333;
  --command-menu-secondary-text: #4A5568;
  /* See command-menu.css for all available variables */
}
``` 