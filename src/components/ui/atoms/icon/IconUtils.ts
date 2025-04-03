/**
 * Icon Utilities - Type-safe helper functions for icon usage
 */
import { IconProps } from './types';

/**
 * Get the Light variant of an icon name
 * If the name already ends with Light, it returns it as is
 * If the name ends with Solid, it replaces Solid with Light
 * Otherwise, it appends Light to the name
 * 
 * @example
 * getLightVariant('faCheck') // returns 'faCheckLight'
 * getLightVariant('faCheckLight') // returns 'faCheckLight'
 * getLightVariant('faCheckSolid') // returns 'faCheckLight'
 */
export function getLightVariant(iconName: string): string {
  if (iconName.endsWith('Light')) return iconName;
  if (iconName.endsWith('Solid')) return iconName.replace(/Solid$/, 'Light');
  return `${iconName}Light`;
}

/**
 * Get the Solid variant of an icon name
 * If the name already ends with Solid, it returns it as is
 * If the name ends with Light, it replaces Light with Solid
 * Otherwise, it appends Solid to the name
 * 
 * @example
 * getSolidVariant('faCheck') // returns 'faCheckSolid'
 * getSolidVariant('faCheckSolid') // returns 'faCheckSolid'
 * getSolidVariant('faCheckLight') // returns 'faCheckSolid'
 */
export function getSolidVariant(iconName: string): string {
  if (iconName.endsWith('Solid')) return iconName;
  if (iconName.endsWith('Light')) return iconName.replace(/Light$/, 'Solid');
  return `${iconName}Solid`;
}

/**
 * Ensure an icon name has the correct suffix based on desired variant
 * 
 * @example
 * ensureIconVariant('faCheck', 'light') // returns 'faCheckLight'
 * ensureIconVariant('faCheck', 'solid') // returns 'faCheckSolid'
 * ensureIconVariant('faCheckLight', 'solid') // returns 'faCheckSolid'
 */
export function ensureIconVariant(iconName: string, variant: 'light' | 'solid'): string {
  return variant === 'light' ? getLightVariant(iconName) : getSolidVariant(iconName);
}

/**
 * Create a type-safe icon factory for a specific icon
 * 
 * @example
 * const CheckIcon = createIcon('faCheck');
 * // Later in a component:
 * <CheckIcon size="lg" />
 */
export function createIcon(iconName: string) {
  return (props: Omit<IconProps, 'name'>) => ({
    name: iconName,
    ...props
  });
}

/**
 * Get the base name of an icon (without Light/Solid suffix)
 * 
 * @example
 * getBaseIconName('faCheckLight') // returns 'faCheck'
 * getBaseIconName('faCheckSolid') // returns 'faCheck'
 * getBaseIconName('faCheck') // returns 'faCheck'
 */
export function getBaseIconName(iconName: string): string {
  return iconName.replace(/(Light|Solid)$/, '');
}

/**
 * Check if an icon name represents a light variant
 */
export function isLightVariant(iconName: string): boolean {
  return iconName.endsWith('Light');
}

/**
 * Check if an icon name represents a solid variant
 */
export function isSolidVariant(iconName: string): boolean {
  return iconName.endsWith('Solid');
} 