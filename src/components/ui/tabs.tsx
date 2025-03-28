import React, { useState } from 'react';

interface TabsProps {
  defaultIndex?: number;
  children: React.ReactNode;
  className?: string;
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

interface TabProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

// Context to manage tab state
const TabContext = React.createContext<{
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}>({
  selectedIndex: 0,
  setSelectedIndex: () => {},
});

export const Tabs: React.FC<TabsProps> = ({ 
  defaultIndex = 0, 
  children, 
  className = '' 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  
  return (
    <TabContext.Provider value={{ selectedIndex, setSelectedIndex }}>
      <div className={`${className}`}>
        {children}
      </div>
    </TabContext.Provider>
  );
};

export const TabList: React.FC<TabListProps> = ({ 
  children, 
  className = '' 
}) => {
  const context = React.useContext(TabContext);
  
  return (
    <div className={`flex border-b border-[var(--divider-color)] ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<TabProps>, {
            onClick: () => {
              context.setSelectedIndex(index);
            },
            selected: context.selectedIndex === index,
          });
        }
        return child;
      })}
    </div>
  );
};

export const Tab: React.FC<TabProps> = ({ 
  children, 
  className = '',
  onClick,
  selected = false
}) => {
  return (
    <button 
      className={`px-4 py-2 font-medium ${selected 
        ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' 
        : 'text-[var(--secondary-color)] hover:text-[var(--primary-color)]'} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const TabPanels: React.FC<TabPanelsProps> = ({ 
  children, 
  className = '' 
}) => {
  const { selectedIndex } = React.useContext(TabContext);
  
  return (
    <div className={`mt-4 ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (index === selectedIndex) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

export const TabPanel: React.FC<TabPanelProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
}; 