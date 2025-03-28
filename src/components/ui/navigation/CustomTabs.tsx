import React, { useState } from 'react';
import CustomTabsProps from './CustomTabs';
import CustomTabListProps from './CustomTabs';
import CustomTabProps from './CustomTabs';
import CustomTabPanelsProps from './CustomTabs';
import CustomTabPanelProps from './CustomTabs';
import { cn } from '@/utils/string/utils';

export interface CustomTabsProps {
  children: React.ReactNode;
  defaultTab?: number;
  className?: string;
  onChange?: (index: number) => void;
}

export interface CustomTabListProps {
  children: React.ReactNode;
  className?: string;
}

export interface CustomTabProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface CustomTabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

export interface CustomTabPanelProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

const TabsContext = React.createContext<{
  activeTab: number;
  setActiveTab: (index: number) => void;
}>({
  activeTab: 0,
  setActiveTab: () => {},
});

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
        onClick: () => void setActiveTab(index),
      });
    }
    return child;
  });

  return (
    <div className={cn('flex border-b', className)}>
      {enhancedChildren}
    </div>
  );
};

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
    >
      {children}
    </button>
  );
};

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

export const CustomTabPanel: React.FC<CustomTabPanelProps> = ({
  children,
  className,
  isActive,
}) => {
  if (!isActive) return null;
  
  return (
    <div className={cn('py-4', className)}>
      {children}
    </div>
  );
}; 