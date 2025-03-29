'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/utils/string/utils';

export type TabsVariant = 'underline' | 'pills' | 'enclosed' | 'button';
export type TabsAlign = 'start' | 'center' | 'end' | 'full';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: TabsVariant;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps {
  children: React.ReactNode;
  defaultTab?: string;
  variant?: TabsVariant;
  align?: TabsAlign;
  className?: string;
  tabListClassName?: string;
  tabPanelsClassName?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({
  children,
  defaultTab,
  variant = 'underline',
  align = 'start',
  className,
  tabListClassName,
  tabPanelsClassName,
  onChange
}: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange, variant }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
  align?: TabsAlign;
}

export function TabList({ children, className, align = 'start' }: TabListProps) {
  const tabsContext = useContext(TabsContext);

  if (!tabsContext) {
    throw new Error('TabList must be used within a Tabs component');
  }

  const { variant } = tabsContext;

  return (
    <div
      className={cn(
        'flex',
        {
          'border-b border-gray-200': variant === 'underline',
          'bg-gray-100 p-1 rounded-md': variant === 'pills',
          'border-b border-gray-200 rounded-t-md': variant === 'enclosed',
          'space-x-1': variant === 'button'
        },
        {
          'justify-start': align === 'start',
          'justify-center': align === 'center',
          'justify-end': align === 'end',
          'w-full': align === 'full'
        },
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export interface TabProps {
  children: React.ReactNode;
  id: string;
  className?: string;
  disabled?: boolean;
}

export function Tab({ children, id, className, disabled = false }: TabProps) {
  const tabsContext = useContext(TabsContext);

  if (!tabsContext) {
    throw new Error('Tab must be used within a Tabs component');
  }

  const { activeTab, setActiveTab, variant } = tabsContext;
  const isActive = activeTab === id;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(id);
    }
  };

  return (
    <button
      className={cn(
        'px-4 py-2.5 text-sm font-medium focus:outline-none transition-all',
        {
          // Underline variant
          'text-[#3182CE] border-b-2 border-[#3182CE]': isActive && variant === 'underline',
          'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300': !isActive && variant === 'underline',

          // Pills variant
          'bg-white text-[#3182CE] shadow rounded-md': isActive && variant === 'pills',
          'text-gray-500 hover:text-gray-700': !isActive && variant === 'pills',

          // Enclosed variant
          'border-t border-l border-r border-gray-200 rounded-t-md -mb-px bg-white': isActive && variant === 'enclosed',
          'text-gray-500 hover:text-gray-700 bg-transparent': !isActive && variant === 'enclosed',

          // Button variant
          'bg-[#3182CE] text-white': isActive && variant === 'button',
          'bg-gray-100 text-gray-700 hover:bg-gray-200': !isActive && variant === 'button',
          'rounded': variant === 'button',

          // Disabled state
          'opacity-50 cursor-not-allowed': disabled
        },
        className
      )}
      onClick={handleClick}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
    >
      {children}
    </button>
  );
}

export interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanels({ children, className }: TabPanelsProps) {
  return (
    <div className={cn('mt-4', className)}>
      {children}
    </div>
  );
}

export interface TabPanelProps {
  children: React.ReactNode;
  id: string;
  className?: string;
}

export function TabPanel({ children, id, className }: TabPanelProps) {
  const tabsContext = useContext(TabsContext);

  if (!tabsContext) {
    throw new Error('TabPanel must be used within a Tabs component');
  }

  const { activeTab } = tabsContext;
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      className={cn('focus:outline-none', className)}
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
} 