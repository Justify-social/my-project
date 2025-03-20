'use client';

import { useEffect, useState } from 'react';
import { library, findIconDefinition, IconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/pro-solid-svg-icons';
import * as lightIcons from '@fortawesome/pro-light-svg-icons';
import * as brandIcons from '@fortawesome/free-brands-svg-icons';

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
  const [fixAttempts, setFixAttempts] = useState(0);
  const [lastFixTime, setLastFixTime] = useState<number | null>(null);
  
  // Function to verify all icons and identify failures
  const verifyIcons = () => {
    console.log('[IconMonitoring] Verifying icon availability...');
    const failures: Record<string, boolean> = {};
    const missingIconNames: string[] = [];
    
    for (const icon of uiIcons) {
      const exists = checkIconExists(icon, 'fas');
      if (!exists) {
        failures[icon] = true;
        missingIconNames.push(`${icon} (solid)`);
        console.warn(`[IconMonitoring] Icon '${icon}' (solid) not found`);
      }
      
      // Also check light versions for outline style
      const lightExists = checkIconExists(icon, 'fal');
      if (!lightExists) {
        failures[`${icon}_light`] = true;
        missingIconNames.push(`${icon} (light)`);
        console.warn(`[IconMonitoring] Icon '${icon}' (light) not found`);
      }
    }
    
    setFailedIcons(failures);
    
    if (Object.keys(failures).length > 0) {
      console.error(`[IconMonitoring] Found ${Object.keys(failures).length} missing icons: ${missingIconNames.join(', ')}`);
      return false;
    }
    
    console.log('[IconMonitoring] All icons verified successfully');
    return true;
  };
  
  // Register specific icons that might be missing
  const registerMissingIcons = (missingIconNames: string[] = []) => {
    console.log('[IconMonitoring] Registering specific missing icons...');
    
    try {
      const iconsToRegister: IconDefinition[] = [];
      
      // If missing icon names are provided, only register those
      if (missingIconNames.length > 0) {
        for (const fullName of missingIconNames) {
          // Parse the icon name and style from the full name (e.g., "chevronDown (solid)")
          const match = fullName.match(/^(\w+)\s+\((\w+)\)$/);
          if (match) {
            const [_, name, styleStr] = match;
            const style = styleStr === 'solid' ? 'fas' : (styleStr === 'light' ? 'fal' : 'fas');
            
            // Try to get the icon directly
            const icon = getFaIconByName(name, style as any);
            if (icon) {
              iconsToRegister.push(icon);
              console.log(`[IconMonitoring] Found and will register: ${name} (${style})`);
            }
          }
        }
      } else {
        // Otherwise, check all known problematic icons
        const problematicIcons = [
          'chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight',
          'arrowDown', 'arrowUp', 'arrowLeft', 'arrowRight',
          'copy', 'calendarDays'
        ];
        
        for (const name of problematicIcons) {
          const solidIcon = getFaIconByName(name, 'fas');
          const lightIcon = getFaIconByName(name, 'fal');
          
          if (solidIcon) iconsToRegister.push(solidIcon);
          if (lightIcon) iconsToRegister.push(lightIcon);
        }
      }
      
      // Register the icons
      if (iconsToRegister.length > 0) {
        library.add(...iconsToRegister);
        console.log(`[IconMonitoring] Registered ${iconsToRegister.length} specific icons`);
      }
      
      return true;
    } catch (error) {
      console.error('[IconMonitoring] Error registering specific icons:', error);
      return false;
    }
  };
  
  // Re-register all icons to ensure they're available
  const registerAllIcons = () => {
    console.log('[IconMonitoring] Registering all icons...');
    
    try {
      // Get all icons from FA collections
      const solidIconsObj = getAllSolidIconDefinitions();
      const lightIconsObj = getAllLightIconDefinitions();
      const brandIconsObj = getAllBrandIconDefinitions();
      
      // Add all icons to the library
      library.add(
        ...Object.values(solidIconsObj),
        ...Object.values(lightIconsObj),
        ...Object.values(brandIconsObj)
      );
      
      console.log(`[IconMonitoring] Successfully registered ${
        Object.keys(solidIconsObj).length + 
        Object.keys(lightIconsObj).length + 
        Object.keys(brandIconsObj).length
      } icons`);
      
      // Record time of fix to avoid constant reregistration
      setLastFixTime(Date.now());
      setFixAttempts(prev => prev + 1);
      
      return true;
    } catch (error) {
      console.error('[IconMonitoring] Error registering icons:', error);
      return false;
    }
  };
  
  // Monitor MutationObserver to catch icon failures in real-time
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('[IconMonitoring] Starting icon monitoring...');
    
    // Add some manual fixes for known problematic icons
    const manuallyRegisterProblemIcons = () => {
      try {
        // Manually register problematic icons from our direct imports
        const iconsToRegister: IconDefinition[] = [];
        const problemIcons = [
          // Direct imports from solid icons package
          // @ts-ignore
          solidIcons.faChevronDown,
          // @ts-ignore
          solidIcons.faChevronUp,
          // @ts-ignore
          solidIcons.faChevronLeft,
          // @ts-ignore
          solidIcons.faChevronRight,
          // @ts-ignore
          solidIcons.faCalendarDays,
          // @ts-ignore
          solidIcons.faCopy,
          // @ts-ignore
          solidIcons.faArrowDown,
          // @ts-ignore
          solidIcons.faArrowUp,
          // @ts-ignore
          solidIcons.faArrowLeft,
          // @ts-ignore
          solidIcons.faArrowRight,
          
          // Direct imports from light icons package
          // @ts-ignore
          lightIcons.faChevronDown,
          // @ts-ignore
          lightIcons.faChevronUp,
          // @ts-ignore
          lightIcons.faChevronLeft,
          // @ts-ignore
          lightIcons.faChevronRight,
          // @ts-ignore
          lightIcons.faCalendarDays,
          // @ts-ignore
          lightIcons.faCopy,
          // @ts-ignore
          lightIcons.faArrowDown,
          // @ts-ignore
          lightIcons.faArrowUp,
          // @ts-ignore
          lightIcons.faArrowLeft,
          // @ts-ignore
          lightIcons.faArrowRight
        ].filter(Boolean);
        
        library.add(...problemIcons);
        console.log(`[IconMonitoring] Manually registered ${problemIcons.length} known problematic icons`);
      } catch (e) {
        console.error('[IconMonitoring] Error manually registering icons:', e);
      }
    };
    
    // Initial registration and verification
    manuallyRegisterProblemIcons();
    registerAllIcons();
    
    // Initial verification
    setTimeout(() => {
      const allValid = verifyIcons();
      
      if (!allValid) {
        console.log('[IconMonitoring] Initial verification failed, trying specific fixes');
        setIsFixing(true);
        registerMissingIcons(Object.keys(failedIcons).map(key => {
          const isLight = key.endsWith('_light');
          const baseName = isLight ? key.replace('_light', '') : key;
          return `${baseName} (${isLight ? 'light' : 'solid'})`;
        }));
        setTimeout(() => {
          verifyIcons();
          setIsFixing(false);
        }, 1000);
      }
    }, 500); // Small delay to let the initial registration complete
    
    // Setup MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      let questionMarkIconsDetected = false;
      
      mutations.forEach(mutation => {
        // Check if any question mark icons appeared
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              const questionIcons = node.querySelectorAll('.question-mark-icon-fallback');
              if (questionIcons.length > 0) {
                questionMarkIconsDetected = true;
              }
            }
          });
        }
      });
      
      // If we detect question mark icons and we're not already fixing
      if (questionMarkIconsDetected && !isFixing) {
        // Only attempt a fix if it's been at least 5 seconds since last fix
        // and we haven't already tried too many times
        const shouldFix = !lastFixTime || Date.now() - lastFixTime > 5000;
        
        if (shouldFix && fixAttempts < 3) {
          console.log('[IconMonitoring] Question mark icons detected, attempting fix');
          setIsFixing(true);
          manuallyRegisterProblemIcons();
          registerAllIcons();
          setTimeout(() => {
            verifyIcons();
            setIsFixing(false);
          }, 1000);
        } else if (fixAttempts >= 3) {
          console.warn('[IconMonitoring] Max fix attempts reached, manual refresh recommended');
        }
      }
    });
    
    // Observe the entire document for changes
    observer.observe(document.documentElement, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['class'] 
    });
    
    // Also set up a check after page load completes
    window.addEventListener('load', () => {
      console.log('[IconMonitoring] Page loaded, verifying icons');
      verifyIcons();
    });
    
    // And after any route change (for Next.js)
    const handleRouteChange = () => {
      console.log('[IconMonitoring] Route changed, verifying icons');
      setTimeout(verifyIcons, 500); // Small delay to allow rendering
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    // Clean up
    return () => {
      observer.disconnect();
      window.removeEventListener('load', verifyIcons);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isFixing, lastFixTime, fixAttempts, failedIcons]);

  // This component renders nothing visible
  return null;
}

export default IconMonitoring; 