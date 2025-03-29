'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/string/utils';

export interface CustomTabsProps {
  /**
   * Child elements (typically CustomTabList and CustomTabPanels)
   */
  children: React.ReactNode;

  /**
   * Index of the tab that should be active by default
   */
  defaultTab?: number;

  /**
   * Additional className for the root element
   */
  className?: string;

  /**
   * Callback fired when the active tab changes
   */
  onChange?: (index: number) => void;
}

export interface CustomTabListProps {
  /**
   * Child elements (typically CustomTab components)
   */
  children: React.ReactNode;

  /**
   * Additional className for the tab list container
   */
  className?: string;
}

export interface CustomTabProps {
  /**
   * Content of the tab
   */
  children: React.ReactNode;

  /**
   * Additional className for the tab button
   */
  className?: string;

  /**
   * Whether this tab is currently active
   * @internal This is set automatically by CustomTabList
   */
  isActive?: boolean;

  /**
   * Callback fired when the tab is clicked
   * @internal This is set automatically by CustomTabList
   */
  onClick?: () => void;
}

export interface CustomTabPanelsProps {
  /**
   * Child elements (typically CustomTabPanel components)
   */
  children: React.ReactNode;

  /**
   * Additional className for the tab panels container
   */
  className?: string;
}

export interface CustomTabPanelProps {
  /**
   * Content of the tab panel
   */
  children: React.ReactNode;

  /**
   * Additional className for the tab panel
   */
  className?: string;

  /**
   * Whether this panel is currently active
   * @internal This is set automatically by CustomTabPanels
   */
  isActive?: boolean;
}

/**
 * Context to manage tab state
 */
const TabsContext = React.createContext<{
  activeTab: number;
  setActiveTab: (index: number) => void;
}>({
  activeTab: 0,
  setActiveTab: () => {},
});

/**
 * CustomTabs is a compound component for creating tabbed interfaces
 */
export const CustomTabs: React.FC<CustomTabsProps> = ({
  children,
  defaultTab = 0,
  className,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    if (onChange) onChange(index);
  };

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab: handleTabChange,
      }}
    >
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

/**
 * CustomTabList renders a container for tab buttons
 */
export const CustomTabList: React.FC<CustomTabListProps> = ({
  children,
  className,
}) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);

  // Clone children to add props
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<CustomTabProps>, {
        isActive: index === activeTab,
        onClick: () => setActiveTab(index),
      });
    }
    return child;
  });

  return (
    <div className={cn('flex border-b', className)} role="tablist">
      {enhancedChildren}
    </div>
  );
};

/**
 * CustomTab renders an individual tab button
 */
export const CustomTab: React.FC<CustomTabProps> = ({
  children,
  className,
  isActive,
  onClick,
}) => {
  return (
    <button
      className={cn(
        'px-4 py-2 font-medium text-gray-600 hover:text-blue-600 border-b-2 focus:outline-none transition-colors',
        isActive 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent',
        className
      )}
      onClick={onClick}
      type="button"
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};

/**
 * CustomTabPanels renders a container for tab panel content
 */
export const CustomTabPanels: React.FC<CustomTabPanelsProps> = ({
  children,
  className,
}) => {
  const { activeTab } = React.useContext(TabsContext);

  // Clone children to add props
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<CustomTabPanelProps>, {
        isActive: index === activeTab,
      });
    }
    return child;
  });

  return (
    <div className={cn('mt-2', className)}>
      {enhancedChildren}
    </div>
  );
};

/**
 * CustomTabPanel renders the content for an individual tab
 */
export const CustomTabPanel: React.FC<CustomTabPanelProps> = ({
  children,
  className,
  isActive,
}) => {
  if (!isActive) return null;
  
  return (
    <div 
      className={cn('py-4', className)}
      role="tabpanel"
    >
      {children}
    </div>
  );
};

export default CustomTabs; 