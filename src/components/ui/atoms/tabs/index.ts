/**
 * Tabs Component Library
 * 
 * This file exports all Tabs-related components, types, and utilities.
 * 
 * Usage:
 * import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/atoms/navigation/tabs';
 * 
 * Or for custom tabs (with numeric indexes instead of IDs):
 * import { CustomTabs, CustomTabList, CustomTab, CustomTabPanels, CustomTabPanel } from '@/components/ui/atoms/navigation/tabs';
 */

// Export type definitions
export * from './types';

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
} from './basic-tabs';

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
} from './custom-tabs'; 