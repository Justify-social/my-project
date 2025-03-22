'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Icon,
  PLATFORM_ICON_MAP,
  KPI_ICON_URLS,
  APP_ICON_URLS,
  ButtonIcon,
  StaticIcon,
  DeleteIcon,
  WarningIcon,
  SuccessIcon,
} from '../';
import { cn } from '@/lib/utils';

// Define CSS variables for consistent color usage
const COLORS = {
  primary: '#333333', // Jet
  accent: '#00BFFF',  // Deep Sky Blue
  delete: '#FF3B30',  // Red
  warning: '#FFCC00', // Yellow
  success: '#34C759', // Green
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
    variants: Object.freeze(['faTriangleExclamation', 'faExclamation', 'faShield']), // Warning icons for demonstrations
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
          const importedModule = await import('../../icons/icon-data');
          iconData = importedModule.iconData || {};
        } catch (e) {
          console.warn('Icon data module not found, using static list instead');
        }
        
        const solidIcons: string[] = [];
        const lightIcons: string[] = [];
        
        // Process icons from iconData if available
        if (Object.keys(iconData).length > 0) {
          Object.keys(iconData).forEach(name => {
            if (name.endsWith('Light')) {
              lightIcons.push(name);
            } else {
              solidIcons.push(name);
            }
          });
        } else {
          // Fallback to static list if no dynamic icons found
          console.info('Using static icon list as fallback');
          
          // Common solid icons we know should exist
          ['faUser', 'faCheck', 'faGear', 'faBell', 'faStar', 'faEnvelope', 
           'faCalendar', 'faSearch', 'faPlus', 'faMinus', 'faChevronDown'].forEach(name => {
            solidIcons.push(name);
          });
          
          // Common light icons we know should exist
          ['faUserLight', 'faCheckLight', 'faGearLight', 'faBellLight', 'faStarLight', 
           'faEnvelopeLight', 'faCalendarLight', 'faSearchLight', 'faPlusLight'].forEach(name => {
            lightIcons.push(name);
          });
        }
        
        setSvgIcons({
          solid: solidIcons,
          light: lightIcons
        });
      } catch (e) {
        console.error('Error loading SVG icons:', e);
        // Set empty arrays to prevent rendering errors
        setSvgIcons({ solid: [], light: [] });
      }
    };
    
    loadIconData();
  }, []); // Empty array ensures this runs only once on mount

  // Keyboard navigation handler for icon grid
  const handleKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!iconGridRef.current) return;
    
    const grid = iconGridRef.current;
    const items = Array.from(grid.querySelectorAll('[role="gridcell"]'));
    const currentIndex = items.findIndex(item => item === document.activeElement);
    
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
    '--success-color': COLORS.success,
  } as React.CSSProperties;

  return (
    <div className="space-y-4" style={cssVars}>
      {/* HEADER SECTION - Merged with Implementation Details */}
      <div className="p-4 rounded bg-blue-50 mb-2">
        <h2 className="text-xl font-bold mb-2">Comprehensive Icon Library</h2>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[var(--primary-color)] rounded-sm" aria-hidden="true"></div>
              <p className="font-medium">Primary Color - Jet (#333333)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[var(--accent-color)] rounded-sm" aria-hidden="true"></div>
              <p className="font-medium">Accent Color - Deep Sky Blue (#00BFFF)</p>
            </div>
            <p className="text-sm mt-2 text-gray-700">This component displays all available Font Awesome icons in the system. Font Awesome Classic includes Solid, Light, and Brands icon sets.</p>
          </div>
          <div className="bg-white p-3 rounded border text-sm">
            <h4 className="font-medium mb-1">Icon System Implementation</h4>
            <ul className="space-y-1 list-disc list-inside text-gray-700">
              <li>SVG files stored in <code className="bg-gray-100 px-1 rounded">public/ui-icons/</code></li>
              <li>Light icons transform to solid on hover</li>
              <li>FontAwesome only used as devDependencies</li>
              <li>Button icons require parent 'group' class</li>
              <li>Action colors: delete=red, warning=yellow, success=green</li>
            </ul>
          </div>
        </div>
      </div>

      {/* UI ICONS SECTION */}
      <section className="pt-2" aria-labelledby="ui-icons-heading">
        <div className="flex items-center justify-between mb-2">
          <h3 id="ui-icons-heading" className="text-lg font-semibold">UI Icons with Hover Effect (Light → Solid on Hover)</h3>
          <span className="text-sm text-blue-500">{svgIcons.solid.length + svgIcons.light.length} icons</span>
        </div>
        <p className="mb-4 text-sm text-gray-700">
          All SVG icons from <code className="bg-gray-100 px-1 rounded">public/ui-icons</code> with light → solid hover transition. Hover over any icon to see it change from light to solid variant.
        </p>
        
        {/* Icon grid with keyboard navigation */}
        <div 
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4"
          ref={iconGridRef}
          role="grid"
          aria-label="UI Icons"
          onKeyDown={handleKeyNav}
        >
          {svgIcons.solid
            .filter(name => name && typeof name === 'string')
            .sort((a, b) => a.replace(/^fa/, '').localeCompare(b.replace(/^fa/, '')))
            .map((iconName, index) => {
              // For each icon, we'll show the light version by default and solid on hover
              const baseName = iconName.replace(/Light$/, '');
              const lightName = `${baseName}Light`;
              const displayName = baseName.replace(/^fa/, '');
              
              return (
                <div 
                  key={iconName} 
                  className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-opacity-75"
                  role="gridcell"
                  tabIndex={index === 0 ? 0 : -1}
                >
                  <div 
                    className="relative"
                    style={{ width: '24px', height: '24px' }}
                    aria-label={`${displayName} icon`}
                  >
                    {/* Light version shown by default, hidden on hover/focus */}
                    <Icon
                      name={lightName} 
                      size="md"
                      className="text-[var(--primary-color)] absolute transition-opacity duration-150 opacity-100 group-hover:opacity-0 group-focus-within:opacity-0" 
                    />
                    {/* Solid version hidden by default, shown on hover/focus */}
                    <Icon
                      name={baseName} 
                      size="md"
                      solid
                      className="text-[var(--accent-color)] absolute transition-opacity duration-150 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" 
                    />
                  </div>
                  <span className="text-xs mt-2 text-center text-gray-700">
                    {displayName}
                  </span>
                </div>
              );
            })}
        </div>
      </section>
      
      {/* ICON VARIANTS SECTION */}
      <section className="mt-6 pt-4 border-t" aria-labelledby="icon-variants-heading">
        <div className="flex items-center justify-between mb-4">
          <h3 id="icon-variants-heading" className="text-lg font-semibold">CSS Icon Variants</h3>
          <span className="text-sm text-blue-500">{Object.keys(VARIANT_STYLES).length} variants</span>
        </div>
        <p className="mb-4 text-sm text-gray-700">
          Different CSS styling options for warning icons, showing how the same icons can be presented in various ways
          to suit different UI contexts and requirements.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(VARIANT_STYLES).map(([variant, style]) => (
            <div key={variant} className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-medium text-base mb-2 capitalize flex items-center">
                {variant} Variant
                {style.showHover && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Hover effect</span>
                )}
              </h4>
              <p className="text-xs text-gray-600 mb-3">{style.description}</p>
              <div className="grid grid-cols-3 gap-4">
                {demoIcons.variants.map((iconName, idx) => (
                  <div 
                    key={`${variant}-${iconName}`} 
                    className={cn(
                      "flex flex-col items-center p-2 border rounded",
                      style.showHover ? "group hover:bg-gray-50" : "hover:bg-gray-50"
                    )}
                    role="button"
                    tabIndex={0}
                    aria-label={`${iconName.replace(/^fa/, '')} with ${variant} styling`}
                  >
                    {variant === 'button' ? (
                      <div className="relative" style={{ width: '24px', height: '24px' }}>
                        {/* Light version shown by default, hidden on hover */}
                        <Icon
                          name={`${iconName}Light`} 
                          size="md"
                          className="text-[var(--warning-color)] absolute transition-opacity duration-150 opacity-100 group-hover:opacity-0" 
                        />
                        {/* Solid version hidden by default, shown on hover */}
                        <Icon
                          name={iconName} 
                          size="md"
                          solid
                          className="text-[var(--warning-color)] absolute transition-opacity duration-150 opacity-0 group-hover:opacity-100" 
                        />
                      </div>
                    ) : variant === 'colors' ? (
                      <Icon
                        name={iconName}
                        size="md"
                        solid
                        className={cn(
                          idx === 0 ? "text-[var(--warning-color)]" : 
                          idx === 1 ? "text-[var(--delete-color)]" : 
                          "text-[var(--primary-color)]"
                        )}
                        iconType="static"
                      />
                    ) : variant === 'sizes' ? (
                      <Icon
                        name={iconName}
                        size={idx === 0 ? "sm" : idx === 1 ? "md" : "lg"}
                        solid
                        className="text-[var(--warning-color)]"
                        iconType="static"
                      />
                    ) : variant === 'animated' ? (
                      <div className={cn(
                        idx === 0 ? "animate-pulse" : 
                        idx === 1 ? "animate-bounce" : 
                        "animate-spin"
                      )}>
                        <Icon
                          name={iconName}
                          size="md"
                          solid
                          className="text-[var(--warning-color)]"
                          iconType="static"
                        />
                      </div>
                    ) : variant === 'badges' ? (
                      <div className="relative">
                        <Icon
                          name={iconName}
                          size="md"
                          solid
                          className="text-[var(--warning-color)]"
                          iconType="static"
                        />
                        {/* Different badge styles */}
                        {idx === 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3"></span>
                        )}
                        {idx === 1 && (
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-xs text-white rounded-full w-4 h-4 flex items-center justify-center">
                            {idx}
                          </span>
                        )}
                        {idx === 2 && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded">
                            new
                          </span>
                        )}
                      </div>
                    ) : (
                      <Icon
                        name={iconName}
                        size="md"
                        solid
                        className={style.className}
                        iconType="static"
                      />
                    )}
                    <span className="text-xs mt-2 text-center text-gray-700">
                      {iconName.replace(/^fa/, '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* PLATFORM ICONS SECTION */}
      <section className="mt-6 pt-4 border-t" aria-labelledby="platform-icons-heading">
        <div className="flex items-center justify-between mb-4">
          <h3 id="platform-icons-heading" className="text-lg font-semibold">Platform Icons</h3>
          <span className="text-sm text-blue-500">{Object.keys(PLATFORM_ICON_MAP).length} icons</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {Object.keys(PLATFORM_ICON_MAP).map((name, index) => {
            const iconName = PLATFORM_ICON_MAP[name as keyof typeof PLATFORM_ICON_MAP];
            
            // All platform icons now use the same pattern for consistency
            return (
              <div 
                key={name} 
                className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group focus-within:ring-2 focus-within:ring-blue-400"
                tabIndex={0}
                role="button"
                aria-label={`${name} platform icon`}
              >
                <div className="relative h-8 flex items-center justify-center" style={{ width: '32px' }}>
                  {/* Default state - using the SVG directly from brands folder */}
                  <img 
                    src={`/ui-icons/brands/${name === 'x' ? 'x-twitter' : name}.svg`}
                    alt=""
                    aria-hidden="true"
                    className="h-6 w-6 object-contain absolute transition-opacity duration-150 opacity-100 group-hover:opacity-0 group-focus-within:opacity-0" 
                    style={{ filter: "brightness(0) saturate(100%)" }}
                  />
                  {/* Hover state with blue color */}
                  <img 
                    src={`/ui-icons/brands/${name === 'x' ? 'x-twitter' : name}.svg`}
                    alt=""
                    aria-hidden="true"
                    className="h-6 w-6 object-contain absolute transition-opacity duration-150 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                    style={{ 
                      filter: "brightness(0) saturate(100%) invert(55%) sepia(64%) saturate(5876%) hue-rotate(185deg) brightness(106%) contrast(102%)"
                    }}
                  />
                </div>
                <span className="text-xs mt-1 text-center text-gray-700">{name}</span>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* APP ICONS SECTION */}
      <section className="mt-6 pt-4 border-t" aria-labelledby="app-icons-heading">
        <div className="flex items-center justify-between mb-4">
          <h3 id="app-icons-heading" className="text-lg font-semibold">App Icons</h3>
          <span className="text-sm text-blue-500">{Object.keys(APP_ICON_URLS).length} icons</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {Object.keys(APP_ICON_URLS).map((name, index) => {
            const iconUrl = APP_ICON_URLS[name as keyof typeof APP_ICON_URLS];
            return (
              <div 
                key={name} 
                className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group focus-within:ring-2 focus-within:ring-blue-400"
                tabIndex={0}
                role="button"
                aria-label={`${name} app icon`}
              >
                <div className="relative h-8 flex items-center justify-center" style={{ width: '32px' }}>
                  {/* Default state (Jet #333333) */}
                  <img 
                    src={iconUrl} 
                    alt=""
                    aria-hidden="true"
                    className="h-6 w-6 object-contain absolute transition-opacity duration-150 opacity-100 group-hover:opacity-0 group-focus-within:opacity-0" 
                    style={{ filter: "brightness(0) saturate(100%)" }}
                  />
                  {/* Hover state with blue color */}
                  <img 
                    src={iconUrl} 
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 m-auto h-6 w-6 object-contain transition-opacity duration-150 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                    style={{ 
                      filter: "brightness(0) saturate(100%) invert(55%) sepia(64%) saturate(5876%) hue-rotate(185deg) brightness(106%) contrast(102%)"
                    }}
                  />
                </div>
                <span className="text-xs mt-1 text-center text-gray-700">{name}</span>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* KPI ICONS SECTION */}
      <section className="mt-6 pt-4 border-t" aria-labelledby="kpi-icons-heading">
        <div className="flex items-center justify-between mb-4">
          <h3 id="kpi-icons-heading" className="text-lg font-semibold">KPI Icons</h3>
          <span className="text-sm text-blue-500">{Object.keys(KPI_ICON_URLS).length} icons</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.keys(KPI_ICON_URLS).map((name, index) => {
            const iconUrl = KPI_ICON_URLS[name as keyof typeof KPI_ICON_URLS];
            return (
              <div 
                key={name} 
                className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 group focus-within:ring-2 focus-within:ring-blue-400"
                tabIndex={0}
                role="button"
                aria-label={`${name} KPI icon`}
              >
                <div className="relative h-8 flex items-center justify-center" style={{ width: '32px' }}>
                  {/* Default state (Jet #333333) */}
                  <img 
                    src={iconUrl} 
                    alt=""
                    aria-hidden="true"
                    className="h-6 w-6 object-contain absolute transition-opacity duration-150 opacity-100 group-hover:opacity-0 group-focus-within:opacity-0"
                    style={{ filter: "brightness(0) saturate(100%)" }}
                  />
                  {/* Hover state with blue color */}
                  <img 
                    src={iconUrl} 
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 m-auto h-6 w-6 object-contain transition-opacity duration-150 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                    style={{ 
                      filter: "brightness(0) saturate(100%) invert(55%) sepia(64%) saturate(5876%) hue-rotate(185deg) brightness(106%) contrast(102%)"
                    }}
                  />
                </div>
                <span className="text-xs mt-1 text-center text-gray-700">{name}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
});

export default Object.freeze(IconTester);

// Add a warning if someone tries to modify the component
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'IconTester is a locked component and should not be modified. ' +
    'Create a new component that wraps IconTester if you need to extend its functionality.'
  );
}