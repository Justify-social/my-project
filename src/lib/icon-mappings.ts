// Import from fontawesome-svg-core instead of the Pro Kit
import { findIconDefinition, IconDefinition, IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

/**
 * Enhanced helper function to safely get Font Awesome icons with robust fallbacks
 * This function never throws errors and always returns a valid icon definition
 */
export function getIcon(name: string | undefined, style: 'fas' | 'fal' | 'far' | 'fab' = 'fas'): IconDefinition {
  // Handle undefined or empty name
  if (!name) {
    console.warn('[Icon] Undefined or empty icon name, using fallback question icon');
    try {
      return findIconDefinition({ prefix: 'fas' as IconPrefix, iconName: 'question' as IconName });
    } catch (e) {
      // If even finding question icon fails, return a minimal definition that won't crash
      return createMinimalIconDefinition();
    }
  }

  try {
    // Try to find the icon in the library
    return findIconDefinition({ prefix: style as IconPrefix, iconName: name as IconName });
  } catch (e) {
    console.warn(`[Icon] Could not find icon ${style} ${name}, trying alternative styles`);
    
    // Try alternative styles if the requested style failed
    try {
      if (style === 'fal') {
        // If light style fails, try solid
        return findIconDefinition({ prefix: 'fas' as IconPrefix, iconName: name as IconName });
      } else if (style === 'fas') {
        // If solid fails, try light
        return findIconDefinition({ prefix: 'fal' as IconPrefix, iconName: name as IconName });
      } else if (style === 'far') {
        // If regular fails, try solid then light
        try {
          return findIconDefinition({ prefix: 'fas' as IconPrefix, iconName: name as IconName });
        } catch (e) {
          return findIconDefinition({ prefix: 'fal' as IconPrefix, iconName: name as IconName });
        }
      } else if (style === 'fab') {
        // For brand icons, use a generic brand icon as fallback
        return findIconDefinition({ prefix: 'fab' as IconPrefix, iconName: 'font-awesome' as IconName });
      }
    } catch (alternativeError) {
      console.warn(`[Icon] Alternative styles failed for ${name}, using question icon`);
    }
    
    // Last resort - use question icon
    try {
      return findIconDefinition({ prefix: 'fas' as IconPrefix, iconName: 'question' as IconName });
    } catch (fallbackError) {
      // If even the question icon fails, return a minimal definition that won't crash
      console.error('[Icon] Critical error: Even fallback icon not found', fallbackError);
      return createMinimalIconDefinition();
    }
  }
}

/**
 * Creates a minimal icon definition that won't crash the app
 * Used as a last resort when all other fallbacks fail
 */
function createMinimalIconDefinition(): IconDefinition {
  return {
    prefix: 'fas' as IconPrefix,
    iconName: 'question' as IconName,
    icon: [
      512, // width
      512, // height
      [], // ligatures
      '', // unicode
      'M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z'
    ]
  };
}

// Create icon mappings using the getIcon helper
export const FA_UI_SOLID_ICON_MAP = {
  // Heroicons equivalents
  search: getIcon('magnifying-glass', 'fas'),
  plus: getIcon('plus', 'fas'),
  minus: getIcon('minus', 'fas'),
  close: getIcon('xmark', 'fas'),
  check: getIcon('check', 'fas'),
  chevronDown: getIcon('chevron-down', 'fas'),
  chevronUp: getIcon('chevron-up', 'fas'),
  chevronLeft: getIcon('chevron-left', 'fas'),
  chevronRight: getIcon('chevron-right', 'fas'),
  user: getIcon('user', 'fas'),
  settings: getIcon('gear', 'fas'),
  mail: getIcon('envelope', 'fas'),
  calendar: getIcon('calendar-days', 'fas'),
  trash: getIcon('trash', 'fas'),
  warning: getIcon('triangle-exclamation', 'fas'),
  info: getIcon('circle-info', 'fas'),
  bell: getIcon('bell', 'fas'),
  
  // Bootstrap Icons equivalents
  circleCheck: getIcon('circle-check', 'fas'),
  lightBulb: getIcon('lightbulb', 'fas'),
  chatBubble: getIcon('comment-dots', 'fas'),
  
  // Action Icons
  view: getIcon('eye', 'fas'),
  edit: getIcon('pen-to-square', 'fas'),
  copy: getIcon('copy', 'fas'),
  delete: getIcon('trash-can', 'fas'),
  
  // Additional common UI icons
  heart: getIcon('heart', 'fas'),
  star: getIcon('star', 'fas'),
  bookmark: getIcon('bookmark', 'fas'),
  share: getIcon('share', 'fas'),
  upload: getIcon('upload', 'fas'),
  menu: getIcon('bars', 'fas'),
  filter: getIcon('filter', 'fas'),
  grid: getIcon('table-cells', 'fas'),
  list: getIcon('list', 'fas'),
  tag: getIcon('tag', 'fas'),
  lock: getIcon('lock', 'fas'),
  unlock: getIcon('unlock', 'fas'),
  key: getIcon('key', 'fas'),
  paperclip: getIcon('paperclip', 'fas'),
  
  // Original mappings
  download: getIcon('download', 'fas'),
  
  // New mappings for missing icons
  play: getIcon('play', 'fas'),
  document: getIcon('file', 'fas'),
  documentText: getIcon('file-lines', 'fas'),
  home: getIcon('home', 'fas'),
  chart: getIcon('chart-bar', 'fas'),
  chartPie: getIcon('chart-pie', 'fas'),
  money: getIcon('money-bill', 'fas'),
  trendUp: getIcon('arrow-trend-up', 'fas'),
  trendDown: getIcon('arrow-trend-down', 'fas'),
  lightning: getIcon('bolt', 'fas'),
  globe: getIcon('globe', 'fas'),
  userGroup: getIcon('user-group', 'fas'),
  building: getIcon('building', 'fas'),
  rocket: getIcon('rocket', 'fas'),
  signal: getIcon('signal', 'fas'),
  bellAlert: getIcon('bell-slash', 'fas'),
  map: getIcon('map', 'fas'),
  shield: getIcon('shield', 'fas'),
  clock: getIcon('clock', 'fas'),
  calendarDays: getIcon('calendar-days', 'fas'),
  arrowDown: getIcon('arrow-down', 'fas'),
  arrowUp: getIcon('arrow-up', 'fas'),
  arrowRight: getIcon('arrow-right', 'fas'),
  arrowLeft: getIcon('arrow-left', 'fas'),
  xCircle: getIcon('circle-xmark', 'fas'),
  checkCircle: getIcon('circle-check', 'fas'),
  magnifyingGlassPlus: getIcon('magnifying-glass-plus', 'fas'),
  swatch: getIcon('palette', 'fas'),
  creditCard: getIcon('credit-card', 'fas'),
  history: getIcon('clock-rotate-left', 'fas'),
  presentationChartBar: getIcon('chart-line', 'fas'),
  tableCells: getIcon('table', 'fas'),
  chartBar: getIcon('chart-column', 'fas')
};

// Light icon variants
export const FA_UI_LIGHT_ICON_MAP = {
  // Heroicons equivalents
  search: getIcon('magnifying-glass', 'fal'),
  plus: getIcon('plus', 'fal'),
  minus: getIcon('minus', 'fal'),
  close: getIcon('xmark', 'fal'),
  check: getIcon('check', 'fal'),
  chevronDown: getIcon('chevron-down', 'fal'),
  chevronUp: getIcon('chevron-up', 'fal'),
  chevronLeft: getIcon('chevron-left', 'fal'),
  chevronRight: getIcon('chevron-right', 'fal'),
  user: getIcon('user', 'fal'),
  settings: getIcon('gear', 'fal'),
  mail: getIcon('envelope', 'fal'),
  calendar: getIcon('calendar-days', 'fal'),
  trash: getIcon('trash', 'fal'),
  warning: getIcon('triangle-exclamation', 'fal'),
  info: getIcon('circle-info', 'fal'),
  bell: getIcon('bell', 'fal'),
  
  // Bootstrap Icons equivalents
  circleCheck: getIcon('circle-check', 'fal'),
  lightBulb: getIcon('lightbulb', 'fal'),
  chatBubble: getIcon('comment-dots', 'fal'),
  
  // Action Icons
  view: getIcon('eye', 'fal'),
  edit: getIcon('pen-to-square', 'fal'),
  copy: getIcon('copy', 'fal'),
  delete: getIcon('trash-can', 'fal'),
  
  // Additional common UI icons
  heart: getIcon('heart', 'fal'),
  star: getIcon('star', 'fal'),
  bookmark: getIcon('bookmark', 'fal'),
  share: getIcon('share', 'fal'),
  upload: getIcon('upload', 'fal'),
  menu: getIcon('bars', 'fal'),
  filter: getIcon('filter', 'fal'),
  grid: getIcon('table-cells', 'fal'),
  list: getIcon('list', 'fal'),
  tag: getIcon('tag', 'fal'),
  lock: getIcon('lock', 'fal'),
  unlock: getIcon('unlock', 'fal'),
  key: getIcon('key', 'fal'),
  paperclip: getIcon('paperclip', 'fal'),
  download: getIcon('download', 'fal'),
  play: getIcon('play', 'fal'),
  document: getIcon('file', 'fal'),
  documentText: getIcon('file-lines', 'fal'),
  home: getIcon('home', 'fal'),
  chart: getIcon('chart-bar', 'fal'),
  chartPie: getIcon('chart-pie', 'fal'),
  money: getIcon('money-bill', 'fal'),
  trendUp: getIcon('arrow-trend-up', 'fal'),
  trendDown: getIcon('arrow-trend-down', 'fal'),
  lightning: getIcon('bolt', 'fal'),
  globe: getIcon('globe', 'fal'),
  userGroup: getIcon('user-group', 'fal'),
  building: getIcon('building', 'fal'),
  rocket: getIcon('rocket', 'fal'),
  signal: getIcon('signal', 'fal'),
  bellAlert: getIcon('bell-slash', 'fal'),
  map: getIcon('map', 'fal'),
  shield: getIcon('shield', 'fal'),
  clock: getIcon('clock', 'fal'),
  calendarDays: getIcon('calendar-days', 'fal'),
  arrowDown: getIcon('arrow-down', 'fal'),
  arrowUp: getIcon('arrow-up', 'fal'),
  arrowRight: getIcon('arrow-right', 'fal'),
  arrowLeft: getIcon('arrow-left', 'fal'),
  xCircle: getIcon('circle-xmark', 'fal'),
  checkCircle: getIcon('circle-check', 'fal'),
  magnifyingGlassPlus: getIcon('magnifying-glass-plus', 'fal'),
  swatch: getIcon('palette', 'fal'),
  creditCard: getIcon('credit-card', 'fal'),
  history: getIcon('clock-rotate-left', 'fal'),
  presentationChartBar: getIcon('chart-line', 'fal'),
  tableCells: getIcon('table', 'fal'),
  chartBar: getIcon('chart-column', 'fal')
};

// For backwards compatibility
export const FA_UI_ICON_MAP = FA_UI_SOLID_ICON_MAP;
export const FA_UI_OUTLINE_ICON_MAP = FA_UI_LIGHT_ICON_MAP;

// Platform icons using brand icons
export const FA_PLATFORM_ICON_MAP = {
  instagram: getIcon('instagram', 'fab'),
  youtube: getIcon('youtube', 'fab'),
  tiktok: getIcon('tiktok', 'fab'),
  facebook: getIcon('facebook', 'fab'),
  x: getIcon('twitter', 'fab'), // Using twitter icon for X
  linkedin: getIcon('linkedin', 'fab'),
};

// Platform-specific brand colors
export const PLATFORM_COLORS = {
  instagram: '#E1306C',
  youtube: '#FF0000',
  tiktok: '#000000',
  facebook: '#1877F2',
  x: '#000000',
  linkedin: '#0A66C2',
}; 