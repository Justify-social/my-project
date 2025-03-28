'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icons';

// Add a function to check if an SVG icon exists
async function checkIconExists(iconPath) {
  try {
    const response = await fetch(iconPath, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Error checking icon at ${iconPath}:`, error);
    return false;
  }
}

export default function FontAwesomeTestPage() {
  const [fontAwesomeLoaded, setFontAwesomeLoaded] = useState(false);
  
  // Check if Font Awesome is loaded
  useEffect(() => {
    // Check for the Font Awesome global object
    const isFontAwesomeLoaded = typeof window !== 'undefined' && 
      (window as any).FontAwesome !== undefined;
    
    setFontAwesomeLoaded(isFontAwesomeLoaded);
    
    console.log('Font Awesome loaded check:', isFontAwesomeLoaded);
    
    if (isFontAwesomeLoaded) {
      console.log('Font Awesome version:', (window as any).FontAwesome.version);
    }
  }, []);
  
  // Add useEffect to check some icon files
  useEffect(() => {
    const checkIcons = async () => {
      // Check a few key icon types
      const solidUser = await checkIconExists('/icons/solid/user.svg');
      console.log('Icon file /icons/solid/user.svg exists:', solidUser);
      
      const lightUser = await checkIconExists('/icons/light/user.svg');
      console.log('Icon file /icons/light/user.svg exists:', lightUser);
      
      const brandLift = await checkIconExists('/icons/app/Brand_Lift.svg');
      console.log('Icon file /icons/app/Brand_Lift.svg exists:', brandLift);
    };
    
    checkIcons();
  }, []);
  
  const iconSets = [
    {
      name: 'Light Icons (fa-light)',
      prefix: 'fa-light',
      icons: ['fa-user-circle', 'fa-users', 'fa-paint-brush', 'fa-circle-info', 'fa-bell', 'fa-gear']
    },
    {
      name: 'Solid Icons (fa-solid)',
      prefix: 'fa-solid',
      icons: ['fa-user-circle', 'fa-users', 'fa-paint-brush', 'fa-circle-info', 'fa-bell', 'fa-gear']
    },
    {
      name: 'Brand Icons (fa-brands)',
      prefix: 'fa-brands',
      icons: ['fa-twitter', 'fa-facebook', 'fa-instagram', 'fa-linkedin', 'fa-github']
    }
  ];
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Font Awesome Icon Test</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded">
        <h2 className="text-xl font-bold mb-2">Status</h2>
        <p className="mb-2">
          Font Awesome Loaded: <span className={fontAwesomeLoaded ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {fontAwesomeLoaded ? "Yes" : "No"}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          This page tests Font Awesome icon rendering to diagnose display issues.
        </p>
      </div>
      
      {/* Icon Grid */}
      {iconSets.map((set, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-xl font-bold mb-4">{set.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {set.icons.map((icon, iconIndex) => {
              // Extract icon name from class name (e.g., fa-user -> faUser)
              const iconClass = icon.replace('fa-', '');
              // Convert kebab-case to camelCase (e.g., fa-circle-info -> faCircleInfo)
              const iconName = 'fa' + iconClass
                .split('-')
                .map((part, i) => i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
              
              return (
                <div key={iconIndex} className="flex flex-col items-center p-4 border rounded bg-white hover:shadow-md transition">
                  <div className="w-16 h-16 flex items-center justify-center mb-2 bg-gray-50 rounded">
                    <Icon 
                      name={iconName} 
                      className="text-3xl text-blue-500" 
                      solid={set.prefix === 'fa-solid'} 
                    />
                  </div>
                  <code className="text-xs text-gray-600 bg-gray-100 p-1 rounded">
                    {`${set.prefix} ${icon}`}
                  </code>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Icons used in SectionHeader component */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">SectionHeader Component Icons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded bg-white">
            <div className="flex items-start mb-6">
              <div className="mr-4 p-2 bg-gray-50 rounded">
                <Icon name="faCircleInfo" className="w-6 h-6 text-[#00BFFF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#333333]">Profile Settings</h2>
                <p className="mt-1 text-sm text-[#4A5568]">Default SectionHeader icon</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded bg-white">
            <div className="flex items-start mb-6">
              <div className="mr-4 p-2 bg-gray-50 rounded">
                <Icon name="faUsers" className="w-6 h-6 text-[#00BFFF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#333333]">Team Management</h2>
                <p className="mt-1 text-sm text-[#4A5568]">Team icon</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded bg-white">
            <div className="flex items-start mb-6">
              <div className="mr-4 p-2 bg-gray-50 rounded">
                <Icon name="faPaintBrush" className="w-6 h-6 text-[#00BFFF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#333333]">Branding</h2>
                <p className="mt-1 text-sm text-[#4A5568]">Branding icon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs Mock */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Navigation Tabs Mock</h2>
        <div className="border-b border-[#D1D5DB]">
          <nav className="flex space-x-1" aria-label="Settings navigation">
            {[
              { id: 'profile', label: 'Profile Settings', icon: 'fa-light fa-user-circle', active: false },
              { id: 'team', label: 'Team Management', icon: 'fa-light fa-users', active: true },
              { id: 'branding', label: 'Branding', icon: 'fa-light fa-paint-brush', active: false }
            ].map((tab) => {
              const isActive = tab.active;
              return (
                <button 
                  key={tab.id} 
                  className={`
                    relative py-4 px-6 flex items-center transition-all duration-200
                    ${isActive 
                      ? 'text-[#00BFFF] bg-[#FFFFFF] bg-opacity-50' 
                      : 'text-[#4A5568] hover:text-[#333333] hover:bg-[#FFFFFF]'}
                    rounded-t-lg
                  `}
                >
                  <Icon 
                    name={tab.icon.split(' ')[1]} 
                    className={`${isActive ? 'fa-solid' : 'fa-light'} w-5 h-5 mr-2`} 
                  />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00BFFF]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
} 