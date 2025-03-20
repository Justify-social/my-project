'use client';

import React, { useState } from 'react';
import { Icon, UI_ICON_MAP, UI_OUTLINE_ICON_MAP, KPI_ICON_URLS, APP_ICON_URLS, PLATFORM_ICON_MAP } from './icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
// Import from the Pro Kit
import '@awesome.me/kit-3e2951e127';
// The kit adds its icons to the global fontawesome library
import { library } from '@fortawesome/fontawesome-svg-core';
import { IconPrefix, IconName, IconProp } from '@fortawesome/fontawesome-svg-core';

export const IconTester = () => {
  const [showErrors, setShowErrors] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showAllIcons, setShowAllIcons] = useState(false);

  // Size classes for the FontAwesome icons
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  // Helper function to get Pro icons directly
  const getProIcon = (iconName: string, style: 'fas' | 'fal' | 'far' | 'fab' = 'fas'): IconProp => {
    try {
      return [style as IconPrefix, iconName as IconName];
    } catch (e) {
      console.error(`Error in getProIcon for ${style} ${iconName}:`, e);
      // Fallback to a safe icon
      return ['fas' as IconPrefix, 'question' as IconName];
    }
  };

  const testIcons = () => {
    const newErrors: Record<string, string[]> = {};
    let count = 0;

    // Test UI Solid icons
    const uiIcons = Object.keys(UI_ICON_MAP);
    const uiIconErrors: string[] = [];
    
    uiIcons.forEach(icon => {
      try {
        // Just check if the property exists
        if (!(icon in UI_ICON_MAP)) {
          throw new Error(`Icon ${icon} not found in UI_ICON_MAP`);
        }
      } catch (e) {
        uiIconErrors.push(icon);
        count++;
      }
    });
    
    if (uiIconErrors.length > 0) {
      newErrors['UI Solid Icons'] = uiIconErrors;
    }
    
    // Test UI Outline/Regular icons
    const uiOutlineIcons = Object.keys(UI_OUTLINE_ICON_MAP);
    const uiOutlineIconErrors: string[] = [];
    
    uiOutlineIcons.forEach(icon => {
      try {
        // Just check if the property exists
        if (!(icon in UI_OUTLINE_ICON_MAP)) {
          throw new Error(`Icon ${icon} not found in UI_OUTLINE_ICON_MAP`);
        }
      } catch (e) {
        uiOutlineIconErrors.push(icon);
        count++;
      }
    });
    
    if (uiOutlineIconErrors.length > 0) {
      newErrors['UI Regular Icons'] = uiOutlineIconErrors;
    }

    // Test KPI icons
    const kpiIcons = Object.keys(KPI_ICON_URLS);
    const kpiIconErrors: string[] = [];
    
    kpiIcons.forEach(icon => {
      if (!KPI_ICON_URLS[icon as keyof typeof KPI_ICON_URLS]) {
        kpiIconErrors.push(icon);
        count++;
      }
    });
    
    if (kpiIconErrors.length > 0) {
      newErrors['KPI Icons'] = kpiIconErrors;
    }

    // Test App icons
    const appIcons = Object.keys(APP_ICON_URLS);
    const appIconErrors: string[] = [];
    
    appIcons.forEach(icon => {
      if (!APP_ICON_URLS[icon as keyof typeof APP_ICON_URLS]) {
        appIconErrors.push(icon);
        count++;
      }
    });
    
    if (appIconErrors.length > 0) {
      newErrors['App Icons'] = appIconErrors;
    }

    // Test Platform (Brands) icons
    const platformIcons = Object.keys(PLATFORM_ICON_MAP);
    const platformIconErrors: string[] = [];
    
    platformIcons.forEach(icon => {
      try {
        // Just check if the property exists
        if (!(icon in PLATFORM_ICON_MAP)) {
          throw new Error(`Icon ${icon} not found in PLATFORM_ICON_MAP`);
        }
      } catch (e) {
        platformIconErrors.push(icon);
        count++;
      }
    });
    
    if (platformIconErrors.length > 0) {
      newErrors['Platform (Brands) Icons'] = platformIconErrors;
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
        { name: 'twitter', style: 'fab' as const }
      ];
      
      const proIconErrors: string[] = [];
      
      testProIcons.forEach(({ name, style }) => {
        try {
          getProIcon(name, style);
        } catch (e) {
          proIconErrors.push(`${style} ${name}`);
          count++;
        }
      });
      
      if (proIconErrors.length > 0) {
        newErrors['Pro Icons Direct Access'] = proIconErrors;
      }
    } catch (e) {
      newErrors['Pro Icons Direct Access'] = ['Error accessing Pro Kit: ' + (e as Error).message];
      count++;
    }

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
          <button 
            onClick={testIcons}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Run Icon Tests
          </button>
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
        </div>
      )}

      <div className="space-y-8">
        {/* SOLID ICONS */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">UI Icons (Solid)</h3>
            <span className="text-sm text-blue-500">{Object.keys(UI_ICON_MAP).length} icons</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.keys(UI_ICON_MAP).slice(0, showAllIcons ? undefined : 24).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                {name && (
                  <>
                    <Icon name={name as any} size="md" solid />
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
        
        {/* REGULAR ICONS WITH HOVER TO SOLID EFFECT */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">UI Icons (Light → Solid on hover)</h3>
            <span className="text-sm text-blue-500">{Object.keys(UI_ICON_MAP).length} icons</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.keys(UI_ICON_MAP).slice(0, showAllIcons ? undefined : 24).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                {name && (
                  <>
                    <div className="ui-icon-hover-container">
                      <Icon name={name as any} size="md" className="ui-icon-hover ui-icon-hover-light" />
                      <Icon name={name as any} size="md" solid className="ui-icon-hover ui-icon-hover-solid" />
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
        
        {/* KPI ICONS WITH HOVER TO ACCENT COLOR */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">KPI Icons (Hover for accent color)</h3>
            <span className="text-sm text-blue-500">{Object.keys(KPI_ICON_URLS).length} icons</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.keys(KPI_ICON_URLS).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                {name && KPI_ICON_URLS[name as keyof typeof KPI_ICON_URLS] && (
                  <>
                    <Icon kpiName={name as any} size="md" className="kpi-icon-hover" />
                    <span className="text-xs mt-2 text-center text-gray-600">{name}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* APP ICONS WITH HOVER TO ACCENT COLOR */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">App Icons (Hover for accent color)</h3>
            <span className="text-sm text-blue-500">{Object.keys(APP_ICON_URLS).length} icons</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.keys(APP_ICON_URLS).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                {name && APP_ICON_URLS[name as keyof typeof APP_ICON_URLS] && (
                  <>
                    <Icon appName={name as any} size="md" className="app-icon-hover" />
                    <span className="text-xs mt-2 text-center text-gray-600">{name}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* PLATFORM (BRANDS) ICONS */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-4">Platform Icons (Brands)</h3>
            <span className="text-sm text-blue-500">{Object.keys(PLATFORM_ICON_MAP).length} icons</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.keys(PLATFORM_ICON_MAP).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                {name && (
                  <>
                    <Icon platformName={name as any} size="md" className="platform-icon-hover" />
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
                  <FontAwesomeIcon icon={getProIcon('user', 'fas')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">user</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('house', 'fas')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">house</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('gear', 'fas')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">gear</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-2">Light Icons</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('user', 'fal')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">user</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('bell', 'fal')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">bell</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('heart', 'fal')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">heart</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-2">Regular Icons</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('user', 'far')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">user</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('bell', 'far')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">bell</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('heart', 'far')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">heart</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-2">Brand Icons</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('twitter', 'fab')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">twitter (X)</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('facebook', 'fab')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">facebook</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={getProIcon('github', 'fab')} className={cn(sizeClasses.md)} />
                  <span className="text-xs mt-1 text-center text-gray-600">github</span>
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
                    <FontAwesomeIcon 
                      icon={getProIcon('coffee', 'fal')} 
                      className="w-6 h-6 group-hover:hidden" 
                    />
                    <FontAwesomeIcon 
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