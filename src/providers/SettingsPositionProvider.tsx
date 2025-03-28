import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

import SettingsPosition from './SettingsPositionProvider';
import HTMLDivElement from '../components/ui/radio/types/index';
type SettingsPosition = {
  topOffset: number;    // Distance from top of Settings to bottom of viewport
  width: number;        // Width of Settings div
  sidebarVisible: boolean;
};

const SettingsPositionContext = createContext<{
  setSettingsRef: (ref: HTMLDivElement) => void;
  position: SettingsPosition;
}>({
  setSettingsRef: () => {},
  position: { topOffset: 0, width: 0, sidebarVisible: false },
});

export const SettingsPositionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [position, setPosition] = useState<SettingsPosition>({ topOffset: 0, width: 0, sidebarVisible: false });
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (settingsRef.current) {
        const rect = settingsRef.current.getBoundingClientRect();
        const topOffset = window.innerHeight - rect.top;
        setPosition({
          topOffset,
          width: rect.width,
          sidebarVisible: rect.width > 0
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  return (
    <SettingsPositionContext.Provider value={{ setSettingsRef: (ref) => settingsRef.current = ref, position }}>
      {children}
    </SettingsPositionContext.Provider>
  );
};

export const useSettingsPosition = () => useContext(SettingsPositionContext); 