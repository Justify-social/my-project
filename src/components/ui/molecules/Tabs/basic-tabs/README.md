# Tabs Component

A flexible, compound component for creating tabbed interfaces with multiple styling variants. The Tabs component system provides an intuitive API for creating tabbed interfaces with full customization control.

## Features

- **Multiple Variants**: Support for underline, pills, enclosed, and button tab styles
- **Alignment Control**: Tabs can be aligned to start, center, end, or full width
- **Automatic State Management**: Manages active tab state internally
- **Context-Based**: Uses React Context to share tab state between components
- **Accessibility**: Implements proper ARIA attributes for screen readers
- **Customizable Styling**: Classes can be customized at every level
- **TypeScript Support**: Full TypeScript interfaces for type safety

## Components

The Tabs system consists of five main components:

1. `Tabs`: The container component that provides context to all children
2. `TabList`: Contains the list of tab buttons
3. `Tab`: Individual tab button component
4. `TabPanels`: Container for tab content panels
5. `TabPanel`: Individual panel component for tab content

## Usage

```tsx
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/molecules/tabs/basic-tabs';

function MyTabbedComponent() {
  return (
    <Tabs defaultTab="tab1" variant="underline" onChange={(tabId) => console.log(`Active tab: ${tabId}`)}>
      <TabList align="center">
        <Tab id="tab1">First Tab</Tab>
        <Tab id="tab2">Second Tab</Tab>
        <Tab id="tab3" disabled>Disabled Tab</Tab>
      </TabList>
      
      <TabPanels>
        <TabPanel id="tab1">
          <h3>First Tab Content</h3>
          <p>This is the content for tab 1.</p>
        </TabPanel>
        
        <TabPanel id="tab2">
          <h3>Second Tab Content</h3>
          <p>This is the content for tab 2.</p>
        </TabPanel>
        
        <TabPanel id="tab3">
          <p>This content won't be shown until tab is enabled.</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
```

## Props

### Tabs

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Child components (TabList and TabPanels) |
| defaultTab | string | '' | ID of the tab that should be active initially |
| variant | 'underline' \| 'pills' \| 'enclosed' \| 'button' | 'underline' | The visual style of the tabs |
| align | 'start' \| 'center' \| 'end' \| 'full' | 'start' | Alignment of tabs in the tab list |
| className | string | - | Additional class names for the container |
| tabListClassName | string | - | Additional class names for the tab list |
| tabPanelsClassName | string | - | Additional class names for the tab panels |
| onChange | (tabId: string) => void | - | Callback function when active tab changes |

### TabList

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Tab components |
| className | string | - | Additional class names |
| align | 'start' \| 'center' \| 'end' \| 'full' | 'start' | Alignment of tabs |

### Tab

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Tab content (label) |
| id | string | - | Unique identifier for the tab (must match TabPanel id) |
| className | string | - | Additional class names |
| disabled | boolean | false | Whether the tab is disabled |

### TabPanels

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | TabPanel components |
| className | string | - | Additional class names |

### TabPanel

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Content to show when tab is active |
| id | string | - | Unique identifier (must match Tab id) |
| className | string | - | Additional class names |

## Accessibility

The Tabs component implements proper ARIA roles and attributes for accessibility:

- `role="tablist"` on the TabList component
- `role="tab"` on individual Tab components
- `aria-selected` to indicate the active tab
- `role="tabpanel"` on TabPanel components
- `aria-labelledby` and `aria-controls` to connect tabs with their panels
- `tabIndex` management for keyboard navigation 