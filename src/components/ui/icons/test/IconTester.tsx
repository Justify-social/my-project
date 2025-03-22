'use client';

import React, { useState } from 'react';
import { 
  Icon, 
  UI_ICON_MAP, 
  UI_OUTLINE_ICON_MAP,
  PLATFORM_ICON_MAP, 
  PLATFORM_COLORS,
  iconConfig,
  KPI_ICON_URLS,
  APP_ICON_URLS
} from '../';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
// The kit adds its icons to the global fontawesome library
import { library, findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { IconPrefix, IconName, IconProp } from '@fortawesome/fontawesome-svg-core';
import { Button } from '../../button';

// Safe wrapper for FontAwesomeIcon to prevent empty object errors
const SafeFontAwesomeIcon = ({ icon, className, ...props }: { icon: IconProp, className?: string, [key: string]: any }) => {
  // Extra debug logging in development
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('[DEBUG] SafeFontAwesomeIcon received icon:', icon);
      console.log('[DEBUG]   type:', typeof icon);
      console.log('[DEBUG]   is array:', Array.isArray(icon));
      if (Array.isArray(icon)) {
        console.log('[DEBUG]   array length:', icon.length);
        console.log('[DEBUG]   array elements:', icon);
      }
      if (typeof icon === 'object' && icon !== null) {
        console.log('[DEBUG]   object keys:', Object.keys(icon));
        try {
          console.log('[DEBUG]   as JSON:', JSON.stringify(icon));
        } catch (e) {
          console.log('[DEBUG]   cannot convert to JSON:', e);
        }
      }
    } catch (debugError) {
      console.warn('[DEBUG] Error logging icon:', debugError);
    }
  }

  try {
    // ULTRA-COMPREHENSIVE empty/invalid icon check - catches ALL edge cases
    const isEmptyOrInvalid = (iconInput: any): boolean => {
      if (!iconInput) return true;
      
      // Handle basic empty object case
      if (typeof iconInput === 'object' && Object.keys(iconInput).length === 0) return true;
      
      // Try JSON.stringify for complex empty objects
      try {
        if (JSON.stringify(iconInput) === '{}') return true;
      } catch (e) {
        // If JSON.stringify fails, consider it invalid
        return true;
      }
      
      // Array-specific validation
      if (Array.isArray(iconInput)) {
        // Empty array
        if (iconInput.length === 0) return true;
        
        // Array too short
        if (iconInput.length < 2) return true;
        
        // Array with undefined/empty values
        if (!iconInput[0] || !iconInput[1]) return true;
        
        // Check if array values are strings
        if (typeof iconInput[0] !== 'string' || typeof iconInput[1] !== 'string') return true;
        
        // Check if array values are empty strings
        if (iconInput[0].trim() === '' || iconInput[1].trim() === '') return true;
      }
      
      // Object-specific validation for icon object format {prefix, iconName}
      if (typeof iconInput === 'object' && !Array.isArray(iconInput)) {
        // Check if required properties exist
        if (!('prefix' in iconInput) || !('iconName' in iconInput)) return true;
        
        // Check if properties are strings
        if (typeof iconInput.prefix !== 'string' || typeof iconInput.iconName !== 'string') return true;
        
        // Check if properties are empty strings
        if (iconInput.prefix.trim() === '' || iconInput.iconName.trim() === '') return true;
      }
      
      // String-specific validation
      if (typeof iconInput === 'string' && iconInput.trim() === '') return true;
      
      return false;
    };
    
    if (isEmptyOrInvalid(icon)) {
      console.warn('[FIXED] Empty or invalid icon:', typeof icon, Array.isArray(icon) ? 'array' : '', icon);
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={className}
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    }
    
    // Type-specific validation to ensure we only pass valid formats to FontAwesomeIcon
    try {
      if (typeof icon === 'string') {
        // String validation
        if (icon.trim() === '') {
          throw new Error('Empty string icon');
        }
        return <FontAwesomeIcon icon={icon} className={className} {...props} />;
      }
      
      if (Array.isArray(icon)) {
        // Array validation
        if (icon.length !== 2 || 
            typeof icon[0] !== 'string' || 
            typeof icon[1] !== 'string' ||
            icon[0].trim() === '' || 
            icon[1].trim() === '') {
          throw new Error('Invalid array format for icon');
        }
        return <FontAwesomeIcon icon={icon as [IconPrefix, IconName]} className={className} {...props} />;
      }
      
      if (typeof icon === 'object') {
        // Object validation
        if (!icon || 
            !('prefix' in icon) || 
            !('iconName' in icon) ||
            typeof icon.prefix !== 'string' ||
            typeof icon.iconName !== 'string' ||
            icon.prefix.trim() === '' ||
            icon.iconName.trim() === '') {
          throw new Error('Invalid object format for icon');
        }
        return <FontAwesomeIcon icon={icon} className={className} {...props} />;
      }
      
      // If we reach here, format is not recognized
      throw new Error('Unrecognized icon format');
    } catch (validationError) {
      console.error('[FIXED] Error validating icon format:', validationError);
      // Return fallback icon
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={className}
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    }
  } catch (e) {
    console.error('[FIXED] Uncaught error in SafeFontAwesomeIcon:', e);
    // Return fallback icon
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="red"
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
};

export const IconTester = () => {
  const [showErrors, setShowErrors] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<string>('');

  // Size classes for the FontAwesome icons
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  // Helper function to get Pro icons directly
  const getProIcon = (iconName: string | undefined, style: 'fas' | 'fal' | 'far' | 'fab' = 'fas'): IconProp => {
    // Debug in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG getProIcon] Input: name=${iconName}, style=${style}`);
    }
    
    try {
      // Ultra-strict input validation
      if (iconName === undefined || iconName === null) {
        console.warn(`[FIXED getProIcon] Undefined or null icon name: ${iconName}`);
        return ['fas' as IconPrefix, 'question' as IconName];
      }
      
      if (typeof iconName !== 'string') {
        console.warn(`[FIXED getProIcon] Icon name is not a string: ${typeof iconName}`, iconName);
        return ['fas' as IconPrefix, 'question' as IconName];
      }
      
      if (iconName.trim() === '') {
        console.warn('[FIXED getProIcon] Empty icon name');
        return ['fas' as IconPrefix, 'question' as IconName];
      }
      
      // Normalize style
      if (!style || !['fas', 'fal', 'far', 'fab'].includes(style)) {
        console.warn(`[FIXED getProIcon] Invalid style: ${style}, using 'fas' as fallback`);
        style = 'fas';
      }
      
      // Convert the iconName to a valid IconName in kebab-case format
      // First check if it's already kebab-case
      const validIconName = iconName.includes('-') 
        ? iconName 
        : iconName.replace(/([A-Z])/g, '-$1').toLowerCase();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG getProIcon] Converted iconName: ${validIconName}`);
      }
      
      // Verify the icon exists in the library
      try {
        const found = findIconDefinition({ 
          prefix: style as IconPrefix, 
          iconName: validIconName as IconName 
        });
        
        if (!found) {
          console.warn(`[FIXED getProIcon] Icon not found: ${style} ${validIconName}, using fallback`);
          return ['fas' as IconPrefix, 'question' as IconName];
        }
        
        // Return a safely constructed array
        return [style as IconPrefix, validIconName as IconName];
      } catch (findError) {
        console.warn(`[FIXED getProIcon] Error finding icon definition: ${style} ${validIconName}`, findError);
        return ['fas' as IconPrefix, 'question' as IconName];
      }
    } catch (e) {
      console.error(`[FIXED getProIcon] Unexpected error with ${style} ${iconName}:`, e);
      // Fallback to a safe icon
      return ['fas' as IconPrefix, 'question' as IconName];
    }
  };

  const testIcons = () => {
    const newErrors: Record<string, string[]> = {};
    let count = 0;

    // Set diagnostic start time for performance tracking
    const diagStartTime = performance.now();
    
    // Create diagnostics object to store comprehensive results
    type DiagnosticsErrorMap = Record<string, string[]>;
    
    const diagnostics = {
      startTime: new Date().toISOString(),
      summary: { total: 0, failed: 0, succeeded: 0 },
      performance: { startMs: diagStartTime, endMs: 0, totalMs: 0 },
      iconCounts: { solid: 0, outline: 0, kpi: 0, app: 0, platform: 0 },
      registrationStatus: { library: false, dom: false },
      memoryUsage: (typeof window !== 'undefined' && 
                   window.performance && 
                   // @ts-ignore - Some browsers may have this property
                   window.performance.memory) 
        // @ts-ignore - Memory usage is browser-dependent
        ? window.performance.memory
        : null,
      environment: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        viewport: typeof window !== 'undefined' 
          ? { width: window.innerWidth, height: window.innerHeight }
          : { width: 0, height: 0 }
      },
      errors: {} as DiagnosticsErrorMap,
      detailedReport: ''
    };

    // Test UI Solid icons
    const uiIcons = Object.keys(UI_ICON_MAP);
    const uiIconErrors: string[] = [];
    
    diagnostics.iconCounts.solid = uiIcons.length;
    
    uiIcons.forEach(icon => {
      try {
        // Just check if the property exists
        if (!(icon in UI_ICON_MAP)) {
          throw new Error(`Icon ${icon} not found in UI_ICON_MAP`);
        }
        
        // Advanced validation: also try to access the icon to ensure it's not an empty object
        const iconValue = UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP];
        if (!iconValue || (typeof iconValue === 'object' && Object.keys(iconValue).length === 0)) {
          throw new Error(`Icon ${icon} is an empty object or invalid value`);
        }
        
        diagnostics.summary.succeeded++;
      } catch (e) {
        uiIconErrors.push(icon);
        count++;
        diagnostics.summary.failed++;
      }
    });
    
    if (uiIconErrors.length > 0) {
      newErrors['UI Solid Icons'] = uiIconErrors;
      diagnostics.errors['UI Solid Icons'] = uiIconErrors;
    }
    
    // Test UI Outline/Regular icons
    const uiOutlineIcons = Object.keys(UI_OUTLINE_ICON_MAP);
    const uiOutlineIconErrors: string[] = [];
    
    diagnostics.iconCounts.outline = uiOutlineIcons.length;
    
    uiOutlineIcons.forEach(icon => {
      try {
        // Just check if the property exists
        if (!(icon in UI_OUTLINE_ICON_MAP)) {
          throw new Error(`Icon ${icon} not found in UI_OUTLINE_ICON_MAP`);
        }
        
        // Advanced validation: also try to access the icon to ensure it's not an empty object
        const iconValue = UI_OUTLINE_ICON_MAP[icon as keyof typeof UI_OUTLINE_ICON_MAP];
        if (!iconValue || (typeof iconValue === 'object' && Object.keys(iconValue).length === 0)) {
          throw new Error(`Icon ${icon} is an empty object or invalid value`);
        }
        
        diagnostics.summary.succeeded++;
      } catch (e) {
        uiOutlineIconErrors.push(icon);
        count++;
        diagnostics.summary.failed++;
      }
    });
    
    if (uiOutlineIconErrors.length > 0) {
      newErrors['UI Regular Icons'] = uiOutlineIconErrors;
      diagnostics.errors['UI Regular Icons'] = uiOutlineIconErrors;
    }

    // Test KPI icons
    const kpiIcons = Object.keys(KPI_ICON_URLS);
    const kpiIconErrors: string[] = [];
    
    diagnostics.iconCounts.kpi = kpiIcons.length;
    
    kpiIcons.forEach(icon => {
      try {
        // First check if the URL exists
        if (!KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS]) {
          throw new Error(`KPI icon URL not found for ${icon}`);
        }
        
        // Advanced check: validate that the URL is accessible
        const url = KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS];
        
        // Create hidden image to test if the SVG loads properly
        if (typeof document !== 'undefined') {
          const img = document.createElement('img');
          img.style.position = 'absolute';
          img.style.opacity = '0';
          img.style.pointerEvents = 'none';
          img.style.width = '1px';
          img.style.height = '1px';
          img.src = url;
          
          // Note: In a production environment, you would wait for the load/error events
          // but for diagnostic purposes, we'll just check the URL format
          if (!url.endsWith('.svg')) {
            throw new Error(`KPI icon URL for ${icon} does not point to an SVG file: ${url}`);
          }
        }
        
        diagnostics.summary.succeeded++;
      } catch (e) {
        kpiIconErrors.push(icon);
        count++;
        diagnostics.summary.failed++;
      }
    });
    
    if (kpiIconErrors.length > 0) {
      newErrors['KPI Icons'] = kpiIconErrors;
      diagnostics.errors['KPI Icons'] = kpiIconErrors;
    }

    // Test App icons
    const appIcons = Object.keys(APP_ICON_URLS);
    const appIconErrors: string[] = [];
    
    diagnostics.iconCounts.app = appIcons.length;
    
    appIcons.forEach(icon => {
      try {
        // First check if the URL exists
        if (!APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS]) {
          throw new Error(`App icon URL not found for ${icon}`);
        }
        
        // Advanced check: validate that the URL is accessible
        const url = APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS];
        
        // Create hidden image to test if the SVG loads properly
        if (typeof document !== 'undefined') {
          const img = document.createElement('img');
          img.style.position = 'absolute';
          img.style.opacity = '0';
          img.style.pointerEvents = 'none';
          img.style.width = '1px';
          img.style.height = '1px';
          img.src = url;
          
          // Note: In a production environment, you would wait for the load/error events
          // but for diagnostic purposes, we'll just check the URL format
          if (!url.endsWith('.svg')) {
            throw new Error(`App icon URL for ${icon} does not point to an SVG file: ${url}`);
          }
        }
        
        diagnostics.summary.succeeded++;
      } catch (e) {
        appIconErrors.push(icon);
        count++;
        diagnostics.summary.failed++;
      }
    });
    
    if (appIconErrors.length > 0) {
      newErrors['App Icons'] = appIconErrors;
      diagnostics.errors['App Icons'] = appIconErrors;
    }

    // Test Platform (Brands) icons
    const platformIcons = Object.keys(PLATFORM_ICON_MAP);
    const platformIconErrors: string[] = [];
    
    diagnostics.iconCounts.platform = platformIcons.length;
    
    platformIcons.forEach(icon => {
      try {
        // Just check if the property exists
        if (!(icon in PLATFORM_ICON_MAP)) {
          throw new Error(`Icon ${icon} not found in PLATFORM_ICON_MAP`);
        }
        
        // Advanced validation: also try to access the icon to ensure it's not an empty object
        const iconValue = PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP];
        if (!iconValue || (typeof iconValue === 'object' && Object.keys(iconValue).length === 0)) {
          throw new Error(`Platform icon ${icon} is an empty object or invalid value`);
        }
        
        diagnostics.summary.succeeded++;
      } catch (e) {
        platformIconErrors.push(icon);
        count++;
        diagnostics.summary.failed++;
      }
    });
    
    if (platformIconErrors.length > 0) {
      newErrors['Platform (Brands) Icons'] = platformIconErrors;
      diagnostics.errors['Platform (Brands) Icons'] = platformIconErrors;
    }

    // Test direct Pro Kit access
    try {
      // Test a sample of Pro icons in different styles
      const testProIcons = [
        { name: 'user', style: 'fas' as const },
        { name: 'user', style: 'fal' as const },
        { name: 'user', style: 'far' as const },
        { name: 'bell', style: 'fas' as const },
        { name: 'bell', style: 'fal' as const },
        { name: 'heart', style: 'fas' as const },
        { name: 'heart', style: 'fal' as const },
        { name: 'facebook', style: 'fab' as const },
        { name: 'x-twitter', style: 'fab' as const }
      ];
      
      const proIconErrors: string[] = [];
      
      testProIcons.forEach(({ name, style }) => {
        try {
          const iconValue = getProIcon(name, style);
          if (!iconValue || (Array.isArray(iconValue) && iconValue.length < 2)) {
            throw new Error(`Invalid icon returned for ${style} ${name}`);
          }
          diagnostics.summary.succeeded++;
        } catch (e) {
          proIconErrors.push(`${style} ${name}`);
          count++;
          diagnostics.summary.failed++;
        }
      });
      
      if (proIconErrors.length > 0) {
        newErrors['Pro Icons Direct Access'] = proIconErrors;
        diagnostics.errors['Pro Icons Direct Access'] = proIconErrors;
      }
    } catch (e) {
      newErrors['Pro Icons Direct Access'] = ['Error accessing Pro Kit: ' + (e as Error).message];
      diagnostics.errors['Pro Icons Direct Access'] = ['Error accessing Pro Kit: ' + (e as Error).message];
      count++;
      diagnostics.summary.failed++;
    }
    
    // Check fontawesome library registration status
    try {
      const registrationTest = findIconDefinition({ prefix: 'fas', iconName: 'question' });
      diagnostics.registrationStatus.library = !!registrationTest;
    } catch (e) {
      diagnostics.registrationStatus.library = false;
    }
    
    // Check for DOM-related icon issues
    if (typeof document !== 'undefined') {
      const questionIcons = document.querySelectorAll('.question-mark-icon-fallback');
      if (questionIcons.length > 0) {
        diagnostics.registrationStatus.dom = false;
        newErrors['DOM Fallback Icons'] = [`Found ${questionIcons.length} fallback icons in the DOM`];
        diagnostics.errors['DOM Fallback Icons'] = [`Found ${questionIcons.length} fallback icons in the DOM`];
        count++;
      } else {
        diagnostics.registrationStatus.dom = true;
      }
    }
    
    // Complete diagnostics
    diagnostics.performance.endMs = performance.now();
    diagnostics.performance.totalMs = diagnostics.performance.endMs - diagnostics.performance.startMs;
    diagnostics.summary.total = diagnostics.summary.succeeded + diagnostics.summary.failed;
    
    // Generate detailed report
    diagnostics.detailedReport = `
=== ICON DIAGNOSTIC REPORT ===
Time: ${diagnostics.startTime}
Test Duration: ${diagnostics.performance.totalMs.toFixed(2)}ms

SUMMARY:
- Total Icons Tested: ${diagnostics.summary.total}
- Successful: ${diagnostics.summary.succeeded}
- Failed: ${diagnostics.summary.failed}
- Success Rate: ${(diagnostics.summary.succeeded / diagnostics.summary.total * 100).toFixed(1)}%

ICON COUNTS:
- UI Solid Icons: ${diagnostics.iconCounts.solid}
- UI Outline Icons: ${diagnostics.iconCounts.outline}
- KPI Icons: ${diagnostics.iconCounts.kpi}
- App Icons: ${diagnostics.iconCounts.app}
- Platform Icons: ${diagnostics.iconCounts.platform}

REGISTRATION STATUS:
- FontAwesome Library: ${diagnostics.registrationStatus.library ? 'OK' : 'ISSUES DETECTED'}
- DOM Issues: ${diagnostics.registrationStatus.dom ? 'None Detected' : 'FALLBACK ICONS FOUND'}

SYSTEM INFO:
- Browser: ${diagnostics.environment.userAgent}
- Viewport: ${diagnostics.environment.viewport.width}x${diagnostics.environment.viewport.height}

ERRORS:
${Object.entries(diagnostics.errors)
  .map(([category, errors]) => `- ${category}: ${errors.length} issues\n  ${errors.join('\n  ')}`)
  .join('\n')}
    `.trim();

    // Recommend solutions based on errors
    if (count > 0) {
      diagnostics.detailedReport += `\n\nRECOMMENDED SOLUTIONS:
1. If Font Awesome Library issues are detected, check that the library is properly initialized.
2. For KPI/App icon issues, verify the SVG files exist at the correct paths.
3. For empty object errors, check the icon mappings for undefined values.
4. For DOM fallback icons, find places where icons are rendered without proper validation.`;
    } else {
      diagnostics.detailedReport += '\n\nNo issues detected. All icons are working properly!';
    }
    
    // Save the diagnostic report to state for display
    setDiagnosticReport(diagnostics.detailedReport);
    
    // Log diagnostics to console for advanced debugging
    console.info('Icon Diagnostics:', diagnostics);

    setErrors(newErrors);
    setErrorCount(count);
    setShowErrors(true);
    setShowAllIcons(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold mb-4">Icon Test Suite</h2>
          <Button 
            onClick={testIcons}
            variant="primary"
            size="md"
          >
            Run Icon Tests
          </Button>
        </div>
        <p className="text-gray-600 mb-6">This component renders all available icons to ensure they display correctly after migration.</p>
      </div>

      {showErrors && (
        <div className={`p-4 rounded-md ${errorCount > 0 ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'}`}>
          <h3 className="font-semibold mb-2">
            {errorCount > 0 
              ? `Found ${errorCount} issues` 
              : 'All icons loaded successfully'}
          </h3>
          
          {Object.entries(errors).map(([category, iconList]) => (
            <div key={category} className="mb-4">
              <h4 className="font-medium">{category}</h4>
              <ul className="list-disc list-inside">
                {iconList.map(icon => (
                  <li key={icon}>{icon}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Advanced diagnostic information */}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Detailed Diagnostic Report</h4>
              <Button 
                onClick={() => {
                  // Copy to clipboard if available
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(diagnosticReport || 'Detailed report not available')
                      .then(() => alert('Diagnostic report copied to clipboard!'))
                      .catch(err => console.error('Failed to copy report:', err));
                  }
                }}
                variant="secondary"
                size="xs"
              >
                Copy Full Report
              </Button>
            </div>
            
            <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-80">
              <p className="whitespace-pre-wrap">
                {diagnosticReport || 'Run the test to generate a diagnostic report'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* REGULAR ICONS WITH HOVER TO SOLID EFFECT */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">UI Icons (Light → Solid)</h3>
            <span className="text-sm text-blue-500">{Object.keys(UI_ICON_MAP).length} icons</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.keys(UI_ICON_MAP).slice(0, showAllIcons ? undefined : 24).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group cursor-pointer">
                {name && (
                  <>
                    <div className="ui-icon-hover-container relative" style={{ width: '24px', height: '24px' }}>
                      <Icon 
                        name={name as keyof typeof UI_ICON_MAP}
                        size="md"
                        className="text-[#333333] absolute transition-opacity duration-150 opacity-100 group-hover:opacity-0"
                      />
                      <Icon 
                        name={name as keyof typeof UI_ICON_MAP}
                        size="md"
                        solid
                        className={`text-[${iconConfig.colors.hover}] absolute transition-opacity duration-150 opacity-0 group-hover:opacity-100`}
                      />
                    </div>
                    <span className="text-xs mt-2 text-center text-gray-600">{name}</span>
                  </>
                )}
              </div>
            ))}
            {!showAllIcons && Object.keys(UI_ICON_MAP).length > 24 && (
              <div className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => setShowAllIcons(true)}>
                <div className="h-5 w-5 flex items-center justify-center">
                  <span className="text-xl">...</span>
                </div>
                <span className="text-xs mt-2 text-center text-blue-500">Show all</span>
              </div>
            )}
          </div>
        </section>
        
        {/* KPI ICONS */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">KPI Icons</h3>
            <span className="text-sm text-blue-500">{Object.keys(KPI_ICON_URLS).length} icons</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.keys(KPI_ICON_URLS).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group cursor-pointer">
                {name && KPI_ICON_URLS[name as keyof typeof KPI_ICON_URLS] && (
                  <>
                    <div className="relative" style={{ width: '24px', height: '24px' }}>
                      <Icon 
                        kpiName={name as keyof typeof KPI_ICON_URLS} 
                        size="md" 
                        className="text-[#333333] absolute transition-colors duration-150 group-hover:text-[#00BFFF]" 
                      />
                    </div>
                    <span className="text-xs mt-2 text-center text-gray-600">{name}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* APP ICONS */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">App Icons</h3>
            <span className="text-sm text-blue-500">{Object.keys(APP_ICON_URLS).length} icons</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.keys(APP_ICON_URLS).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group cursor-pointer">
                {name && APP_ICON_URLS[name as keyof typeof APP_ICON_URLS] && (
                  <>
                    <div className="relative" style={{ width: '24px', height: '24px' }}>
                      <Icon 
                        appName={name as keyof typeof APP_ICON_URLS} 
                        size="md" 
                        className="text-[#333333] absolute transition-colors duration-150 group-hover:text-[#00BFFF]" 
                      />
                    </div>
                    <span className="text-xs mt-2 text-center text-gray-600">{name}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* PLATFORM ICONS */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">Platform Icons</h3>
            <span className="text-sm text-blue-500">{Object.keys(PLATFORM_ICON_MAP).length} icons</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.keys(PLATFORM_ICON_MAP).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group cursor-pointer">
                {name && (
                  <>
                    <div className="relative" style={{ width: '24px', height: '24px' }}>
                      <Icon 
                        platformName={name as keyof typeof PLATFORM_ICON_MAP} 
                        size="md" 
                        className="text-[#333333] absolute transition-colors duration-150 group-hover:text-[#00BFFF]" 
                      />
                    </div>
                    <span className="text-xs mt-2 text-center text-gray-600">{name}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* DIRECT FONT AWESOME USAGE */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Font Awesome Pro Usage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 border p-4 rounded-lg">
            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-2">Solid Icons</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('user', 'fas')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">user</span>
                </div>
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('house', 'fas')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">house</span>
                </div>
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('gear', 'fas')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">gear</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-2">Light Icons</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('user', 'fal')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">user</span>
                </div>
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('bell', 'fal')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">bell</span>
                </div>
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('heart', 'fal')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">heart</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-2">Regular Icons</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('user', 'far')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">user</span>
                </div>
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('bell', 'far')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">bell</span>
                </div>
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('heart', 'far')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">heart</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-2">Brand Icons</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('x-twitter', 'fab')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">x-twitter</span>
                </div>
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('facebook', 'fab')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">facebook</span>
                </div>
                <div className="flex flex-col items-center">
                  <SafeFontAwesomeIcon 
                    icon={getProIcon('pinterest', 'fab')} 
                    className={cn(sizeClasses.md)} 
                  />
                  <span className="text-xs mt-1 text-center text-gray-600">pinterest</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* SPECIAL CASES & VARIANTS */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Special Cases</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2 border p-4 rounded-lg">
              <h4 className="font-medium text-sm border-b pb-2">Active State</h4>
              <div className="flex space-x-4 justify-center">
                <div className="flex flex-col items-center">
                  <Icon appName="home" active size="lg" />
                  <span className="text-xs mt-2 text-gray-600">active=true</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon appName="home" size="lg" />
                  <span className="text-xs mt-2 text-gray-600">active=false</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 border p-4 rounded-lg">
              <h4 className="font-medium text-sm border-b pb-2">Color Variations</h4>
              <div className="flex space-x-4 justify-center">
                <div className="flex flex-col items-center">
                  <Icon name="info" color="blue" size="lg" />
                  <span className="text-xs mt-2 text-gray-600">blue</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="warning" color="orange" size="lg" />
                  <span className="text-xs mt-2 text-gray-600">orange</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="check" color="green" size="lg" />
                  <span className="text-xs mt-2 text-gray-600">green</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 border p-4 rounded-lg">
              <h4 className="font-medium text-sm border-b pb-2">Size Variations</h4>
              <div className="flex items-end space-x-2 justify-center">
                <div className="flex flex-col items-center">
                  <Icon name="user" size="xs" />
                  <span className="text-xs mt-2 text-gray-600">xs</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="user" size="sm" />
                  <span className="text-xs mt-2 text-gray-600">sm</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="user" size="md" />
                  <span className="text-xs mt-2 text-gray-600">md</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="user" size="lg" />
                  <span className="text-xs mt-2 text-gray-600">lg</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="user" size="xl" />
                  <span className="text-xs mt-2 text-gray-600">xl</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 border p-4 rounded-lg">
              <h4 className="font-medium text-sm border-b pb-2">Interactive Hover/Click</h4>
              <div className="flex space-x-4 justify-center">
                <div className="flex flex-col items-center group">
                  <div className="p-2 border rounded hover:bg-gray-100">
                    {/* Safe usage with try-catch and checking */}
                    <SafeFontAwesomeIcon 
                      icon={getProIcon('coffee', 'fal')} 
                      className="w-6 h-6 group-hover:hidden" 
                    />
                    <SafeFontAwesomeIcon 
                      icon={getProIcon('coffee', 'fas')} 
                      className="w-6 h-6 hidden group-hover:block" 
                    />
                  </div>
                  <span className="text-xs mt-2 text-gray-600">Light → Solid</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IconTester; 