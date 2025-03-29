/**
 * @deprecated This file is deprecated. Import from '@/components/ui/atoms/navigation/tabs' instead.
 * This file is maintained for backward compatibility.
 */

// Export basic tabs components
export {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  type TabsProps,
  type TabListProps,
  type TabProps,
  type TabPanelsProps,
  type TabPanelProps,
  type TabsVariant,
  type TabsAlign
} from './atoms/navigation/tabs/basic-tabs';

// Export custom tabs components 
export {
  CustomTabs,
  CustomTabList,
  CustomTab,
  CustomTabPanels,
  CustomTabPanel,
  type CustomTabsProps,
  type CustomTabListProps,
  type CustomTabProps,
  type CustomTabPanelsProps,
  type CustomTabPanelProps
} from './atoms/navigation/tabs/custom-tabs';

// Legacy exports
export * from './molecules/Tabs/Tabs';
