/**
 * Icon Data Index
 * 
 * Export all icon data from a single file
 */

export { iconData } from './icon-data';
export type { IconData, IconName } from './types';

// Platform icon and color constants
export const PLATFORM_ICON_MAP = {
  'facebook': 'faFacebook',
  'instagram': 'faInstagram',
  'linkedin': 'faLinkedin',
  'tiktok': 'faTiktok',
  'youtube': 'faYoutube',
  'x': 'faXTwitter'
} as const;

export const PLATFORM_COLORS = {
  'facebook': '#1877F2',
  'instagram': '#E4405F',
  'linkedin': '#0A66C2',
  'tiktok': '#000000',
  'youtube': '#FF0000',
  'x': '#000000'
} as const;
