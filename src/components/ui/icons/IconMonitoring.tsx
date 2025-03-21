'use client';

import { useEffect, useState, useRef } from 'react';
import { library, findIconDefinition, IconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/pro-solid-svg-icons';
import * as lightIcons from '@fortawesome/pro-light-svg-icons';
import * as brandIcons from '@fortawesome/free-brands-svg-icons';

// Track whether we've already displayed errors to avoid flooding the console
let errorsAlreadyLogged = false;
let patchingInProgress = false;

// Map of camelCase names to kebab-case for FA
const iconNameMap: Record<string, string> = {
  search: 'magnifying-glass',
  close: 'xmark',
  settings: 'gear',
  mail: 'envelope',
  warning: 'triangle-exclamation',
  info: 'circle-info',
  circleCheck: 'circle-check',
  lightBulb: 'lightbulb',
  chatBubble: 'comment-dots',
  view: 'eye',
  edit: 'pen-to-square',
  delete: 'trash-can',
  menu: 'bars',
  grid: 'table-cells',
  document: 'file',
  documentText: 'file-lines',
  xMark: 'xmark',
  fileLines: 'file-lines',
  chart: 'chart-bar',
  money: 'money-bill',
  trendUp: 'arrow-trend-up',
  trendDown: 'arrow-trend-down',
  lightning: 'bolt',
  userGroup: 'user-group',
  bellAlert: 'bell-slash',
  xCircle: 'circle-xmark',
  checkCircle: 'circle-check',
  magnifyingGlassPlus: 'magnifying-glass-plus',
  swatch: 'palette',
  creditCard: 'credit-card',
  history: 'clock-rotate-left',
  presentationChartBar: 'chart-line',
  tableCells: 'table',
  chartBar: 'chart-column',
  // Additional mappings for potentially problematic icons
  chevronDown: 'chevron-down',
  chevronUp: 'chevron-up',
  chevronLeft: 'chevron-left',
  chevronRight: 'chevron-right',
  calendarDays: 'calendar-days',
  arrowDown: 'arrow-down',
  arrowUp: 'arrow-up',
  arrowRight: 'arrow-right',
  arrowLeft: 'arrow-left',
  copy: 'copy',
};

// List of all UI icons used in the app
const uiIcons = [
  'search', 'plus', 'minus', 'close', 'check',
  'chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight',
  'user', 'settings', 'mail', 'calendar', 'trash',
  'warning', 'info', 'bell', 'circleCheck', 'lightBulb',
  'chatBubble', 'view', 'edit', 'copy', 'delete',
  'heart', 'star', 'bookmark', 'share', 'upload',
  'menu', 'filter', 'grid', 'list', 'tag',
  'lock', 'unlock', 'key', 'paperclip', 'download',
  'play', 'document', 'documentText', 'xMark', 'fileLines',
  'home', 'chart', 'chartPie', 'money', 'trendUp',
  'trendDown', 'lightning', 'globe', 'userGroup', 'building',
  'rocket', 'signal', 'bellAlert', 'map', 'shield',
  'clock', 'calendarDays', 'arrowDown', 'arrowUp', 'arrowRight',
  'arrowLeft', 'xCircle', 'checkCircle', 'magnifyingGlassPlus', 'swatch',
  'creditCard', 'history', 'presentationChartBar', 'tableCells', 'chartBar'
];

// Helper to get FA library name from icon (fa-solid → fas)
function getPrefixFromLibrary(libraryName: string): string {
  switch (libraryName) {
    case 'solid': return 'fas';
    case 'light': return 'fal';
    case 'regular': return 'far';
    case 'brands': return 'fab';
    default: return 'fas';
  }
}

// Converts our component name format to FontAwesome format
function normalizeIconName(name: string, prefixOverride?: string): { prefix: IconPrefix, iconName: IconName } {
  // Handle direct kebab-case names (already FA format)
  if (name.includes('-')) {
    return { 
      prefix: (prefixOverride || 'fas') as IconPrefix,
      iconName: name as IconName
    };
  }
  
  // Handle camelCase names
  const faName = iconNameMap[name] || name;
  const kebabName = faName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  
  return {
    prefix: (prefixOverride || 'fas') as IconPrefix,
    iconName: kebabName as IconName
  };
}

// Get direct access to a Font Awesome icon by name
function getFaIconByName(name: string, style: 'fas' | 'fal' | 'far' | 'fab' = 'fas'): IconDefinition | null {
  try {
    const { iconName } = normalizeIconName(name, style);
    
    // Convert kebab-case to PascalCase for direct object lookup
    const pascalCase = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    const iconKey = `fa${pascalCase}`;
    let iconObj: any;
    
    // Choose the appropriate icon collection based on style
    switch (style) {
      case 'fas':
        // @ts-ignore - dynamic access
        iconObj = solidIcons[iconKey];
        break;
      case 'fal':
        // @ts-ignore - dynamic access
        iconObj = lightIcons[iconKey];
        break;
      case 'fab':
        // @ts-ignore - dynamic access
        iconObj = brandIcons[iconKey];
        break;
      default:
        // @ts-ignore - dynamic access
        iconObj = solidIcons[iconKey];
    }
    
    return iconObj || null;
  } catch (e) {
    console.error(`[IconMonitoring] Error getting icon '${name}' (${style}):`, e);
    return null;
  }
}

// Get all solid icons from FontAwesome
function getAllSolidIconDefinitions(): Record<string, IconDefinition> {
  return Object.keys(solidIcons)
    .filter(key => key.startsWith('fa'))
    .reduce((acc, key) => {
      // @ts-ignore
      acc[key] = solidIcons[key];
      return acc;
    }, {} as Record<string, IconDefinition>);
}

function getAllLightIconDefinitions(): Record<string, IconDefinition> {
  return Object.keys(lightIcons)
    .filter(key => key.startsWith('fa'))
    .reduce((acc, key) => {
      // @ts-ignore
      acc[key] = lightIcons[key];
      return acc;
    }, {} as Record<string, IconDefinition>);
}

// Get all brand icons from FontAwesome
function getAllBrandIconDefinitions(): Record<string, IconDefinition> {
  return Object.keys(brandIcons)
    .filter(key => key.startsWith('fa'))
    .reduce((acc, key) => {
      // @ts-ignore
      acc[key] = brandIcons[key];
      return acc;
    }, {} as Record<string, IconDefinition>);
}

// Helper to check if an icon definition exists
function checkIconExists(name: string, style: 'fas' | 'fal' | 'far' | 'fab' = 'fas'): boolean {
  try {
    const { prefix, iconName } = normalizeIconName(name, style);
    
    // Try to find the icon through findIconDefinition first
    const definition = findIconDefinition({ prefix, iconName });
    if (definition) return true;
    
    // If that fails, try direct access to the icon object
    const directIcon = getFaIconByName(name, style);
    return !!directIcon;
  } catch (e) {
    console.error(`[IconMonitoring] Error checking icon ${style} ${name}:`, e);
    return false;
  }
}

export function IconMonitoring() {
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});
  const [isFixing, setIsFixing] = useState(false);
  
  // Use refs instead of state for tracking values that shouldn't trigger re-renders
  const fixAttemptsRef = useRef(0);
  const lastFixTimeRef = useRef<number | null>(null);
  
  // Function to verify all icons and identify failures
  const verifyIcons = () => {
    // Skip verification if we're actively patching icons
    if (patchingInProgress) return true;
    
    console.log('[IconMonitoring] Verifying icon availability...');
    const failures: Record<string, boolean> = {};
    const missingIconNames: string[] = [];
    
    for (const icon of uiIcons) {
      const exists = checkIconExists(icon, 'fas');
      if (!exists) {
        failures[icon] = true;
        missingIconNames.push(`${icon} (solid)`);
        
        // Only log warnings if we haven't already logged errors
        if (!errorsAlreadyLogged) {
          console.warn(`[IconMonitoring] Icon '${icon}' (solid) not found`);
        }
      }
      
      // Also check light versions for outline style
      const lightExists = checkIconExists(icon, 'fal');
      if (!lightExists) {
        failures[`${icon}_light`] = true;
        missingIconNames.push(`${icon} (light)`);
        
        // Only log warnings if we haven't already logged errors
        if (!errorsAlreadyLogged) {
          console.warn(`[IconMonitoring] Icon '${icon}' (light) not found`);
        }
      }
    }
    
    // Only update state if there's an actual change to avoid re-renders
    if (Object.keys(failures).length !== Object.keys(failedIcons).length) {
      setFailedIcons(failures);
    }
    
    if (Object.keys(failures).length > 0) {
      if (!errorsAlreadyLogged) {
        console.error(`[IconMonitoring] Found ${Object.keys(failures).length} missing icons: ${missingIconNames.join(', ')}`);
        errorsAlreadyLogged = true;
      }
      return false;
    }
    
    // All icons verified successfully
    console.log('[IconMonitoring] All icons verified successfully');
    return true;
  };
  
  // Function to register specific missing icons
  const registerMissingIcons = (missingIconNames: string[] = []) => {
    patchingInProgress = true;
    console.log('[IconMonitoring] Registering specific missing icons...');
    
    try {
      // Track which icons we find and need to register
      const iconsToRegister: IconDefinition[] = [];
      
      // Try to find each missing icon directly
      for (const name of missingIconNames) {
        // Extract the icon name and style from the missing icon name
        const [iconName, styleText] = name.split(' ');
        const style = styleText === '(light)' ? 'fal' : 'fas';
        
        // Try to get the icon object directly from the collection
        const iconDef = getFaIconByName(iconName, style as any);
        if (iconDef) {
          console.log(`[IconMonitoring] Found and will register: ${name} (${style})`);
          iconsToRegister.push(iconDef);
        }
      }
      
      // If we found any icons, register them
      if (iconsToRegister.length > 0) {
        // Add all found icons to the library
        library.add(...iconsToRegister);
        
        // Clear failed state since we've registered the icons
        setFailedIcons({});
        
        // Report success
        console.log(`[IconMonitoring] Registered ${iconsToRegister.length} specific icons`);
        
        // Reset errorsAlreadyLogged so we can get new errors if needed
        errorsAlreadyLogged = false;
      }
    } catch (error) {
      console.error('[IconMonitoring] Error registering specific icons:', error);
    } finally {
      patchingInProgress = false;
    }
  };
  
  // Function to register all available icons to fix any missing ones
  const registerAllIcons = () => {
    patchingInProgress = true;
    console.log('[IconMonitoring] Registering all icons...');
    
    try {
      // Get all solid icons
      const allSolidIcons = getAllSolidIconDefinitions();
      const solidIconValues = Object.values(allSolidIcons);
      
      // Get all light icons
      const allLightIcons = getAllLightIconDefinitions();
      const lightIconValues = Object.values(allLightIcons);
      
      // Get all brand icons
      const allBrandIcons = getAllBrandIconDefinitions();
      const brandIconValues = Object.values(allBrandIcons);
      
      // Add all icons to the library
      library.add(...solidIconValues, ...lightIconValues, ...brandIconValues);
      
      // Clear failed state since we've registered all icons
      setFailedIcons({});
      
      // Report success
      console.log(`[IconMonitoring] Successfully registered ${
        solidIconValues.length + lightIconValues.length + brandIconValues.length
      } icons (${solidIconValues.length} solid, ${lightIconValues.length} light, ${brandIconValues.length} brand)`);
      
      // Reset errorsAlreadyLogged so we can get new errors if needed
      errorsAlreadyLogged = false;
      
      return true;
    } catch (error) {
      console.error('[IconMonitoring] Error registering icons:', error);
      return false;
    } finally {
      patchingInProgress = false;
    }
  };
  
  useEffect(() => {
    // Initialize the icon monitoring system
    console.log('[IconMonitoring] Starting icon monitoring...');
    
    const manuallyRegisterProblemIcons = () => {
      try {
        // List of known problematic icons - these are the ones that tend to fail
        const problemIcons = [
          { name: 'chevronDown', style: 'fas' },
          { name: 'chevronUp', style: 'fas' },
          { name: 'chevronLeft', style: 'fas' },
          { name: 'chevronRight', style: 'fas' },
          { name: 'close', style: 'fas' },
          { name: 'user', style: 'fas' },
          { name: 'settings', style: 'fas' },
          { name: 'bell', style: 'fas' },
          { name: 'warning', style: 'fas' },
          { name: 'info', style: 'fas' },
          { name: 'check', style: 'fas' },
          { name: 'edit', style: 'fas' },
          { name: 'delete', style: 'fas' },
          
          // Also register light variants
          { name: 'chevronDown', style: 'fal' },
          { name: 'chevronUp', style: 'fal' },
          { name: 'chevronLeft', style: 'fal' },
          { name: 'chevronRight', style: 'fal' },
          { name: 'close', style: 'fal' },
          { name: 'user', style: 'fal' },
          { name: 'settings', style: 'fal' },
          { name: 'bell', style: 'fal' },
          { name: 'warning', style: 'fal' },
          { name: 'info', style: 'fal' },
          { name: 'check', style: 'fal' },
          { name: 'edit', style: 'fal' },
          { name: 'delete', style: 'fal' },
        ];
        
        // Directly add these icons to the library
        for (const { name, style } of problemIcons) {
          const icon = getFaIconByName(name, style as any);
          if (icon) {
            library.add(icon);
          }
        }
        
        console.log(`[IconMonitoring] Manually registered ${problemIcons.length} known problematic icons`);
      } catch (e) {
        console.error('[IconMonitoring] Error manually registering icons:', e);
      }
    };
    
    // First attempt: Verify all icons
    const initialVerification = verifyIcons();
    
    // If initial verification fails, try to fix
    if (!initialVerification) {
      setIsFixing(true);
      
      // Increment fix attempts
      fixAttemptsRef.current += 1;
      lastFixTimeRef.current = Date.now();
      
      console.log('[IconMonitoring] Initial verification failed, trying specific fixes');
      
      // Try to manually register known problem icons first
      manuallyRegisterProblemIcons();
      
      // Then check which specific icons are missing and try to register them
      const missingIconNames = Object.entries(failedIcons)
        .filter(([, isMissing]) => isMissing)
        .map(([name]) => {
          // Convert _light suffix back to " (light)" format
          if (name.endsWith('_light')) {
            return `${name.replace('_light', '')} (light)`;
          }
          return `${name} (solid)`;
        });
      
      if (missingIconNames.length > 0) {
        // First try registering specific missing icons
        registerMissingIcons(missingIconNames);
        
        // If we still have issues after 2 attempts, try registering all icons
        if (fixAttemptsRef.current >= 2) {
          registerAllIcons();
        }
      }
      
      setIsFixing(false);
    }
    
    // Set up an observer to check for question mark icons (fallbacks)
    const observer = new MutationObserver((mutations) => {
      // Only check for question mark icons periodically to avoid performance issues
      const now = Date.now();
      if (lastFixTimeRef.current && now - lastFixTimeRef.current < 5000) {
        return; // Skip if we've checked in the last 5 seconds
      }
      
      // Look for question mark icons in the DOM
      const questionIcons = document.querySelectorAll('.fa-question');
      if (questionIcons.length > 0) {
        console.log('[IconMonitoring] Question mark icons detected, attempting fix');
        
        // Increment fix attempts
        fixAttemptsRef.current += 1;
        lastFixTimeRef.current = now;
        
        // If we've tried too many times, warn the user
        if (fixAttemptsRef.current > 5) {
          console.warn('[IconMonitoring] Max fix attempts reached, manual refresh recommended');
          return;
        }
        
        // Try again with the register all approach
        registerAllIcons();
      }
    });
    
    // Initial check when page loads
    console.log('[IconMonitoring] Page loaded, verifying icons');
    verifyIcons();
    
    // Function to check icons when route changes
    const handleRouteChange = () => {
      console.log('[IconMonitoring] Route changed, verifying icons');
      setTimeout(() => {
        verifyIcons();
      }, 500); // Slight delay to allow components to mount
    };
    
    // Add listeners
    window.addEventListener('popstate', handleRouteChange);
    
    // Start observing the body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      observer.disconnect();
    };
  }, [failedIcons]);
  
  // This component doesn't render anything visible
  return null;
}

export default IconMonitoring; 