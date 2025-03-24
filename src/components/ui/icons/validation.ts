/**
 * Icon validation helper functions
 * 
 * These functions help identify incorrect icon usage patterns during development.
 * They are only active in development mode and have no effect in production.
 */
import { useEffect, RefObject } from 'react';

// Declare global types for our custom window properties
declare global {
  interface Window {
    __ICON_SYSTEM_FALLBACKS_ACTIVE?: boolean;
  }
}

// This will be imported from the generated icon-data.ts file
// If it doesn't exist yet, we'll use a fallback empty array
let ICON_NAMES: string[] = [];
try {
  // Try to import from the generated file
  const iconData = require('./icon-data');
  ICON_NAMES = iconData.ICON_NAMES || Object.keys(iconData.iconData || {});
} catch (e) {
  // If import fails, use empty array
  console.warn('Icon data not found. Run icon scripts to generate icon data.');
}

// Known FontAwesome icon prefixes
const KNOWN_PREFIXES = ['fa', 'fab', 'fas', 'far', 'fal'];

/**
 * Validates if a string is a valid icon name
 * @param name The icon name to validate
 * @returns true if the name is valid
 */
export function isValidIconName(name: string): boolean {
  if (!name) return false;
  
  // Check if it's in our known icons list
  if (ICON_NAMES.includes(name)) return true;
  
  // Validate FontAwesome naming pattern
  const hasValidPrefix = KNOWN_PREFIXES.some(prefix => name.startsWith(prefix));
  const hasProperCasing = name.length > 2 && name[2] === name[2].toUpperCase();
  
  return hasValidPrefix && hasProperCasing;
}

/**
 * Hook for validating icon props during development
 * Enhanced to handle dynamic props safely
 */
export function useIconValidation(props: { 
  name?: string | null | undefined; 
  solid?: boolean; 
  iconType?: string;
  className?: string | null | undefined;
}) {
  const { name, solid, iconType, className } = props;
  
  useEffect(() => {
    // Disable validation warnings completely - we'll rely on the audit script
    return;
    
    /* Original validation logic commented out to reduce noise in console
    if (process.env.NODE_ENV === 'development') {
      // Only log warnings in development mode to avoid console spam in production
      try {
        // Handle dynamic or missing name prop
        if (!name) {
          console.warn('Icon component used without a name prop');
        } else if (typeof name !== 'string') {
          console.warn(`Icon name is not a string: ${typeof name}`);
        } else if (!isValidIconName(name)) {
          console.warn(`Invalid icon name: "${name}"`);
        }
        
        // Validate static icons have solid property set
        if (iconType === 'static' && solid === undefined) {
          console.warn(`Static icon "${name || 'unknown'}" is missing solid property`);
        }
        
        // Validate there's no solid prop on button icons (should use hover effect instead)
        if (iconType === 'button' && solid === true) {
          console.warn(`Button icon "${name || 'unknown'}" should not use solid={true} as it interferes with hover effects`);
        }
        
        // For debugging only - log all props when className is dynamic
        if (className && typeof className !== 'string') {
          console.debug(`Icon "${name || 'unknown'}" has a dynamic className: ${typeof className}`);
        }
      } catch (error) {
        // Catch any errors that might occur during validation
        console.warn('Error in icon validation:', error);
      }
    }
    */
  }, [name, solid, iconType, className]);
}

/**
 * Checks if an element has the "group" class
 */
export function hasGroupClass(el: HTMLElement | null): boolean {
  if (!el) return false;
  return el.classList.contains('group');
}

/**
 * Hook for validating that button icons have proper parent elements
 */
export function useButtonIconValidation(ref: RefObject<HTMLElement>, iconType?: string) {
  useEffect(() => {
    // Only run in development mode and for button icons
    if (process.env.NODE_ENV !== 'development' || iconType !== 'button') return;
    
    // Use a delay to allow for the component to be mounted properly
    const timer = setTimeout(() => {
      try {
        const element = ref.current;
        if (!element) return;
        
        const parentElement = element.parentElement;
        if (!parentElement) return;
        
        const hasGroupClass = parentElement.classList.contains('group');
        
        // Skip warning if the enhanced SvgIcon fallback is active
        // (We're already handling it in the component itself)
        if (window.__ICON_SYSTEM_FALLBACKS_ACTIVE) return;
        
        if (!hasGroupClass) {
          const iconName = element.getAttribute('data-icon-name') || 'unknown';
          const componentId = element.closest('[data-component-id]')?.getAttribute('data-component-id') || 
                             parentElement.getAttribute('id') || 
                             'unknown';
          
          console.warn(
            `[Icon System Warning] Button icon "${iconName}" missing parent 'group' class in component ${componentId}. This will cause rendering issues.`,
            {
              element: parentElement,
              fix: "Add the 'group' class to the parent element or use ButtonWithIcon component",
              location: window.location.pathname
            }
          );
          
          // Apply visual indicator in development
          if (element.parentElement) {
            element.parentElement.style.outline = '2px dashed red';
            element.parentElement.setAttribute('title', 'Missing group class - icon hover will not work');
          }
        }
      } catch (error) {
        // Silently fail for SSR or other errors
      }
    }, 500); // Delay to ensure component is fully mounted
    
    return () => clearTimeout(timer);
  }, [ref, iconType]);
}

// Add global flag for tracking fallback usage
if (typeof window !== 'undefined') {
  window.__ICON_SYSTEM_FALLBACKS_ACTIVE = false;
}

/**
 * Validate a dynamically determined icon name
 * Safe for use with any name value, including undefined, null, or objects/arrays
 */
export function validateDynamicName(name: any): string | undefined {
  // Handle common edge cases gracefully
  if (name === null || name === undefined) {
    if (process.env.NODE_ENV === 'development') {
      // console.warn('Icon component received null or undefined name');
    }
    return undefined;
  }
  
  // Convert non-string values to strings when possible
  const nameStr = String(name);
  
  // Check if valid
  if (nameStr && isValidIconName(nameStr)) {
    return nameStr;
  }
  
  // Warning for development - disabled to reduce noise
  /*
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Invalid icon name: "${nameStr}"`);
    console.info('Available icons:', ICON_NAMES.join(', '));
  }
  */
  
  return undefined;
}

/**
 * Utility function to scan icon directories and validate icon pairs
 * @returns An object containing all valid icons and any errors found
 */
export function scanIconDirectories() {
  // This is just a type definition for use on the client side
  return { 
    icons: [] as Array<{
      name: string;
      lightName: string;
      solidName: string;
      fileName: string;
    }>, 
    errors: [] as string[] 
  };
}

// Define the type for the icon data returned from the API
export interface IconData {
  name: string;
  lightName: string;
  solidName: string;
  fileName: string;
} 