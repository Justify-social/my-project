'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icon, PLATFORM_ICON_MAP, KPI_ICON_URLS, APP_ICON_URLS, ButtonIcon, StaticIcon, DeleteIcon, WarningIcon, SuccessIcon } from '../';
import { cn } from '@/lib/utils';
import { IconData } from '../validation';

// Define CSS variables for consistent color usage
const COLORS = {
  primary: '#333333',
  // Jet
  accent: '#00BFFF',
  // Deep Sky Blue
  delete: '#FF3B30',
  // Red
  warning: '#FFCC00',
  // Yellow
  success: '#34C759' // Green
};

// Define interface for variant styles
interface VariantStyle {
  className: string;
  description: string;
  showHover: boolean;
  secondaryClassName?: string; // Optional property for duotone effect
}

// Define variant styles for different icon presentations
const VARIANT_STYLES: Record<string, VariantStyle> = {
  button: {
    className: "transition-all duration-200",
    description: "Interactive icons that transform from light to solid on hover",
    showHover: true
  },
  colors: {
    className: "text-[var(--warning-color)]",
    description: "Warning icons with different color treatments",
    showHover: false
  },
  sizes: {
    className: "transform scale-125",
    description: "Warning icons displayed at different sizes",
    showHover: false
  },
  animated: {
    className: "animate-pulse text-[var(--warning-color)]",
    description: "Warning icons with animation effects for attention",
    showHover: false
  },
  badges: {
    className: "relative",
    description: "Warning icons with notification badges",
    showHover: false
  }
};

/**
 * A specialized icon component for testing that uses direct SVG rendering
 * to prevent any movement/shifting between light and solid variants.
 */
const StableIcon = ({
  lightName,
  solidName,
  showSolid = false,
  color = "#333333",
  // Primary Color - Jet
  hoverColor = "#00BFFF",
  // Accent Color - Deep Sky Blue
  className = ""







}: {lightName: string;solidName: string;showSolid?: boolean;color?: string;hoverColor?: string;className?: string;}) => {
  const baseName = lightName.replace(/Light$/, '');
  const lightIconUrl = `/ui-icons/light/${getIconBaseName(baseName)}.svg`;
  const solidIconUrl = `/ui-icons/solid/${getIconBaseName(baseName)}.svg`;

  // Use a directly controlled SVG viewBox that is the same for both variants
  return <div className={`${cn("relative inline-block w-6 h-6", className)} font-work-sans`}>
      {/* Container for both SVGs with fixed dimensions */}
      <div className="w-full h-full relative font-work-sans">
        {/* Light version (Primary Color - Jet) */}
        <div className={`${cn("absolute inset-0 transition-opacity duration-150", showSolid ? "opacity-0" : "opacity-100 group-hover:opacity-0 group-focus-within:opacity-0")} font-work-sans`} style={{
        backgroundImage: `url(${lightIconUrl})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        filter: `brightness(0) saturate(100%)`,
        color
      }} />
        {/* Solid version (Accent Color - Deep Sky Blue) */}
        <div className={`${cn("absolute inset-0 transition-opacity duration-150", showSolid ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} font-work-sans`} style={{
        backgroundImage: `url(${solidIconUrl})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        filter: `brightness(0) saturate(100%) invert(55%) sepia(95%) saturate(1200%) hue-rotate(185deg) brightness(105%) contrast(99%)`,
        color: hoverColor
      }} />
      </div>
    </div>;
};

// Helper function to get the base name of an icon (copied from SvgIcon.tsx)
function getIconBaseName(fullName: string): string {
  if (!fullName) return 'question';

  // Handle special Light icon suffix - remove Light suffix
  const nameWithoutLightSuffix = fullName.replace(/Light$/, '');

  // Special case for X Twitter
  if (nameWithoutLightSuffix === 'faXTwitter') {
    return 'x-twitter';
  }

  // Convert e.g. faUserCircle to user-circle
  const baseName = nameWithoutLightSuffix.replace(/^fa/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return baseName;
}

/**
 * IconTester Component
 * 
 * A comprehensive testing and demonstration component for the icon system.
 * Shows all available icons with interactive examples and usage patterns.
 * 
 * Features:
 * - Dynamic loading of all available icons
 * - Interactive hover effects demonstration
 * - Specialized icon variant examples
 * - Common usage patterns and size demonstrations
 * - Platform, App, and KPI icon displays
 * 
 * @locked
 * @version 1.0.0
 * @final
 * 
 * IMPORTANT: This component is locked and should not be modified.
 * Any changes or feature requests should be implemented in a new component
 * that extends or wraps this one rather than modifying it directly.
 */

// Create readonly types to prevent modifications
type ReadonlySvgIcons = Readonly<{
  solid: ReadonlyArray<string>;
  light: ReadonlyArray<string>;
}>;
export const IconTester = Object.freeze(() => {
  const [svgIcons, setSvgIcons] = useState<ReadonlySvgIcons>({
    solid: [],
    light: []
  });

  // Add state for dynamic icons and errors
  const [dynamicIcons, setDynamicIcons] = useState<IconData[]>([]);
  const [iconErrors, setIconErrors] = useState<string[]>([]);
  const [iconWarnings, setIconWarnings] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<Record<string, number>>({});

  // Refs for keyboard navigation
  const iconGridRef = useRef<HTMLDivElement>(null);

  // Demo icons for each category with clear, semantic names
  const demoIcons = Object.freeze({
    action: Object.freeze({
      default: Object.freeze(['faEdit', 'faPen', 'faGear']),
      delete: Object.freeze(['faTrash', 'faTrashCan', 'faXmark']),
      warning: Object.freeze(['faTriangleExclamation', 'faExclamation', 'faShield']),
      success: Object.freeze(['faCheck', 'faCircleCheck', 'faThumbsUp'])
    }),
    sizes: 'faUser',
    colors: Object.freeze(['faStar', 'faHeart', 'faCircleCheck']),
    effects: Object.freeze(['faSpinner', 'faArrowDown', 'faArrowRight']),
    common: Object.freeze(['faPlus', 'faChevronRight', 'faDownload', 'faShare']),
    variants: Object.freeze(['faTriangleExclamation', 'faExclamation', 'faShield']) // Warning icons for demonstrations
  });

  // Load icons on component mount only
  useEffect(() => {
    // Function to load icon data
    const loadIconData = async () => {
      try {
        let iconData: Record<string, any> = {};

        // Modern dynamic import with try/catch
        try {
          // Dynamic import with proper type handling
          const importedModule = await import('../icon-data');
          iconData = importedModule.iconData || {};
        } catch (e) {
          console.warn('Icon data module not found, using static list instead', e);
        }
        const solidIcons: string[] = [];
        const lightIcons: string[] = [];

        // Process icons from iconData if available
        if (Object.keys(iconData).length > 0) {
          // Extract icon names from iconData object
          Object.keys(iconData).forEach((name) => {
            if (name.endsWith('Light')) {
              lightIcons.push(name);
            } else if (!name.includes('Light')) {
              // Make sure we don't add both faUser and faUserLight to solid
              solidIcons.push(name);
            }
          });
          console.log(`Loaded ${solidIcons.length} solid icons and ${lightIcons.length} light icons`);
        } else {
          // Fallback to static list if no dynamic icons found
          console.info('Using static icon list as fallback');

          // Common solid icons we know should exist
          ['faUser', 'faCheck', 'faGear', 'faBell', 'faStar', 'faEnvelope', 'faCalendar', 'faSearch', 'faPlus', 'faMinus', 'faChevronDown'].forEach((name) => {
            solidIcons.push(name);
          });

          // Common light icons we know should exist
          ['faUserLight', 'faCheckLight', 'faGearLight', 'faBellLight', 'faStarLight', 'faEnvelopeLight', 'faCalendarLight', 'faSearchLight', 'faPlusLight'].forEach((name) => {
            lightIcons.push(name);
          });
        }
        setSvgIcons({
          solid: solidIcons,
          light: lightIcons
        });

        // Load dynamically discovered icons from the API
        try {
          console.log('Fetching icons from API...');
          fetch('/api/icons').then((res) => {
            console.log('API response status:', res.status);
            return res.json();
          }).then((data) => {
            console.log('API response data:', {
              iconCount: data?.icons?.length || 0,
              errorCount: data?.errors?.length || 0,
              warningCount: data?.warnings?.length || 0,
              diagnostics: data?.diagnostics || {},
              sampleIcons: data?.icons?.slice(0, 5).map((i: any) => i.name) || []
            });
            if (data?.icons?.length > 0) {
              console.log(`Loaded ${data.icons.length} icons from API`);
              // Sort icons alphabetically for consistent display
              const sortedIcons = [...data.icons].sort((a, b) => a.name.localeCompare(b.name));
              setDynamicIcons(sortedIcons);
              setIconErrors(data.errors || []);
              setIconWarnings(data.warnings || []);
              setDiagnostics(data.diagnostics || {});
            } else {
              console.warn('No icons returned from API');
              if (data?.errors?.length > 0) {
                setIconErrors([...data.errors, 'No icons were loaded from the API. Check server logs for details.']);
              } else {
                setIconErrors(['No icons were loaded from the API. Check server logs for details.']);
              }
            }
          }).catch((err) => {
            console.error('Error fetching icon data:', err);
            setIconErrors(['Failed to load dynamic icons: ' + (err.message || 'Unknown error'), 'Check browser console and server logs for details.']);
          });
        } catch (e) {
          console.error('Error loading dynamic icons:', e);
          setIconErrors(['Exception occurred while loading icons: ' + (e instanceof Error ? e.message : String(e))]);
        }
      } catch (e) {
        console.error('Error loading SVG icons:', e);
        // Set empty arrays to prevent rendering errors
        setSvgIcons({
          solid: [],
          light: []
        });
      }
    };
    loadIconData();
  }, []); // Empty array ensures this runs only once on mount

  // Keyboard navigation handler for icon grid
  const handleKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!iconGridRef.current) return;
    const grid = iconGridRef.current;
    const items = Array.from(grid.querySelectorAll('[role="gridcell"]'));
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    if (currentIndex === -1) return;
    let nextIndex;
    const cols = window.innerWidth >= 768 ? 8 : window.innerWidth >= 640 ? 6 : 4;
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + cols, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - cols, 0);
        break;
      default:
        return;
    }
    (items[nextIndex] as HTMLElement).focus();
    e.preventDefault();
  };

  // Custom style with CSS variables
  const cssVars = {
    '--primary-color': COLORS.primary,
    '--accent-color': COLORS.accent,
    '--delete-color': COLORS.delete,
    '--warning-color': COLORS.warning,
    '--success-color': COLORS.success
  } as React.CSSProperties;
  return <div className="space-y-4 font-work-sans" style={cssVars}>
      {/* HEADER SECTION - Merged with Implementation Details */}
      <div className="p-4 rounded bg-blue-50 mb-2 font-work-sans">
        <h2 className="text-xl font-bold mb-2 font-sora">Comprehensive Icon Library</h2>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 font-work-sans">
          <div className="space-y-2 font-work-sans">
            <div className="flex items-center gap-2 font-work-sans">
              <div className="w-4 h-4 bg-[var(--primary-color)] rounded-sm font-work-sans" aria-hidden="true"></div>
              <p className="font-medium font-work-sans">Primary Color - Jet (#333333)</p>
            </div>
            <div className="flex items-center gap-2 font-work-sans">
              <div className="w-4 h-4 bg-[var(--accent-color)] rounded-sm font-work-sans" aria-hidden="true"></div>
              <p className="font-medium font-work-sans">Accent Color - Deep Sky Blue (#00BFFF)</p>
            </div>
            <p className="text-sm mt-2 text-gray-700 font-work-sans">This component displays all available Font Awesome icons in the system. Font Awesome Classic includes Solid, Light, and Brands icon sets.</p>
          </div>
          <div className="bg-white p-3 rounded border text-sm font-work-sans">
            <h4 className="font-medium mb-1 font-sora">Icon System Implementation</h4>
            <ul className="space-y-1 list-disc list-inside text-gray-700 font-work-sans">
              <li className="font-work-sans">SVG files stored in <code className="bg-gray-100 px-1 rounded">public/ui-icons/</code></li>
              <li className="font-work-sans">Light icons transform to solid on hover</li>
              <li className="font-work-sans">FontAwesome only used as devDependencies</li>
              <li className="font-work-sans">Button icons require parent 'group' class</li>
              <li className="font-work-sans">Action colors: delete=red, warning=yellow, success=green</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Show errors and warnings if any */}
      {(iconErrors.length > 0 || iconWarnings.length > 0) &&
    <div className="p-4 rounded bg-gray-50 mb-4 border border-gray-200 font-work-sans">
          <h3 className="text-lg font-semibold mb-3 font-sora">Icon System Status</h3>
          
          {diagnostics && Object.keys(diagnostics).length > 0 &&
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-work-sans">
              <div className="bg-white p-3 rounded border font-work-sans">
                <span className="text-sm text-gray-500 font-work-sans">Total Icons</span>
                <p className="text-lg font-semibold font-work-sans">{(diagnostics.totalLight || 0) + (diagnostics.totalSolid || 0) + (diagnostics.totalBrands || 0)}</p>
              </div>
              <div className="bg-white p-3 rounded border font-work-sans">
                <span className="text-sm text-gray-500 font-work-sans">Valid Pairs</span>
                <p className={`text-lg font-semibold ${diagnostics.validPairs === 0 ? 'text-red-600' : ''} font-work-sans`}>
                  {diagnostics.validPairs || 0}
                </p>
              </div>
              <div className="bg-white p-3 rounded border font-work-sans">
                <span className="text-sm text-gray-500 font-work-sans">Missing Light</span>
                <p className={`text-lg font-semibold ${diagnostics.missingLight > 0 ? 'text-amber-600' : 'text-green-600'} font-work-sans`}>
                  {diagnostics.missingLight || 0}
                </p>
              </div>
              <div className="bg-white p-3 rounded border font-work-sans">
                <span className="text-sm text-gray-500 font-work-sans">Missing Solid</span>
                <p className={`text-lg font-semibold ${diagnostics.missingSolid > 0 ? 'text-amber-600' : 'text-green-600'} font-work-sans`}>
                  {diagnostics.missingSolid || 0}
                </p>
              </div>
            </div>
      }
          
          {iconErrors.length > 0 &&
      <div className="p-4 rounded bg-red-50 mb-3 border border-red-200 font-work-sans">
              <h4 className="text-base font-semibold text-red-700 mb-2 flex items-center font-sora">
                <Icon name="faTriangleExclamation" className="mr-2 text-red-500 font-work-sans" solid />
                Icon Errors Detected
              </h4>
              <ul className="list-disc pl-5 space-y-2 font-work-sans">
                {iconErrors.map((error, index) =>
          <li key={index} className="text-red-600 font-work-sans">
                    {error}
                    {error.includes('missing solid variants') &&
            <div className="text-sm text-gray-700 mt-1 font-work-sans">
                        Fix: Run <code className="bg-gray-100 px-1 rounded">node scripts/icon-management/download-icons.js</code> to download missing solid variants.
                      </div>
            }
                    {error.includes('missing light variants') &&
            <div className="text-sm text-gray-700 mt-1 font-work-sans">
                        Fix: Run <code className="bg-gray-100 px-1 rounded">node scripts/icon-management/download-icons.js</code> to generate light variants from solid icons.
                      </div>
            }
                    {error.includes('Essential icons') &&
            <div className="text-sm text-gray-700 mt-1 font-work-sans">
                        Fix: Edit <code className="bg-gray-100 px-1 rounded">scripts/icon-management/download-icons.js</code> to add missing icons to REQUIRED_LIGHT_ICONS or REQUIRED_SOLID_ICONS.
                      </div>
            }
                  </li>
          )}
              </ul>
            </div>
      }
          
          {iconWarnings.length > 0 &&
      <div className="p-4 rounded bg-amber-50 border border-amber-200 font-work-sans">
              <h4 className="text-base font-semibold text-amber-700 mb-2 flex items-center font-sora">
                <Icon name="faWarning" className="mr-2 text-amber-500 font-work-sans" solid />
                Icon Warnings
              </h4>
              <ul className="list-disc pl-5 space-y-2 font-work-sans">
                {iconWarnings.map((warning, index) =>
          <li key={index} className="text-amber-600 font-work-sans">
                    {warning}
                    {warning.includes('identical light/solid variants') &&
            <div className="text-sm text-gray-700 mt-1 font-work-sans">
                        Fix: Run <code className="bg-gray-100 px-1 rounded">node scripts/icon-management/audit-icons.js --fix-duplicates</code> to regenerate distinct light versions.
                      </div>
            }
                    {warning.includes('Invalid or corrupt') &&
            <div className="text-sm text-gray-700 mt-1 font-work-sans">
                        Fix: Re-download the affected icons or manually fix the SVG files to include proper viewBox and path data.
                      </div>
            }
                  </li>
          )}
              </ul>
            </div>
      }
        </div>
    }

      {/* UI ICONS SECTION */}
      <section className="pt-2" aria-labelledby="ui-icons-heading">
        <div className="flex items-center justify-between mb-2 font-work-sans">
          <h3 id="ui-icons-heading" className="text-lg font-semibold font-sora">UI Icons with Hover Effect (Light → Solid on Hover)</h3>
          <span className="text-sm text-blue-500 font-work-sans">{dynamicIcons.length > 0 ? dynamicIcons.length : svgIcons.solid.length + svgIcons.light.length} icons</span>
        </div>
        <p className="mb-4 text-sm text-gray-700 font-work-sans">
          All SVG icons from <code className="bg-gray-100 px-1 rounded">public/ui-icons</code> with light → solid hover transition. Hover over any icon to see it change from light to solid variant.
        </p>
        
        {/* Icon grid with keyboard navigation - using dynamic icons if available */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 font-work-sans" ref={iconGridRef} role="grid" aria-label="UI Icons" onKeyDown={handleKeyNav}>
          {dynamicIcons.length > 0 ?
        // Use dynamically discovered icons
        dynamicIcons.map((icon, index) => <div key={icon.fileName} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-opacity-75 font-work-sans" role="gridcell" tabIndex={index === 0 ? 0 : -1}>
                <StableIcon lightName={icon.lightName} solidName={icon.solidName} color="var(--primary-color)" hoverColor="var(--accent-color)" showSolid={false} className="text-[var(--secondary-color)] font-work-sans" />
                <span className="text-xs mt-2 text-center text-gray-700 font-work-sans">
                  {icon.name}
                </span>
              </div>) :
        // Fallback to original icon rendering
        svgIcons.solid.filter((name) => name && typeof name === 'string').sort((a, b) => a.replace(/^fa/, '').localeCompare(b.replace(/^fa/, ''))).map((iconName, index) => {
          // For each icon, we'll show the light version by default and solid on hover
          const baseName = iconName.replace(/Light$/, '');
          const lightName = `${baseName}Light`;
          const displayName = baseName.replace(/^fa/, '');
          return <div key={iconName} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-opacity-75 font-work-sans" role="gridcell" tabIndex={index === 0 ? 0 : -1}>
                    <StableIcon lightName={lightName} solidName={baseName} color="var(--primary-color)" hoverColor="var(--accent-color)" showSolid={false} className="text-[var(--secondary-color)] font-work-sans" />
                    <span className="text-xs mt-2 text-center text-gray-700 font-work-sans">
                      {displayName}
                    </span>
                  </div>;
        })}
        </div>
      </section>
      
      {/* ICON VARIANTS SECTION */}
      <section className="mt-6 pt-4 border-t" aria-labelledby="icon-variants-heading">
        <div className="flex items-center justify-between mb-4 font-work-sans">
          <h3 id="icon-variants-heading" className="text-lg font-semibold font-sora">CSS Icon Variants</h3>
          <span className="text-sm text-blue-500 font-work-sans">{Object.keys(VARIANT_STYLES).length} variants</span>
        </div>
        <p className="mb-4 text-sm text-gray-700 font-work-sans">
          Different CSS styling options for warning icons, showing how the same icons can be presented in various ways
          to suit different UI contexts and requirements.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-work-sans">
          {Object.entries(VARIANT_STYLES).map(([variant, style]) => <div key={variant} className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow font-work-sans">
              <h4 className="font-medium text-base mb-2 capitalize flex items-center font-sora">
                {variant} Variant
                {style.showHover && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-work-sans">Hover effect</span>}
              </h4>
              <p className="text-xs text-gray-600 mb-3 font-work-sans">{style.description}</p>
              <div className="grid grid-cols-3 gap-4 font-work-sans">
                {demoIcons.variants.map((iconName, idx) => <div key={`${variant}-${iconName}`} className={`${cn("flex flex-col items-center p-2 border rounded", style.showHover ? "group hover:bg-gray-50" : "hover:bg-gray-50")} font-work-sans`} role="button" tabIndex={0} aria-label={`${iconName.replace(/^fa/, '')} with ${variant} styling`}>
                    {variant === 'button' ?
              // Use our custom StableIcon for button variants
              <StableIcon lightName={`${iconName}Light`} solidName={iconName} color="var(--warning-color)" hoverColor="var(--warning-color)" showSolid={false} className="text-[var(--secondary-color)] font-work-sans" /> : variant === 'colors' ? <Icon name={iconName} size="md" solid className={cn(idx === 0 ? "text-[var(--warning-color)]" : idx === 1 ? "text-[var(--delete-color)]" : "text-[var(--primary-color)]")} iconType="static" /> : variant === 'sizes' ? <Icon name={iconName} size={idx === 0 ? "sm" : idx === 1 ? "md" : "lg"} solid className="text-[var(--warning-color)] font-work-sans" iconType="static" /> : variant === 'animated' ? <div className={`${cn(idx === 0 ? "animate-pulse" : idx === 1 ? "animate-bounce" : "animate-spin")} font-work-sans`}>
                        <Icon name={iconName} size="md" solid className="text-[var(--warning-color)] font-work-sans" iconType="static" />
                      </div> : variant === 'badges' ? <div className="relative font-work-sans">
                        <Icon name={iconName} size="md" solid className="text-[var(--warning-color)] font-work-sans" iconType="static" />
                        {/* Different badge styles */}
                        {idx === 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 font-work-sans"></span>}
                        {idx === 1 && <span className="absolute -top-1 -right-1 bg-blue-500 text-xs text-white rounded-full w-4 h-4 flex items-center justify-center font-work-sans">
                            {idx}
                          </span>}
                        {idx === 2 && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded font-work-sans">
                            new
                          </span>}
                      </div> : <Icon name={iconName} size="md" solid className={style.className} iconType="static" />}
                    <span className="text-xs mt-2 text-center text-gray-700 font-work-sans">
                      {iconName.replace(/^fa/, '')}
                    </span>
                  </div>)}
              </div>
            </div>)}
        </div>
      </section>
      
      {/* PLATFORM ICONS SECTION */}
      <section className="mt-6 pt-4 border-t" aria-labelledby="platform-icons-heading">
        <div className="flex items-center justify-between mb-4 font-work-sans">
          <h3 id="platform-icons-heading" className="text-lg font-semibold font-sora">Platform Icons</h3>
          <span className="text-sm text-blue-500 font-work-sans">{Object.keys(PLATFORM_ICON_MAP).length} icons</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 font-work-sans">
          {Object.keys(PLATFORM_ICON_MAP).map((name, index) => {
          const iconName = PLATFORM_ICON_MAP[name as keyof typeof PLATFORM_ICON_MAP];

          // All platform icons now use the same pattern for consistency
          return <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group focus-within:ring-2 focus-within:ring-blue-400 font-work-sans" tabIndex={0} role="button" aria-label={`${name} platform icon`}>
                <div className="relative h-8 flex items-center justify-center font-work-sans" style={{
              width: '32px'
            }}>
                  {/* Default state - using the SVG directly from brands folder */}
                  <img src={`/ui-icons/brands/${name === 'x' ? 'x-twitter' : name}.svg`} alt="" aria-hidden="true" className="h-6 w-6 object-contain absolute transition-opacity duration-150 opacity-100 group-hover:opacity-0 group-focus-within:opacity-0" style={{
                filter: "brightness(0) saturate(100%)"
              }} />
                  {/* Hover state with blue color */}
                  <img src={`/ui-icons/brands/${name === 'x' ? 'x-twitter' : name}.svg`} alt="" aria-hidden="true" className="h-6 w-6 object-contain absolute transition-opacity duration-150 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" style={{
                filter: "brightness(0) saturate(100%) invert(55%) sepia(64%) saturate(5876%) hue-rotate(185deg) brightness(106%) contrast(102%)"
              }} />
                </div>
                <span className="text-xs mt-1 text-center text-gray-700 font-work-sans">{name}</span>
              </div>;
        })}
        </div>
      </section>
      
      {/* APP ICONS SECTION */}
      <section className="mt-6 pt-4 border-t" aria-labelledby="app-icons-heading">
        <div className="flex items-center justify-between mb-4 font-work-sans">
          <h3 id="app-icons-heading" className="text-lg font-semibold font-sora">App Icons</h3>
          <span className="text-sm text-blue-500 font-work-sans">{Object.keys(APP_ICON_URLS).length} icons</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 font-work-sans">
          {Object.keys(APP_ICON_URLS).map((name, index) => {
          const iconUrl = APP_ICON_URLS[name as keyof typeof APP_ICON_URLS];
          return <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group focus-within:ring-2 focus-within:ring-blue-400 font-work-sans" tabIndex={0} role="button" aria-label={`${name} app icon`}>
                <div className="relative h-8 flex items-center justify-center font-work-sans" style={{
              width: '32px'
            }}>
                  {/* Default state (Jet #333333) */}
                  <img src={iconUrl} alt="" aria-hidden="true" className="h-6 w-6 object-contain absolute transition-opacity duration-150 opacity-100 group-hover:opacity-0 group-focus-within:opacity-0" style={{
                filter: "brightness(0) saturate(100%)"
              }} />
                  {/* Hover state with blue color */}
                  <img src={iconUrl} alt="" aria-hidden="true" className="absolute inset-0 m-auto h-6 w-6 object-contain transition-opacity duration-150 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" style={{
                filter: "brightness(0) saturate(100%) invert(55%) sepia(64%) saturate(5876%) hue-rotate(185deg) brightness(106%) contrast(102%)"
              }} />
                </div>
                <span className="text-xs mt-1 text-center text-gray-700 font-work-sans">{name}</span>
              </div>;
        })}
        </div>
      </section>
      
      {/* KPI ICONS SECTION */}
      <section className="mt-6 pt-4 border-t" aria-labelledby="kpi-icons-heading">
        <div className="flex items-center justify-between mb-4 font-work-sans">
          <h3 id="kpi-icons-heading" className="text-lg font-semibold font-sora">KPI Icons</h3>
          <span className="text-sm text-blue-500 font-work-sans">{Object.keys(KPI_ICON_URLS).length} icons</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-work-sans">
          {Object.keys(KPI_ICON_URLS).map((name, index) => {
          const iconUrl = KPI_ICON_URLS[name as keyof typeof KPI_ICON_URLS];
          return <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group focus-within:ring-2 focus-within:ring-blue-400 font-work-sans" tabIndex={0} role="button" aria-label={`${name} KPI icon`}>
                <div className="relative h-8 flex items-center justify-center font-work-sans" style={{
              width: '32px'
            }}>
                  {/* Default state (Jet #333333) */}
                  <img src={iconUrl} alt="" aria-hidden="true" className="h-6 w-6 object-contain absolute transition-opacity duration-150 opacity-100 group-hover:opacity-0 group-focus-within:opacity-0" style={{
                filter: "brightness(0) saturate(100%)"
              }} />
                  {/* Hover state with blue color */}
                  <img src={iconUrl} alt="" aria-hidden="true" className="absolute inset-0 m-auto h-6 w-6 object-contain transition-opacity duration-150 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" style={{
                filter: "brightness(0) saturate(100%) invert(55%) sepia(64%) saturate(5876%) hue-rotate(185deg) brightness(106%) contrast(102%)"
              }} />
                </div>
                <span className="text-xs mt-1 text-center text-gray-700 font-work-sans">{name}</span>
              </div>;
        })}
        </div>
      </section>
    </div>;
});
export default Object.freeze(IconTester);

// Add a warning if someone tries to modify the component
if (process.env.NODE_ENV === 'development') {
  console.warn('IconTester is a locked component and should not be modified. ' + 'Create a new component that wraps IconTester if you need to extend its functionality.');
}