'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { IconVariant } from './icon-types';

/**
 * Icon Context for global icon settings
 * Makes it easy to configure default behaviors across the app
 * 
 * This context follows the Single Source of Truth principle by:
 * 1. Using consistent defaults that align with FontAwesome Pro conventions
 * 2. Providing a centralized way to configure icon behavior app-wide
 * 3. Supporting the main Icon component which uses icon-registry.json as its SSOT
 */

// Define the context shape
interface IconContextType {
  defaultVariant?: IconVariant;
  defaultSize?: string;
  iconBasePath?: string;
  forceVariant?: IconVariant;
}

// Create the context with default values
const IconContext = createContext<IconContextType>({
  defaultVariant: 'light',
  defaultSize: 'md',
  iconBasePath: '/icons'
});

// Context provider props
interface IconContextProviderProps {
  children: ReactNode;
  defaultVariant?: IconVariant;
  defaultSize?: string;
  iconBasePath?: string;
  forceVariant?: IconVariant;
}

/**
 * IconContextProvider
 * Provides a way to set default values for icons throughout the app
 */
export const IconContextProvider: React.FC<IconContextProviderProps> = ({
  children,
  defaultVariant = 'light',
  defaultSize = 'md',
  iconBasePath = '/icons',
  forceVariant
}) => {
  const contextValue = {
    defaultVariant,
    defaultSize,
    iconBasePath,
    forceVariant
  };

  return (
    <IconContext.Provider value={contextValue}>
      {children}
    </IconContext.Provider>
  );
};

/**
 * Hook to access icon context values
 */
export const useIconContext = () => useContext(IconContext);

/**
 * Default export for IconContext
 */
export default IconContext;
