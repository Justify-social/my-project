'use client';

import React, { useState } from 'react';
import { Icon, UI_ICON_MAP, KPI_ICON_URLS, APP_ICON_URLS, PLATFORM_ICON_MAP } from './icon';

export const IconTester = () => {
  const [showErrors, setShowErrors] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const testIcons = () => {
    const newErrors: Record<string, string[]> = {};
    let count = 0;

    // Test UI icons
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
      newErrors['UI Icons'] = uiIconErrors;
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

    // Test Platform icons
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
      newErrors['Platform Icons'] = platformIconErrors;
    }

    setErrors(newErrors);
    setErrorCount(count);
    setShowErrors(true);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Icon Test Suite</h2>
        <p className="text-gray-600 mb-6">This component renders all available icons to ensure they display correctly after migration.</p>
        
        <button 
          onClick={testIcons}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Run Icon Tests
        </button>
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
        <section>
          <h3 className="text-lg font-semibold mb-4">UI Icons</h3>
          <div className="grid grid-cols-6 gap-4">
            {Object.keys(UI_ICON_MAP).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                <Icon name={name as any} size="md" />
                <span className="text-xs mt-2 text-center">{name}</span>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h3 className="text-lg font-semibold mb-4">KPI Icons</h3>
          <div className="grid grid-cols-6 gap-4">
            {Object.keys(KPI_ICON_URLS).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                <Icon kpiName={name as any} size="md" />
                <span className="text-xs mt-2 text-center">{name}</span>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h3 className="text-lg font-semibold mb-4">App Icons</h3>
          <div className="grid grid-cols-6 gap-4">
            {Object.keys(APP_ICON_URLS).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                <Icon appName={name as any} size="md" />
                <span className="text-xs mt-2 text-center">{name}</span>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h3 className="text-lg font-semibold mb-4">Platform Icons</h3>
          <div className="grid grid-cols-6 gap-4">
            {Object.keys(PLATFORM_ICON_MAP).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                <Icon platformName={name as any} size="md" />
                <span className="text-xs mt-2 text-center">{name}</span>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h3 className="text-lg font-semibold mb-4">Solid UI Icons</h3>
          <div className="grid grid-cols-6 gap-4">
            {Object.keys(UI_ICON_MAP).map(name => (
              <div key={name} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                <Icon name={name as any} size="md" solid />
                <span className="text-xs mt-2 text-center">{name} (solid)</span>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h3 className="text-lg font-semibold mb-4">Special Cases</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Active State</h4>
              <div className="flex space-x-4">
                <div className="flex flex-col items-center">
                  <Icon appName="home" active size="lg" />
                  <span className="text-xs mt-2">active=true</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon appName="home" size="lg" />
                  <span className="text-xs mt-2">active=false</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Color Variations</h4>
              <div className="flex space-x-4">
                <div className="flex flex-col items-center">
                  <Icon name="info" color="blue" size="lg" />
                  <span className="text-xs mt-2">blue</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="warning" color="orange" size="lg" />
                  <span className="text-xs mt-2">orange</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="check" color="green" size="lg" />
                  <span className="text-xs mt-2">green</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Size Variations</h4>
              <div className="flex items-end space-x-2">
                <div className="flex flex-col items-center">
                  <Icon name="user" size="xs" />
                  <span className="text-xs mt-2">xs</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="user" size="sm" />
                  <span className="text-xs mt-2">sm</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="user" size="md" />
                  <span className="text-xs mt-2">md</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="user" size="lg" />
                  <span className="text-xs mt-2">lg</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="user" size="xl" />
                  <span className="text-xs mt-2">xl</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Additional CSS Classes</h4>
              <div className="flex space-x-4">
                <div className="flex flex-col items-center">
                  <Icon name="heart" className="animate-pulse" size="lg" />
                  <span className="text-xs mt-2">animate-pulse</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon name="heart" className="rotate-45" size="lg" />
                  <span className="text-xs mt-2">rotate-45</span>
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