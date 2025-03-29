/**
 * Consolidated Icon Utilities
 * 
 * Contains shared icon utilities used throughout the application.
 * This combines functionality previously spread across multiple files:
 * - icon-loader.ts
 * - icon-direct-imports.ts
 * - app-icon-mappings.ts
 */

import { IconStyle } from '@/components/ui/atoms/icons/types';
import { normalizeIconName } from '@/components/ui/atoms/icons';

// Cache for loaded SVG content
const svgCache: Record<string, string> = {};

/**
 * Load SVG content from a URL with caching
 */
export async function loadSvgContent(url: string): Promise<string> {
  // Check cache first
  if (svgCache[url]) {
    return svgCache[url];
  }
  
  try {
    const response = await fetch(url, { cache: 'force-cache' });
    
    if (!response.ok) {
      throw new Error(`Failed to load SVG from ${url}: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    svgCache[url] = text;
    return text;
  } catch (error) {
    console.error(`Error loading SVG from ${url}:`, error);
    return ''; // Return empty string on error
  }
}

/**
 * App-specific icons by category
 */
export const APP_ICONS = {
  // Navigation icons
  navigation: {
    home: 'appHome',
    dashboard: 'appDashboard',
    reports: 'appReports',
    settings: 'appSettings',
    campaigns: 'appCampaigns',
    help: 'appHelp',
    billing: 'appBilling'
  },
  // Action icons
  actions: {
    add: 'faPlus',
    edit: 'faPen',
    delete: 'faTrash',
    save: 'faSave',
    cancel: 'faXmark',
    search: 'faMagnifyingGlass',
    filter: 'faFilter',
    upload: 'faUpload',
    download: 'faDownload',
    refresh: 'faArrowsRotate'
  },
  // Status icons
  status: {
    success: 'faCircleCheck',
    error: 'faCircleXmark',
    warning: 'faTriangleExclamation',
    info: 'faCircleInfo',
    pending: 'faSpinner',
    locked: 'faLock',
    unlocked: 'faLockOpen'
  }
};

/**
 * KPI theme colors
 */
export const KPI_COLORS = {
  impressions: '#4299E1', // Blue
  clicks: '#F6AD55',      // Orange
  conversions: '#68D391', // Green
  engagement: '#F687B3',  // Pink
  reach: '#9F7AEA',       // Purple
  default: '#718096'      // Gray
};

/**
 * Direct icon import mappings
 * Used for components that need direct array format references
 */
export const SOLID_ICON_MAP: Record<string, [string, string]> = {
  user: ['fas', 'user'],
  cog: ['fas', 'gear'],
  plus: ['fas', 'plus'],
  minus: ['fas', 'minus'],
  check: ['fas', 'check'],
  times: ['fas', 'xmark'],
  search: ['fas', 'magnifying-glass'],
  home: ['fas', 'house'],
  calendar: ['fas', 'calendar'],
  bell: ['fas', 'bell'],
  question: ['fas', 'question'],
  info: ['fas', 'info'],
  warning: ['fas', 'triangle-exclamation'],
  error: ['fas', 'circle-xmark'],
  success: ['fas', 'circle-check'],
  arrowRight: ['fas', 'arrow-right'],
  arrowLeft: ['fas', 'arrow-left'],
  arrowUp: ['fas', 'arrow-up'],
  arrowDown: ['fas', 'arrow-down'],
  chevronDown: ['fas', 'chevron-down'],
  chevronUp: ['fas', 'chevron-up'],
  chevronLeft: ['fas', 'chevron-left'],
  chevronRight: ['fas', 'chevron-right'],
  upload: ['fas', 'upload'],
  download: ['fas', 'download'],
  edit: ['fas', 'pen'],
  trash: ['fas', 'trash'],
  save: ['fas', 'floppy-disk'],
  copy: ['fas', 'copy'],
  link: ['fas', 'link'],
  unlink: ['fas', 'link-slash'],
  filter: ['fas', 'filter'],
  bars: ['fas', 'bars'],
  ellipsis: ['fas', 'ellipsis'],
  play: ['fas', 'play'],
  pause: ['fas', 'pause'],
  stop: ['fas', 'stop'],
  refresh: ['fas', 'arrows-rotate'],
  sync: ['fas', 'rotate'],
  lock: ['fas', 'lock'],
  unlock: ['fas', 'lock-open']
};

// Light icon version of the same map
export const LIGHT_ICON_MAP: Record<string, [string, string]> = Object.entries(SOLID_ICON_MAP)
  .reduce((acc, [key, [_, name]]) => {
    acc[key] = ['fal', name];
    return acc;
  }, {} as Record<string, [string, string]>);

/**
 * Get icon in direct import format (for use with libraries that expect this format)
 */
export function getIconDirectFormat(name: string, variant: IconStyle = 'light'): [string, string] {
  const normalizedName = normalizeIconName(name);
  const baseName = normalizedName.startsWith('fa') ? normalizedName.slice(2).toLowerCase() : normalizedName.toLowerCase();
  
  // Use the appropriate map based on variant
  const map = variant === 'solid' ? SOLID_ICON_MAP : LIGHT_ICON_MAP;
  
  // Check if we have a direct mapping
  if (map[baseName]) {
    return map[baseName];
  }
  
  // Fallback to a standard format
  const prefix = variant === 'solid' ? 'fas' : 'fal';
  return [prefix, baseName];
}
