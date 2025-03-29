# CustomTabs Component

A flexible, compound component for creating tabbed interfaces with full customization control.

## Features

- Compound component pattern for maximum flexibility
- Automatic state management for active tabs
- Context-based sharing of tab state between components
- Fully customizable styling
- TypeScript support for all components

## Components

This tabbed interface system consists of several components that work together:

- `CustomTabs`: The root container component that manages tab state
- `CustomTabList`: Container for tab buttons/triggers
- `CustomTab`: Individual tab button/trigger
- `CustomTabPanels`: Container for tab content panels
- `CustomTabPanel`: Individual content panel for a tab

## Usage

```tsx
import { 
  CustomTabs, 
  CustomTabList, 
  CustomTab, 
  CustomTabPanels, 
  CustomTabPanel 
} from '@/components/ui/molecules/tabs/custom-tabs';

// Basic usage
function TabsExample() {
  return (
    <CustomTabs defaultTab={0} onChange={(index) => console.log(`Tab ${index} selected`)}>
      <CustomTabList>
        <CustomTab>First Tab</CustomTab>
        <CustomTab>Second Tab</CustomTab>
        <CustomTab>Third Tab</CustomTab>
      </CustomTabList>
      
      <CustomTabPanels>
        <CustomTabPanel>
          <h3>First Tab Content</h3>
          <p>This is the content for the first tab.</p>
        </CustomTabPanel>
        
        <CustomTabPanel>
          <h3>Second Tab Content</h3>
          <p>This is the content for the second tab.</p>
        </CustomTabPanel>
        
        <CustomTabPanel>
          <h3>Third Tab Content</h3>
          <p>This is the content for the third tab.</p>
        </CustomTabPanel>
      </CustomTabPanels>
    </CustomTabs>
  );
}

// With custom styling
function CustomStyledTabs() {
  return (
    <CustomTabs>
      <CustomTabList className="bg-gray-100 p-2 rounded-t-lg">
        <CustomTab className="font-bold">Tab 1</CustomTab>
        <CustomTab className="text-red-500">Tab 2</CustomTab>
      </CustomTabList>
      
      <CustomTabPanels className="bg-gray-50 p-4 rounded-b-lg">
        <CustomTabPanel className="animate-fadeIn">
          First tab content
        </CustomTabPanel>
        <CustomTabPanel>
          Second tab content
        </CustomTabPanel>
      </CustomTabPanels>
    </CustomTabs>
  );
}
```

## Props

### CustomTabs Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| defaultTab | number | 0 | Index of the initially active tab |
| onChange | (index: number) => void | undefined | Callback fired when active tab changes |
| className | string | undefined | Additional CSS classes |

### CustomTabList/CustomTabPanels Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | undefined | Additional CSS classes |

### CustomTab/CustomTabPanel Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | undefined | Additional CSS classes |

## Accessibility

The component implements proper ARIA attributes:
- Uses `role="tablist"` for the tab list
- Uses `role="tab"` and `aria-selected` for tabs
- Uses `role="tabpanel"` for tab panels 