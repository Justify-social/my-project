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

// Create icon mappings using the getIcon helper - alphabetically ordered
export const FA_UI_SOLID_ICON_MAP = {
  arrowDown: getIcon('arrow-down', 'fas'),
  arrowLeft: getIcon('arrow-left', 'fas'),
  arrowRight: getIcon('arrow-right', 'fas'),
  arrowUp: getIcon('arrow-up', 'fas'),
  bell: getIcon('bell', 'fas'),
  bellAlert: getIcon('bell-slash', 'fas'),
  bookmark: getIcon('bookmark', 'fas'),
  building: getIcon('building', 'fas'),
  calendar: getIcon('calendar-days', 'fas'),
  calendarDays: getIcon('calendar-days', 'fas'),
  chart: getIcon('chart-bar', 'fas'),
  chartBar: getIcon('chart-column', 'fas'),
  chartPie: getIcon('chart-pie', 'fas'),
  chatBubble: getIcon('comment-dots', 'fas'),
  check: getIcon('check', 'fas'),
  checkCircle: getIcon('circle-check', 'fas'),
  chevronDown: getIcon('chevron-down', 'fas'),
  chevronLeft: getIcon('chevron-left', 'fas'),
  chevronRight: getIcon('chevron-right', 'fas'),
  chevronUp: getIcon('chevron-up', 'fas'),
  circleCheck: getIcon('circle-check', 'fas'),
  clock: getIcon('clock', 'fas'),
  close: getIcon('xmark', 'fas'),
  copy: getIcon('copy', 'fas'),
  creditCard: getIcon('credit-card', 'fas'),
  delete: getIcon('trash-can', 'fas'),
  document: getIcon('file', 'fas'),
  documentText: getIcon('file-lines', 'fas'),
  download: getIcon('download', 'fas'),
  edit: getIcon('pen-to-square', 'fas'),
  fileLines: getIcon('file-lines', 'fas'),
  filter: getIcon('filter', 'fas'),
  globe: getIcon('globe', 'fas'),
  grid: getIcon('table-cells', 'fas'),
  heart: getIcon('heart', 'fas'),
  history: getIcon('clock-rotate-left', 'fas'),
  home: getIcon('home', 'fas'),
  info: getIcon('circle-info', 'fas'),
  key: getIcon('key', 'fas'),
  lightBulb: getIcon('lightbulb', 'fas'),
  lightning: getIcon('bolt', 'fas'),
  list: getIcon('list', 'fas'),
  lock: getIcon('lock', 'fas'),
  magnifyingGlassPlus: getIcon('magnifying-glass-plus', 'fas'),
  mail: getIcon('envelope', 'fas'),
  map: getIcon('map', 'fas'),
  menu: getIcon('bars', 'fas'),
  minus: getIcon('minus', 'fas'),
  money: getIcon('money-bill', 'fas'),
  paperclip: getIcon('paperclip', 'fas'),
  play: getIcon('play', 'fas'),
  plus: getIcon('plus', 'fas'),
  presentationChartBar: getIcon('chart-line', 'fas'),
  rocket: getIcon('rocket', 'fas'),
  search: getIcon('magnifying-glass', 'fas'),
  settings: getIcon('gear', 'fas'),
  share: getIcon('share', 'fas'),
  shield: getIcon('shield', 'fas'),
  signal: getIcon('signal', 'fas'),
  star: getIcon('star', 'fas'),
  swatch: getIcon('palette', 'fas'),
  tableCells: getIcon('table', 'fas'),
  tag: getIcon('tag', 'fas'),
  trendDown: getIcon('arrow-trend-down', 'fas'),
  trendUp: getIcon('arrow-trend-up', 'fas'),
  unlock: getIcon('unlock', 'fas'),
  upload: getIcon('upload', 'fas'),
  user: getIcon('user', 'fas'),
  userGroup: getIcon('user-group', 'fas'),
  view: getIcon('eye', 'fas'),
  warning: getIcon('triangle-exclamation', 'fas'),
  xCircle: getIcon('circle-xmark', 'fas'),
  xMark: getIcon('xmark', 'fas')
};

// Light icon variants - alphabetically ordered
export const FA_UI_LIGHT_ICON_MAP = {
  arrowDown: getIcon('arrow-down', 'fal'),
  arrowLeft: getIcon('arrow-left', 'fal'),
  arrowRight: getIcon('arrow-right', 'fal'),
  arrowUp: getIcon('arrow-up', 'fal'),
  bell: getIcon('bell', 'fal'),
  bellAlert: getIcon('bell-slash', 'fal'),
  bookmark: getIcon('bookmark', 'fal'),
  building: getIcon('building', 'fal'),
  calendar: getIcon('calendar-days', 'fal'),
  calendarDays: getIcon('calendar-days', 'fal'),
  chart: getIcon('chart-bar', 'fal'),
  chartBar: getIcon('chart-column', 'fal'),
  chartPie: getIcon('chart-pie', 'fal'),
  chatBubble: getIcon('comment-dots', 'fal'),
  check: getIcon('check', 'fal'),
  checkCircle: getIcon('circle-check', 'fal'),
  chevronDown: getIcon('chevron-down', 'fal'),
  chevronLeft: getIcon('chevron-left', 'fal'),
  chevronRight: getIcon('chevron-right', 'fal'),
  chevronUp: getIcon('chevron-up', 'fal'),
  circleCheck: getIcon('circle-check', 'fal'),
  clock: getIcon('clock', 'fal'),
  close: getIcon('xmark', 'fal'),
  copy: getIcon('copy', 'fal'),
  creditCard: getIcon('credit-card', 'fal'),
  delete: getIcon('trash-can', 'fal'),
  document: getIcon('file', 'fal'),
  documentText: getIcon('file-lines', 'fal'),
  download: getIcon('download', 'fal'),
  edit: getIcon('pen-to-square', 'fal'),
  fileLines: getIcon('file-lines', 'fal'),
  filter: getIcon('filter', 'fal'),
  globe: getIcon('globe', 'fal'),
  grid: getIcon('table-cells', 'fal'),
  heart: getIcon('heart', 'fal'),
  history: getIcon('clock-rotate-left', 'fal'),
  home: getIcon('home', 'fal'),
  info: getIcon('circle-info', 'fal'),
  key: getIcon('key', 'fal'),
  lightBulb: getIcon('lightbulb', 'fal'),
  lightning: getIcon('bolt', 'fal'),
  list: getIcon('list', 'fal'),
  lock: getIcon('lock', 'fal'),
  magnifyingGlassPlus: getIcon('magnifying-glass-plus', 'fal'),
  mail: getIcon('envelope', 'fal'),
  map: getIcon('map', 'fal'),
  menu: getIcon('bars', 'fal'),
  minus: getIcon('minus', 'fal'),
  money: getIcon('money-bill', 'fal'),
  paperclip: getIcon('paperclip', 'fal'),
  play: getIcon('play', 'fal'),
  plus: getIcon('plus', 'fal'),
  presentationChartBar: getIcon('chart-line', 'fal'),
  rocket: getIcon('rocket', 'fal'),
  search: getIcon('magnifying-glass', 'fal'),
  settings: getIcon('gear', 'fal'),
  share: getIcon('share', 'fal'),
  shield: getIcon('shield', 'fal'),
  signal: getIcon('signal', 'fal'),
  star: getIcon('star', 'fal'),
  swatch: getIcon('palette', 'fal'),
  tableCells: getIcon('table', 'fal'),
  tag: getIcon('tag', 'fal'),
  trendDown: getIcon('arrow-trend-down', 'fal'),
  trendUp: getIcon('arrow-trend-up', 'fal'),
  unlock: getIcon('unlock', 'fal'),
  upload: getIcon('upload', 'fal'),
  user: getIcon('user', 'fal'),
  userGroup: getIcon('user-group', 'fal'),
  view: getIcon('eye', 'fal'),
  warning: getIcon('triangle-exclamation', 'fal'),
  xCircle: getIcon('circle-xmark', 'fal'),
  xMark: getIcon('xmark', 'fal')
};

// For backwards compatibility
export const FA_UI_ICON_MAP = FA_UI_SOLID_ICON_MAP;
export const FA_UI_OUTLINE_ICON_MAP = FA_UI_LIGHT_ICON_MAP;

// Icon aliases for backward compatibility (deprecated names → current names)
export const ICON_ALIASES: Record<string, keyof typeof FA_UI_SOLID_ICON_MAP> = {
  trash: 'delete',
  // Add more aliases as needed:
  // oldName: 'newName',
};

// Platform icons using brand icons
export const FA_PLATFORM_ICON_MAP = {
  facebook: getIcon('facebook', 'fab'),
  instagram: getIcon('instagram', 'fab'),
  linkedin: getIcon('linkedin', 'fab'),
  tiktok: getIcon('tiktok', 'fab'),
  x: getIcon('x-twitter', 'fab'), // Using the new X icon
  youtube: getIcon('youtube', 'fab'),
};

// Platform-specific brand colors
export const PLATFORM_COLORS = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  x: '#000000',
  youtube: '#FF0000',
}; 