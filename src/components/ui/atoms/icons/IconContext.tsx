'use client';

import React, { createContext, useContext } from 'react';
import { IconSize, IconStyle } from './types';

/**
 * Icon Context for global icon settings
 * Makes it easy to configure default behaviors across the app
 */
interface IconContextType {
  defaultSize: IconSize;
  defaultVariant: IconStyle;
  fallbackIcon: string;
}

// Initial defaults
const defaultContext: IconContextType = {
  defaultSize: 'md',
  defaultVariant: 'light',
  fallbackIcon: 'question',
};

// Create context with defaults
export const IconContext = createContext<IconContextType>(defaultContext);

// Hook for easy context usage
export const useIconContext = () => useContext(IconContext);

// Provider component
export interface IconProviderProps {
  children: React.ReactNode;
  defaultSize?: IconSize;
  defaultVariant?: IconStyle;
  fallbackIcon?: string;
}

export const IconProvider: React.FC<IconProviderProps> = ({
  children,
  defaultSize = 'md',
  defaultVariant = 'light',
  fallbackIcon = 'question',
}) => {
  return (
    <IconContext.Provider value={{ defaultSize, defaultVariant, fallbackIcon }}>
      {children}
    </IconContext.Provider>
  );
};

/**
 * Default export for IconContext
 */
export default IconContext;
