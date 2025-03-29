/**
 * @deprecated This component has been moved to src/components/ui/molecules/Tabs/basic-tabs
 * Please import from @/components/ui/molecules/Tabs/basic-tabs instead.
 */

import { 
  Tabs as BasicTabs,
  TabList as BasicTabList,
  Tab as BasicTab,
  TabPanels as BasicTabPanels,
  TabPanel as BasicTabPanel,
  type TabsProps,
  type TabListProps,
  type TabProps,
  type TabPanelsProps,
  type TabPanelProps,
  type TabsVariant,
  type TabsAlign
} from '../molecules/Tabs/basic-tabs';

// Re-export for backward compatibility
export { TabsVariant, TabsAlign };
export type { TabsProps, TabListProps, TabProps, TabPanelsProps, TabPanelProps };

export function Tabs(props: TabsProps) {
  return <BasicTabs {...props} />;
}

export function TabList(props: TabListProps) {
  return <BasicTabList {...props} />;
}

export function Tab(props: TabProps) {
  return <BasicTab {...props} />;
}

export function TabPanels(props: TabPanelsProps) {
  return <BasicTabPanels {...props} />;
}

export function TabPanel(props: TabPanelProps) {
  return <BasicTabPanel {...props} />;
}