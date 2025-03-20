/**
 * FontAwesome Icons Diagnostic Script
 * 
 * This script identifies and resolves issues with FontAwesome icons in the application.
 * Common issues include:
 * 1. Icons not being imported and registered properly
 * 2. Timing issues with library registration
 * 3. Memory leaks or cache problems
 * 4. Race conditions in icon loading
 */

import { IconDefinition, IconName, IconPrefix, findIconDefinition, library } from '@fortawesome/fontawesome-svg-core';
import * as SolidIcons from '@fortawesome/pro-solid-svg-icons';
import * as LightIcons from '@fortawesome/pro-light-svg-icons';
import * as BrandIcons from '@fortawesome/free-brands-svg-icons';

// Map of icon names (kebab-case) by their prefix
interface IconMap {
  [prefix: string]: { [name: string]: IconDefinition };
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

// Create a map of all available icons
function buildIconMap(): IconMap {
  iconLogger.log('Building icon map');
  
  const iconMap: IconMap = { fas: {}, fal: {}, far: {}, fab: {} };
  
  // Add all solid icons
  Object.keys(SolidIcons).forEach(key => {
    if (key.startsWith('fa') && key !== 'faForward') {
      const icon = (SolidIcons as any)[key] as IconDefinition;
      if (icon && icon.iconName) {
        iconMap.fas[icon.iconName] = icon;
      }
    }
  });
  
  // Add all light icons
  Object.keys(LightIcons).forEach(key => {
    if (key.startsWith('fa') && key !== 'faForward') {
      const icon = (LightIcons as any)[key] as IconDefinition;
      if (icon && icon.iconName) {
        iconMap.fal[icon.iconName] = icon;
      }
    }
  });
  
  // Add all brand icons
  Object.keys(BrandIcons).forEach(key => {
    if (key.startsWith('fa') && key !== 'faForward') {
      const icon = (BrandIcons as any)[key] as IconDefinition;
      if (icon && icon.iconName) {
        iconMap.fab[icon.iconName] = icon;
      }
    }
  });
  
  iconLogger.log('Icon map built', { 
    solid: Object.keys(iconMap.fas).length, 
    light: Object.keys(iconMap.fal).length, 
    brand: Object.keys(iconMap.fab).length 
  });
  
  return iconMap;
}

// Cache for the icon map to avoid rebuilding
let iconMapCache: IconMap | null = null;

// Get the icon map, building it if needed
export function getIconMap(): IconMap {
  if (!iconMapCache) {
    iconMapCache = buildIconMap();
  }
  return iconMapCache;
}

// Check if an icon exists by name and prefix
export function iconExists(prefix: IconPrefix, name: IconName): boolean {
  try {
    // Try the direct lookup first (faster)
    const iconMap = getIconMap();
    if (iconMap[prefix] && iconMap[prefix][name]) {
      return true;
    }
    
    // Fall back to findIconDefinition
    return !!findIconDefinition({ prefix, iconName: name });
  } catch (e) {
    iconLogger.log(`Error checking if icon exists: ${prefix} ${name}`, e);
    return false;
  }
}

// Register any missing icons in the FontAwesome library
export function ensureIconsRegistered() {
  iconLogger.log('Ensuring icons are registered');
  
  // Get the icon map
  const iconMap = getIconMap();
  
  // Count icons to be registered
  const solidIcons = Object.values(iconMap.fas);
  const lightIcons = Object.values(iconMap.fal);
  const brandIcons = Object.values(iconMap.fab);
  
  try {
    // Register all icons with the library
    library.add(...solidIcons, ...lightIcons, ...brandIcons);
    
    iconLogger.log('Registered all icons with library', {
      solid: solidIcons.length,
      light: lightIcons.length,
      brand: brandIcons.length
    });
    
    return true;
  } catch (e) {
    iconLogger.log('Error registering icons with library', e);
    return false;
  }
}

// Check if the FontAwesome library has been initialized
export function checkLibraryInitialized(): boolean {
  try {
    return !!findIconDefinition({ prefix: 'fas' as IconPrefix, iconName: 'question' as IconName });
  } catch (e) {
    iconLogger.log('Error checking if library is initialized', e);
    return false;
  }
}

// Create a monitoring hook to catch icon loading failures
export function monitorIconFailures() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => {}; // No-op for SSR
  }
  
  iconLogger.log('Setting up icon failure monitor');
  
  // Create a monitor for question mark icons
  const observer = new MutationObserver((mutations) => {
    let questionMarkIconsFound = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            const questionIcons = node.querySelectorAll('.question-mark-icon-fallback');
            if (questionIcons.length > 0) {
              questionMarkIconsFound = true;
              iconLogger.log(`Found ${questionIcons.length} question mark icons`, {
                path: node.closest('[data-path]')?.getAttribute('data-path') || 'unknown'
              });
            }
          }
        });
      }
    });
    
    if (questionMarkIconsFound) {
      iconLogger.log('Attempting to re-register icons');
      ensureIconsRegistered();
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
export function generateIconReport(): string {
  iconLogger.log('Generating icon report');
  
  const iconMap = getIconMap();
  
  const report = [
    '=== FontAwesome Icon Status Report ===',
    `Generated at: ${new Date().toISOString()}`,
    '',
    `Solid Icons: ${Object.keys(iconMap.fas).length}`,
    `Light Icons: ${Object.keys(iconMap.fal).length}`,
    `Brand Icons: ${Object.keys(iconMap.fab).length}`,
    '',
    'Library Initialized: ' + (checkLibraryInitialized() ? 'Yes' : 'No'),
    '',
    '=== Event Log ===',
    iconLogger.getFormattedLogs()
  ].join('\n');
  
  return report;
}

// Export a diagnostic function that can be called to fix icon issues
export function fixIconIssues(): void {
  iconLogger.log('Running icon fix');
  
  // Step 1: Check if the library is initialized
  const initialized = checkLibraryInitialized();
  iconLogger.log(`Library initialized: ${initialized}`);
  
  // Step 2: Register all icons
  const registered = ensureIconsRegistered();
  iconLogger.log(`Icons registered: ${registered}`);
  
  // Step 3: Set up monitoring for future failures
  const cleanup = monitorIconFailures();
  
  // Log a success message
  iconLogger.log('Icon fix complete');
  
  // Store the cleanup function in window for later use
  if (typeof window !== 'undefined') {
    (window as any).__iconMonitorCleanup = cleanup;
  }
}

// Auto-run the fix if in browser environment
if (typeof window !== 'undefined') {
  // Wait for the document to be fully loaded
  if (document.readyState === 'complete') {
    fixIconIssues();
  } else {
    window.addEventListener('load', fixIconIssues);
  }
  
  // Also expose the diagnostic functions on window for debug use
  (window as any).__iconDiagnostics = {
    logger: iconLogger,
    getIconMap,
    ensureIconsRegistered,
    checkLibraryInitialized,
    fixIconIssues,
    generateIconReport
  };
} 