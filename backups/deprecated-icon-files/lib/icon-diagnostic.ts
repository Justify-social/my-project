/**
 * Icon System Diagnostic Utility
 * 
 * This script identifies and resolves issues with icons in the application.
 * It helps debug common issues such as:
 * 1. Missing icon SVG files
 * 2. Timing issues with icon loading
 * 3. Memory leaks or cache problems
 * 4. Race conditions in icon rendering
 * 
 * UPDATED: This version uses the simplified icon system.
 */

// Import from our simplified icon system
import { IconName, IconStyle } from '@/components/ui/atoms/icons';
import { loadSvgContent, getIconDirectFormat } from '@/lib/icon-utils';

// Define our icon map type
interface IconMap {
  [variant: string]: { [name: string]: boolean };
}

// Event logger - creates timestamped logs for debugging
class EventLogger {
  private logs: { timestamp: number; event: string; data?: any }[] = [];
  private startTime: number = Date.now();
  
  log(event: string, data?: any) {
    const timestamp = Date.now() - this.startTime;
    this.logs.push({ timestamp, event, data });
    
    if (typeof console !== 'undefined') {
      console.log(`[${timestamp}ms] ${event}`, data ? data : '');
    }
  }
  
  getFormattedLogs() {
    return this.logs.map(log => 
      `[${log.timestamp.toString().padStart(5, '0')}ms] ${log.event}${log.data ? ': ' + JSON.stringify(log.data) : ''}`
    ).join('\n');
  }
  
  clearLogs() {
    this.logs = [];
    this.startTime = Date.now();
  }
}

// Global event logger instance
export const iconLogger = new EventLogger();

// Create a map of available icons based on public SVG files
async function buildIconMap(): Promise<IconMap> {
  iconLogger.log('Building icon map');
  
  const iconMap: IconMap = { fas: {}, fal: {}, far: {}, fab: {} };
  
  try {
    // In a browser environment, we can fetch the icon index or check specific icons
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      // We could fetch an index of available icons if available
      // For now, we'll mark some common icons as available
      
      // Mark common solid icons as available
      const commonSolidIcons = ['user', 'search', 'check', 'xmark', 'gear', 'circle-info'];
      commonSolidIcons.forEach(name => {
        iconMap.fas[name] = true;
      });
      
      // Mark common light icons as available
      const commonLightIcons = ['user', 'search', 'check', 'xmark', 'gear', 'circle-info'];
      commonLightIcons.forEach(name => {
        iconMap.fal[name] = true;
      });
      
      // Mark common brand icons as available
      const commonBrandIcons = ['twitter', 'facebook', 'github', 'instagram'];
      commonBrandIcons.forEach(name => {
        iconMap.fab[name] = true;
      });
    }
  } catch (error) {
    iconLogger.log('Error building icon map', error);
  }
  
  iconLogger.log('Icon map built', { 
    solid: Object.keys(iconMap.fas).length, 
    light: Object.keys(iconMap.fal).length,
    regular: Object.keys(iconMap.far).length,
    brand: Object.keys(iconMap.fab).length 
  });
  
  return iconMap;
}

// Cache for the icon map to avoid rebuilding
let iconMapCache: IconMap | null = null;

// Get the icon map, building it if needed
export async function getIconMap(): Promise<IconMap> {
  if (!iconMapCache) {
    iconMapCache = await buildIconMap();
  }
  return iconMapCache;
}

// Convert camelCase icon name to kebab-case for lookup
function camelToKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Check if an icon exists by name and prefix
export async function iconExists(prefix: string, name: string): Promise<boolean> {
  try {
    // Get the icon map
    const iconMap = await getIconMap();
    
    // Convert camelCase to kebab-case if needed
    const kebabName = name.replace(/^fa/, '').replace(/([A-Z])/g, '-$1').toLowerCase();
    
    // Try direct lookup
    if (iconMap[prefix] && iconMap[prefix][kebabName]) {
      return true;
    }
    
    // If not found in our cache, check if the SVG file exists
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      // Map prefix to variant
      const variantMap: Record<string, string> = {
        'fas': 'solid',
        'fal': 'light',
        'far': 'regular',
        'fab': 'brands'
      };
      
      const variant = variantMap[prefix] || 'solid';
      
      // Try to fetch the SVG file
      try {
        const filePath = `/icons/${variant}/${kebabName}.svg`;
        const response = await fetch(filePath, { method: 'HEAD' });
        
        // If the SVG exists, add it to our cache
        if (response.ok) {
          if (!iconMap[prefix]) {
            iconMap[prefix] = {};
          }
          iconMap[prefix][kebabName] = true;
          return true;
        }
      } catch (e) {
        iconLogger.log(`Error checking if SVG exists: ${prefix} ${name}`, e);
      }
    }
    
    return false;
  } catch (e) {
    iconLogger.log(`Error checking if icon exists: ${prefix} ${name}`, e);
    return false;
  }
}

// This function replaced ensureIconsRegistered
// Instead of registering with FontAwesome library, it preloads SVG files
export async function preloadCommonIcons(): Promise<boolean> {
  iconLogger.log('Preloading common icons');
  
  try {
    // List of common icons to preload
    const commonIcons = [
      ['fas', 'user'],
      ['fas', 'search'],
      ['fas', 'check'],
      ['fas', 'xmark'],
      ['fal', 'user'],
      ['fal', 'search'],
      ['fab', 'twitter'],
      ['fab', 'facebook']
    ];
    
    // Preload icons
    await Promise.all(
      commonIcons.map(async ([prefix, name]) => {
        await iconExists(prefix, name);
      })
    );
    
    iconLogger.log('Preloaded common icons');
    return true;
  } catch (e) {
    iconLogger.log('Error preloading icons', e);
    return false;
  }
}

// This function replaces checkLibraryInitialized
// It checks if the icon system is ready by verifying a basic icon
export async function checkIconSystemReady(): Promise<boolean> {
  try {
    // Check if a basic icon exists
    const result = await iconExists('fas', 'question');
    return result;
  } catch (e) {
    iconLogger.log('Error checking if icon system is ready', e);
    return false;
  }
}

// Create a monitoring hook to catch icon loading failures
export function monitorIconFailures() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => {}; // No-op for SSR
  }
  
  iconLogger.log('Setting up icon failure monitor');
  
  // Create a monitor for question mark icons (fallback icons)
  const observer = new MutationObserver((mutations) => {
    let fallbackIconsFound = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            // Check for fallback icons - these would have a specific class or data attribute
            const fallbackIcons = node.querySelectorAll('.icon-fallback, [data-icon-fallback="true"]');
            if (fallbackIcons.length > 0) {
              fallbackIconsFound = true;
              iconLogger.log(`Found ${fallbackIcons.length} fallback icons`, {
                path: node.closest('[data-path]')?.getAttribute('data-path') || 'unknown'
              });
            }
          }
        });
      }
    });
    
    if (fallbackIconsFound) {
      iconLogger.log('Attempting to preload icons');
      preloadCommonIcons();
    }
  });
  
  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Return cleanup function
  return () => {
    iconLogger.log('Stopping icon failure monitor');
    observer.disconnect();
  };
}

// Generate a report of all icon statuses
export async function generateIconReport(): Promise<string> {
  iconLogger.log('Generating icon report');
  
  const iconMap = await getIconMap();
  
  const report = [
    '=== Icon System Status Report ===',
    `Generated at: ${new Date().toISOString()}`,
    '',
    `Solid Icons: ${Object.keys(iconMap.fas).length}`,
    `Light Icons: ${Object.keys(iconMap.fal).length}`,
    `Regular Icons: ${Object.keys(iconMap.far).length}`,
    `Brand Icons: ${Object.keys(iconMap.fab).length}`,
    '',
    'System Status:',
    `Icon system ready: ${await checkIconSystemReady() ? 'Yes' : 'No'}`,
    '',
    'Event Log:',
    iconLogger.getFormattedLogs()
  ];
  
  return report.join('\n');
}

// Test specific icons to check if they're available
export async function testSpecificIcons(icons: { prefix: string; name: string }[]): Promise<{ [key: string]: boolean }> {
  const results: { [key: string]: boolean } = {};
  
  for (const { prefix, name } of icons) {
    const key = `${prefix}:${name}`;
    results[key] = await iconExists(prefix, name);
  }
  
  return results;
}

// Check for missing icons in a component or page
export async function checkComponentIcons(iconUsage: { prefix: string; name: string }[]): Promise<{
  missing: { prefix: string; name: string }[];
  available: { prefix: string; name: string }[];
}> {
  const missing: { prefix: string; name: string }[] = [];
  const available: { prefix: string; name: string }[] = [];
  
  for (const icon of iconUsage) {
    const exists = await iconExists(icon.prefix, icon.name);
    if (exists) {
      available.push(icon);
    } else {
      missing.push(icon);
    }
  }
  
  return { missing, available };
}

// Auto-run the fix if in browser environment
if (typeof window !== 'undefined') {
  // Wait for the document to be fully loaded
  if (document.readyState === 'complete') {
    monitorIconFailures();
  } else {
    window.addEventListener('load', monitorIconFailures);
  }
  
  // Also expose the diagnostic functions on window for debug use
  (window as any).__iconDiagnostics = {
    logger: iconLogger,
    getIconMap,
    preloadCommonIcons,
    checkIconSystemReady,
    monitorIconFailures,
    generateIconReport
  };
} 