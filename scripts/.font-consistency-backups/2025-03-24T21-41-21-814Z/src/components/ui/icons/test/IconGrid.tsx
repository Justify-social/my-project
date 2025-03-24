'use client';

import React from 'react';
import { Icon, KPI_ICON_URLS, KpiIconName, APP_ICON_URLS, AppIconName, UI_ICON_MAP } from '../index';

// Define all the semantic icon names to display in alphabetical order
const SEMANTIC_ICON_NAMES = ["arrowDown", "arrowLeft", "arrowRight", "arrowUp", "bell", "bellAlert", "bookmark", "building", "calendar", "calendarDays", "chart", "chartBar", "chartPie", "chatBubble", "check", "checkCircle", "chevronDown", "chevronLeft", "chevronRight", "chevronUp", "circleCheck", "clock", "close", "copy", "creditCard", "delete", "document", "documentText", "download", "edit", "fileLines", "filter", "globe", "grid", "heart", "history", "home", "info", "key", "lightBulb", "lightning", "list", "lock", "magnifyingGlassPlus", "mail", "map", "menu", "minus", "money", "paperclip", "play", "plus", "presentationChartBar", "rocket", "search", "settings", "share", "shield", "signal", "star", "swatch", "tableCells", "tag", "trendDown", "trendUp", "unlock", "upload", "user", "userCircle", "userGroup", "view", "warning", "xCircle", "xMark", "photo"];

// Get all KPI icon names
const KPI_ICON_NAMES = Object.keys(KPI_ICON_URLS) as KpiIconName[];

// Get all APP icon names
const APP_ICON_NAMES = Object.keys(APP_ICON_URLS) as AppIconName[];

export function IconGrid() {
  return <div className="p-4">
      {/* UI Icons Section */}
      <h2 className="text-xl font-bold mb-6">UI Icons</h2>
      <p className="mb-4 text-gray-600">Hover over any icon to see it change from light to solid style with accent color. The group class on the container enables this effect.</p>
      
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4 mb-8">
        {SEMANTIC_ICON_NAMES.map(name => {
        // Get the FontAwesome icon name
        const faIconName = UI_ICON_MAP[name] || UI_ICON_MAP.default;
        // Only add Light suffix if not already a light icon
        const lightIconName = faIconName.endsWith('Light') ? faIconName : `${faIconName}Light`;
        return <div key={name} className="group flex flex-col items-center p-3 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
              <Icon name={lightIconName} size="md" iconType="button"
          // No custom Tailwind hover class - let the component handle it
          solid={false} className="text-[var(--secondary-color)]" />
              <span className="text-xs mt-2 text-center text-gray-600">{name}</span>
            </div>;
      })}
      </div>
      
      {/* KPI Icons Section */}
      <h2 className="text-xl font-bold mb-6 mt-12">KPI Icons</h2>
      <p className="mb-4 text-gray-600">KPI-specific icons used throughout the application.</p>
      
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4 mb-8">
        {KPI_ICON_NAMES.map(name => <div key={name} className="group flex flex-col items-center p-3 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer" onMouseOver={e => {
        // Find the img element within this div and apply the filter
        const img = e.currentTarget.querySelector('img');
        if (img) {
          img.style.filter = 'invert(65%) sepia(67%) saturate(2625%) hue-rotate(177deg) brightness(104%) contrast(103%)';
        }
      }} onMouseOut={e => {
        // Find the img element within this div and reset the filter
        const img = e.currentTarget.querySelector('img');
        if (img) {
          img.style.filter = 'invert(20%)';
        }
      }}>
            <img src={KPI_ICON_URLS[name]} alt={name} className="w-8 h-8 mb-2 transition-colors duration-200" style={{
          filter: 'invert(20%)'
        }} // Default dark color (Jet)
        />
            <span className="text-xs mt-1 text-center text-gray-600">{formatIconName(name)}</span>
          </div>)}
      </div>
      
      {/* APP Icons Section */}
      <h2 className="text-xl font-bold mb-6 mt-12">App Icons</h2>
      <p className="mb-4 text-gray-600">Application-specific icons used for navigation and features.</p>
      
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4 mb-8">
        {APP_ICON_NAMES.map(name => <div key={name} className="group flex flex-col items-center p-3 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer" onMouseOver={e => {
        // Find the img element within this div and apply the filter
        const img = e.currentTarget.querySelector('img');
        if (img) {
          img.style.filter = 'invert(65%) sepia(67%) saturate(2625%) hue-rotate(177deg) brightness(104%) contrast(103%)';
        }
      }} onMouseOut={e => {
        // Find the img element within this div and reset the filter
        const img = e.currentTarget.querySelector('img');
        if (img) {
          img.style.filter = 'invert(20%)';
        }
      }}>
            <img src={APP_ICON_URLS[name]} alt={name} className="w-8 h-8 mb-2 transition-colors duration-200" style={{
          filter: 'invert(20%)'
        }} // Default dark color
        />
            <span className="text-xs mt-1 text-center text-gray-600">{formatIconName(name)}</span>
          </div>)}
      </div>
      
      <h2 className="text-xl font-bold mb-6 mt-8">Icon Action Colors</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-3">Default Action (Blue)</h3>
          <div className="flex justify-center space-x-4">
            {["user", "bell", "heart", "star"].map(name => <div key={name} className="group flex flex-col items-center">
                <Icon name={`fa${name.charAt(0).toUpperCase() + name.slice(1)}Light`} size="lg" iconType="button" action="default" solid={false} />
                <span className="text-xs mt-2 text-gray-600">{name}</span>
              </div>)}
          </div>
        </div>
        
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-3">Delete Action (Red)</h3>
          <div className="flex justify-center space-x-4">
            {["trash-can", "xmark", "minus", "circle-xmark"].map(name => {
            const iconName = `fa${name.split('-').map((part, i) => i === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1)).join('')}Light`;
            return <div key={name} className="group flex flex-col items-center">
                  <Icon name={iconName} size="lg" iconType="button" action="delete" solid={false} />
                  <span className="text-xs mt-2 text-gray-600">{name.split('-')[0]}</span>
                </div>;
          })}
          </div>
        </div>
        
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-3">Warning Action (Yellow)</h3>
          <div className="flex justify-center space-x-4">
            {["triangle-exclamation", "circle-info", "shield", "bell-slash"].map(name => {
            const iconName = `fa${name.split('-').map((part, i) => i === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1)).join('')}Light`;
            return <div key={name} className="group flex flex-col items-center">
                  <Icon name={iconName} size="lg" iconType="button" action="warning" solid={false} />
                  <span className="text-xs mt-2 text-gray-600">{name.split('-')[0]}</span>
                </div>;
          })}
          </div>
        </div>
        
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-3">Success Action (Green)</h3>
          <div className="flex justify-center space-x-4">
            {["check", "circle-check", "upload", "plus"].map(name => {
            const iconName = `fa${name.split('-').map((part, i) => i === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1)).join('')}Light`;
            return <div key={name} className="group flex flex-col items-center">
                  <Icon name={iconName} size="lg" iconType="button" action="success" solid={false} />
                  <span className="text-xs mt-2 text-gray-600">{name.split('-')[0]}</span>
                </div>;
          })}
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-6 mt-8">Static Icons (No Hover Effects)</h2>
      <div className="flex flex-wrap gap-8 mb-8">
        <div className="p-4 border rounded-md flex-grow">
          <h3 className="font-medium mb-3">Light Static Icons</h3>
          <div className="flex justify-center space-x-4">
            {["user", "bell", "heart", "gear", "check"].map(name => <div key={name} className="flex flex-col items-center">
                <Icon name={`fa${name.charAt(0).toUpperCase() + name.slice(1)}Light`} size="lg" iconType="static" solid={false} className="text-[var(--secondary-color)]" />
                <span className="text-xs mt-2 text-gray-600">{name}</span>
              </div>)}
          </div>
        </div>
        
        <div className="p-4 border rounded-md flex-grow">
          <h3 className="font-medium mb-3">Solid Static Icons</h3>
          <div className="flex justify-center space-x-4">
            {["user", "bell", "heart", "gear", "check"].map(name => <div key={name} className="flex flex-col items-center">
                <Icon name={`fa${name.charAt(0).toUpperCase() + name.slice(1)}`} size="lg" iconType="static" solid className="text-[var(--secondary-color)]" />
                <span className="text-xs mt-2 text-gray-600">{name}</span>
              </div>)}
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-3">Usage Tips</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Button Icons:</strong> Use <code className="bg-gray-100 px-1">iconType="button"</code> for interactive icons with hover effects
          </li>
          <li>
            <strong>Static Icons:</strong> Use <code className="bg-gray-100 px-1">iconType="static"</code> for decorative icons without hover effects
          </li>
          <li>
            <strong>Hover Effect:</strong> Wrap icons in a container with the <code className="bg-gray-100 px-1">group</code> class to enable hover effects
          </li>
          <li>
            <strong>Action Colors:</strong> Use the <code className="bg-gray-100 px-1">action</code> prop to set specific hover colors
          </li>
        </ul>
      </div>
    </div>;
}

// Helper to format camelCase/kebab-case icon names to Title Case with spaces
function formatIconName(name: string): string {
  return name
  // Convert camelCase to space separated
  .replace(/([A-Z])/g, ' $1')
  // Convert kebab-case to space separated
  .replace(/-/g, ' ')
  // Convert first character to uppercase
  .replace(/^./, str => str.toUpperCase())
  // Special cases
  .replace('K P I', 'KPI').replace('M M M', 'MMM');
}