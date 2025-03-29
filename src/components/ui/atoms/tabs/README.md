# Tabs Component

A versatile tabbed interface component for organizing content into selectable sections. The Tabs component provides both standard tabs (with string IDs) and custom tabs (with numeric indexes).

## Basic Tabs Usage

Basic tabs use string identifiers for each tab and provide styling variants.

```tsx
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/atoms/navigation/tabs';

function MyComponent() {
  return (
    <Tabs defaultTab="tab1">
      <TabList>
        <Tab id="tab1">First Tab</Tab>
        <Tab id="tab2">Second Tab</Tab>
        <Tab id="tab3">Third Tab</Tab>
      </TabList>
      <TabPanels>
        <TabPanel id="tab1">First Tab Content</TabPanel>
        <TabPanel id="tab2">Second Tab Content</TabPanel>
        <TabPanel id="tab3">Third Tab Content</TabPanel>
      </TabPanels>
    </Tabs>
  );
}
```

## Custom Tabs Usage

Custom tabs use numeric indices for identification.

```tsx
import { CustomTabs, CustomTabList, CustomTab, CustomTabPanels, CustomTabPanel } from '@/components/ui/atoms/navigation/tabs';

function MyComponent() {
  return (
    <CustomTabs defaultTab={0}>
      <CustomTabList>
        <CustomTab>First Tab</CustomTab>
        <CustomTab>Second Tab</CustomTab>
        <CustomTab>Third Tab</CustomTab>
      </CustomTabList>
      <CustomTabPanels>
        <CustomTabPanel>First Tab Content</CustomTabPanel>
        <CustomTabPanel>Second Tab Content</CustomTabPanel>
        <CustomTabPanel>Third Tab Content</CustomTabPanel>
      </CustomTabPanels>
    </CustomTabs>
  );
}
```

## Basic Tabs Props

### Tabs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| defaultTab | string | '' | The ID of the tab to select by default |
| variant | 'underline' \| 'pills' \| 'enclosed' \| 'button' | 'underline' | The visual style of the tabs |
| align | 'start' \| 'center' \| 'end' \| 'full' | 'start' | The alignment of the tabs |
| className | string | | Additional CSS classes |
| onChange | (tabId: string) => void | | Callback when a tab is selected |

### Tab

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | | Unique identifier for the tab |
| className | string | | Additional CSS classes |
| disabled | boolean | false | Whether the tab is disabled |

### TabPanel

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | string | | Unique identifier matching a Tab id |
| className | string | | Additional CSS classes |

## Custom Tabs Props

### CustomTabs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| defaultTab | number | 0 | The index of the tab to select by default |
| className | string | | Additional CSS classes |
| onChange | (index: number) => void | | Callback when a tab is selected |

### CustomTab

| Name | Type | Default | Description |
|------|------|---------|-------------|
| className | string | | Additional CSS classes |

### CustomTabPanel

| Name | Type | Default | Description |
|------|------|---------|-------------|
| className | string | | Additional CSS classes |

## Accessibility

Both tab implementations follow WAI-ARIA guidelines for tabbed interfaces:
- Proper `role="tablist"`, `role="tab"`, and `role="tabpanel"` attributes
- `aria-selected` states to indicate the active tab
- Keyboard navigation support
- Focus management

## Tab Variants

The basic Tabs component supports several styling variants:

1. **Underline** (default): Tabs with an underline indicator
2. **Pills**: Tabs that look like pill buttons
3. **Enclosed**: Tabs that connect with the content area
4. **Button**: Tabs that look like standard buttons 