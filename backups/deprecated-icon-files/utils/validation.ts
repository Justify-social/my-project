'use client';

/**
 * Icon Validation Utilities
 * 
 * This module provides validation utilities for the icon system.
 */

import { useState, useEffect } from 'react';
import { IconName } from '../types';

// Valid icon name patterns
const VALID_PATTERNS = [
  /^fa[A-Z][a-zA-Z0-9]+$/,  // FontAwesome pattern (faUser, faChartPie)
  /^[a-z-]+$/,              // Semantic pattern (user, chart-pie)
  /^(fa[a-z]|fa)[A-Z][a-zA-Z0-9]+Light$/ // Light variant (faUserLight)
];

// Cache for validation results to avoid redundant checks
const validationCache = new Map<string, boolean>();

/**
 * Validates if a name follows the expected format for icon names
 */
export function validateDynamicName(name: string): boolean {
  // Check cache first
  if (validationCache.has(name)) {
    return validationCache.get(name) as boolean;
  }
  
  // Check if it matches any valid pattern
  const isValid = VALID_PATTERNS.some(pattern => pattern.test(name));
  
  // Cache the result for future checks
  validationCache.set(name, isValid);
  
  return isValid;
}

/**
 * Validates if a URL is a valid icon URL
 */
export function validateIconUrl(url: string): boolean {
  return (
    url.startsWith('/icons/') && 
    (url.endsWith('.svg') || url.includes('/kpis/') || url.includes('/app/'))
  );
}

/**
 * Clears the validation cache
 */
export function clearValidationCache(): void {
  validationCache.clear();
}

/**
 * Custom hook to validate an icon name
 */
export function useIconValidation(name: IconName | undefined): boolean {
  const [isValid, setIsValid] = useState<boolean>(false);
  
  useEffect(() => {
    if (!name) {
      setIsValid(false);
      return;
    }
    
    setIsValid(validateDynamicName(name));
  }, [name]);
  
  return isValid;
}

/**
 * Hook for validating icon props in development mode
 */
export function useIconValidationDevelopment(iconName: string): boolean {
  const [isValid, setIsValid] = useState(true);
  
  // Only perform validation in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsValid(validateDynamicName(iconName));
    }
  }, [iconName]);
  
  return isValid;
}

/**
 * Hook for validating that button icons have a parent with the 'group' class
 */
export function useButtonIconValidation(ref: React.RefObject<HTMLElement>, iconType: 'button' | 'static'): boolean {
  const [hasGroup, setHasGroup] = useState(true);
  
  // Only perform validation in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && iconType === 'button' && ref.current) {
      const parentElement = ref.current.parentElement;
      setHasGroup(Boolean(parentElement?.classList.contains('group')));
    }
  }, [ref, iconType]);
  
  return hasGroup;
}

/**
 * Check if an element has the 'group' class
 */
export function hasGroupClass(element: HTMLElement | null): boolean {
  if (!element) return false;
  return element.classList.contains('group');
}

/**
 * Alias for validateDynamicName for backward compatibility
 */
export const isValidIconName = validateDynamicName; 