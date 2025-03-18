'use client';

import React, { useState } from 'react';
import { Icon } from './icon';
import * as Hi from 'react-icons/hi2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSearch, faPlus, faMinus, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';

// Test parameters
const ITERATIONS = 1000;
const ICON_TYPES = ['search', 'plus', 'minus', 'user', 'trash', 'check'];

export const IconPerformanceTest = () => {
  const [results, setResults] = useState<{
    fontAwesome: number;
    heroIcons: number;
    reactIcons: number;
    comparison: string;
  } | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);

  const runPerformanceTest = () => {
    setIsRunning(true);
    
    // Give the UI a chance to update before starting the test
    setTimeout(() => {
      // Test Font Awesome rendering performance
      const fontAwesomeStart = performance.now();
      
      const faElements = [];
      for (let i = 0; i < ITERATIONS; i++) {
        ICON_TYPES.forEach(iconType => {
          let icon;
          switch (iconType) {
            case 'search': icon = faSearch; break;
            case 'plus': icon = faPlus; break;
            case 'minus': icon = faMinus; break;
            case 'user': icon = faUser; break;
            case 'trash': icon = faTrash; break;
            case 'check': icon = faCheck; break;
            default: icon = faUser; break;
          }
          // Store the created element
          faElements.push(React.createElement(FontAwesomeIcon, { icon, className: 'w-5 h-5' }));
        });
      }
      
      const fontAwesomeTime = performance.now() - fontAwesomeStart;
      
      // Test Hero Icons rendering performance
      const heroIconsStart = performance.now();
      
      const hiElements = [];
      for (let i = 0; i < ITERATIONS; i++) {
        ICON_TYPES.forEach(iconType => {
          let IconComponent: any;
          switch (iconType) {
            case 'search': IconComponent = Hi.HiMagnifyingGlass; break;
            case 'plus': IconComponent = Hi.HiPlus; break;
            case 'minus': IconComponent = Hi.HiMinus; break;
            case 'user': IconComponent = Hi.HiUser; break;
            case 'trash': IconComponent = Hi.HiTrash; break;
            case 'check': IconComponent = Hi.HiCheck; break;
            default: IconComponent = Hi.HiUser; break;
          }
          // Store the created element
          hiElements.push(React.createElement(IconComponent, { className: 'w-5 h-5' }));
        });
      }
      
      const heroIconsTime = performance.now() - heroIconsStart;
      
      // Test React Icons rendering performance using our Icon component
      const reactIconsStart = performance.now();
      
      const iconElements = [];
      for (let i = 0; i < ITERATIONS; i++) {
        ICON_TYPES.forEach(iconType => {
          // Store the created element
          iconElements.push(React.createElement(Icon, { name: iconType as any, size: 'md' }));
        });
      }
      
      const reactIconsTime = performance.now() - reactIconsStart;
      
      // Calculate which is faster
      const fontAwesomeVsHeroIcons = ((heroIconsTime - fontAwesomeTime) / heroIconsTime * 100).toFixed(2);
      const fontAwesomeVsReactIcons = ((reactIconsTime - fontAwesomeTime) / reactIconsTime * 100).toFixed(2);
      
      let comparisonText = '';
      
      if (fontAwesomeTime < heroIconsTime) {
        comparisonText = `Font Awesome is ${fontAwesomeVsHeroIcons}% faster than Hero Icons`;
      } else {
        comparisonText = `Hero Icons is ${-parseFloat(fontAwesomeVsHeroIcons).toFixed(2)}% faster than Font Awesome`;
      }
      
      comparisonText += ` | `;
      
      if (fontAwesomeTime < reactIconsTime) {
        comparisonText += `Font Awesome is ${fontAwesomeVsReactIcons}% faster than our Icon component`;
      } else {
        comparisonText += `Our Icon component is ${-parseFloat(fontAwesomeVsReactIcons).toFixed(2)}% faster than Font Awesome`;
      }
      
      setResults({
        fontAwesome: parseFloat(fontAwesomeTime.toFixed(2)),
        heroIcons: parseFloat(heroIconsTime.toFixed(2)),
        reactIcons: parseFloat(reactIconsTime.toFixed(2)),
        comparison: comparisonText
      });
      
      setIsRunning(false);
    }, 100);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Icon Performance Test</h2>
        <p className="text-gray-600 mb-6">
          This test measures the performance of Font Awesome vs Hero Icons by creating {ITERATIONS} instances of each icon type.
        </p>
        
        <button 
          onClick={runPerformanceTest}
          disabled={isRunning}
          className={`px-4 py-2 rounded text-white transition-colors ${isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isRunning ? 'Running Test...' : 'Run Performance Test'}
        </button>
      </div>

      {results && (
        <div className="space-y-4 p-6 bg-gray-50 border rounded-md">
          <h3 className="font-semibold">Test Results</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-md shadow">
              <div className="text-sm text-gray-500">Font Awesome</div>
              <div className="text-2xl font-bold">{results.fontAwesome} ms</div>
            </div>
            
            <div className="p-4 bg-white rounded-md shadow">
              <div className="text-sm text-gray-500">Hero Icons</div>
              <div className="text-2xl font-bold">{results.heroIcons} ms</div>
            </div>
            
            <div className="p-4 bg-white rounded-md shadow">
              <div className="text-sm text-gray-500">Our Icon Component</div>
              <div className="text-2xl font-bold">{results.reactIcons} ms</div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-md text-blue-800">
            {results.comparison}
          </div>
          
          <div className="text-sm text-gray-500">
            <p>This test measures the time to create the icon components in memory, not the actual DOM rendering time.</p>
            <p>Lower times are better.</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-2">Font Awesome</h3>
          <div className="flex space-x-4">
            <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
            <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
            <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
          </div>
        </div>
        
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-2">Hero Icons</h3>
          <div className="flex space-x-4">
            <Hi.HiUser className="w-5 h-5" />
            <Hi.HiMagnifyingGlass className="w-5 h-5" />
            <Hi.HiPlus className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPerformanceTest; 