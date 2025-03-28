'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface SettingsPositionContextType {
  isOpen: boolean;
  toggleSettings: () => void;
  closeSettings: () => void;
  openSettings: () => void;
  position: {
    topOffset?: number;
  };
}

// Create the context with default values
const SettingsPositionContext = createContext<SettingsPositionContextType>({
  isOpen: false,
  toggleSettings: () => {},
  closeSettings: () => {},
  openSettings: () => {},
  position: {
    topOffset: undefined
  },
});

// Hook to use the context
export const useSettingsPosition = () => useContext(SettingsPositionContext);

// Provider component
export const SettingsPositionProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ topOffset: 65 });

  const toggleSettings = () => setIsOpen((prev) => !prev);
  const closeSettings = () => setIsOpen(false);
  const openSettings = () => setIsOpen(true);

  return (
    <SettingsPositionContext.Provider
      value={{
        isOpen,
        toggleSettings,
        closeSettings,
        openSettings,
        position,
      }}
    >
      {children}
    </SettingsPositionContext.Provider>
  );
}; 