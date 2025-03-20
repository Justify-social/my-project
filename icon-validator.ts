
/**
 * Robust Icon Validator
 * 
 * This utility validates icon props to ensure they can be safely passed to Font Awesome
 * components without causing errors.
 */
import { IconName, IconPrefix, IconProp } from '@fortawesome/fontawesome-svg-core';

/**
 * Deep validator for FontAwesome icon props that catches all edge cases
 */
export function isValidIconProp(icon: unknown): icon is IconProp {
  if (!icon) return false;
  
  // String icon name
  if (typeof icon === 'string') {
    return icon.trim() !== '';
  }
  
  // Array format [prefix, iconName]
  if (Array.isArray(icon)) {
    return (
      icon.length === 2 &&
      typeof icon[0] === 'string' &&
      typeof icon[1] === 'string' &&
      icon[0].trim() !== '' &&
      icon[1].trim() !== ''
    );
  }
  
  // Object format {prefix, iconName}
  if (typeof icon === 'object' && icon !== null) {
    const obj = icon as any;
    return (
      obj.prefix && 
      obj.iconName &&
      typeof obj.prefix === 'string' &&
      typeof obj.iconName === 'string' &&
      obj.prefix.trim() !== '' &&
      obj.iconName.trim() !== ''
    );
  }
  
  return false;
}

/**
 * Safe mapper function to ensure icon names are valid
 */
export function safeIconName(name: any): IconName | undefined {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return undefined;
  }
  
  // Check if it's already kebab-case
  if (name.includes('-')) {
    return name as IconName;
  }
  
  // Convert camelCase to kebab-case
  return name.replace(/([A-Z])/g, '-$1').toLowerCase() as IconName;
}

/**
 * Safe way to create icon props with validation
 */
export function createSafeIconProp(
  prefix: IconPrefix | string | undefined,
  name: IconName | string | undefined
): IconProp | undefined {
  if (!prefix || typeof prefix !== 'string' || prefix.trim() === '') {
    return undefined;
  }
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return undefined;
  }
  
  return [prefix as IconPrefix, safeIconName(name) || 'question' as IconName];
}
