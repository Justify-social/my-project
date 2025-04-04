/**
 * Component Wrappers Index
 * 
 * This file serves as the entry point for all component wrappers used in the UI Components debug tools.
 * It provides a consistent interface for accessing wrappers for various component types (Shadcn, custom, etc.)
 */

import { componentWrappers as shadcnWrappers } from './shadcn-wrappers';
import React from 'react';

// Define component wrapper type
type ComponentWrapper = React.ComponentType<any>;
type WrapperMap = Record<string, ComponentWrapper>;

/**
 * Get a component wrapper by name
 * @param name - The name of the component to get a wrapper for
 * @returns The component wrapper or undefined if not found
 */
export function getComponentWrapper(name: string): ComponentWrapper | undefined {
  // Check Shadcn wrappers first
  if (name in shadcnWrappers) {
    return shadcnWrappers[name as keyof typeof shadcnWrappers];
  }
  
  // Add more wrapper sources here as needed
  
  return undefined;
}

/**
 * Check if a component has a wrapper
 * @param name - The name of the component to check
 * @returns True if a wrapper exists, false otherwise
 */
export function hasComponentWrapper(name: string): boolean {
  return !!getComponentWrapper(name);
}

/**
 * Determine if a component path is for a Shadcn component
 * @param path - The component path
 * @returns True if the path is for a Shadcn component
 */
export function isShadcnComponent(path: string): boolean {
  return path?.includes('@/components/ui/') || path?.includes('ui/');
}

export { shadcnWrappers };

export default {
  getComponentWrapper,
  hasComponentWrapper,
  isShadcnComponent,
  shadcnWrappers,
}; 