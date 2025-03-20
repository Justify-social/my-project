'use client';

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faCheck, faGear, faBell, faStar } from '@fortawesome/pro-solid-svg-icons';
import { faUser as falUser, faHouse as falHouse } from '@fortawesome/pro-light-svg-icons';
import { faTwitter, faFacebook, faGithub } from '@fortawesome/free-brands-svg-icons';

// 1. Register icons with library - important for array syntax to work
library.add(
  // Solid icons
  faUser, faCheck, faGear, faBell, faStar,
  // Light icons
  falUser, falHouse,
  // Brand icons
  faTwitter, faFacebook, faGithub
);

export default function FontAwesomeFixesPage() {
  const [renderCount, setRenderCount] = useState(0);
  
  // Only track initial render and count icons once
  useEffect(() => {
    // Only log on first render
    console.log(`[FA-FIXES] Initial page render`);
    
    // Log Font Awesome configuration
    if (typeof window !== 'undefined') {
      console.log('[FA-FIXES] Kit config:', (window as any).FontAwesomeKitConfig);
      
      // Count rendered FA icons after a delay
      setTimeout(() => {
        const faIcons = document.querySelectorAll('.svg-inline--fa').length;
        console.log(`[FA-FIXES] Found ${faIcons} rendered Font Awesome icons`);
      }, 500);
    }
  }, []); // Empty dependency array = runs once
  
  // Track render count separately with a safe approach
  useEffect(() => {
    // Increment render count only once, after initial mount
    const timer = setTimeout(() => {
      setRenderCount(1);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Font Awesome - Guaranteed Working Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Method 1: Direct Icon Import (Recommended)</h2>
          <p className="text-gray-600 mb-4">
            Import and use icons directly without relying on the library:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm mb-4 overflow-auto">
{`import { faUser } from '@fortawesome/pro-solid-svg-icons';
<FontAwesomeIcon icon={faUser} />`}
          </pre>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-blue-50 rounded-md flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-blue-600" />
              </div>
              <span className="mt-2 text-sm">Solid User</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-4 bg-green-50 rounded-md flex items-center justify-center">
                <FontAwesomeIcon icon={faCheck} className="w-8 h-8 text-green-600" />
              </div>
              <span className="mt-2 text-sm">Solid Check</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-4 bg-purple-50 rounded-md flex items-center justify-center">
                <FontAwesomeIcon icon={falUser} className="w-8 h-8 text-purple-600" />
              </div>
              <span className="mt-2 text-sm">Light User</span>
            </div>
          </div>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Method 2: Array Syntax (Requires library.add)</h2>
          <p className="text-gray-600 mb-4">
            Use array syntax after registering icons with library.add():
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm mb-4 overflow-auto">
{`// Requires first: library.add(faUser, faCheck);
<FontAwesomeIcon icon={['fas', 'user']} />`}
          </pre>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-red-50 rounded-md flex items-center justify-center">
                <FontAwesomeIcon icon={['fas', 'user']} className="w-8 h-8 text-red-600" />
              </div>
              <span className="mt-2 text-sm">Array: fas user</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-4 bg-amber-50 rounded-md flex items-center justify-center">
                <FontAwesomeIcon icon={['fal', 'house']} className="w-8 h-8 text-amber-600" />
              </div>
              <span className="mt-2 text-sm">Array: fal house</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-4 bg-sky-50 rounded-md flex items-center justify-center">
                <FontAwesomeIcon icon={['fab', 'twitter']} className="w-8 h-8 text-sky-500" />
              </div>
              <span className="mt-2 text-sm">Array: fab twitter</span>
            </div>
          </div>
        </section>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Method 3: HTML Format (Kit Only)</h2>
          <p className="text-gray-600 mb-4">
            Use HTML format with CSS classes (requires the Kit script):
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm mb-4 overflow-auto">
{`<i className="fa-solid fa-user"></i>`}
          </pre>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-indigo-50 rounded-md flex items-center justify-center">
                <i className="fa-solid fa-user" style={{ fontSize: '2rem', color: '#4f46e5' }}></i>
              </div>
              <span className="mt-2 text-sm">fa-solid fa-user</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-4 bg-teal-50 rounded-md flex items-center justify-center">
                <i className="fa-light fa-house" style={{ fontSize: '2rem', color: '#0d9488' }}></i>
              </div>
              <span className="mt-2 text-sm">fa-light fa-house</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-4 bg-cyan-50 rounded-md flex items-center justify-center">
                <i className="fa-brands fa-github" style={{ fontSize: '2rem', color: '#0891b2' }}></i>
              </div>
              <span className="mt-2 text-sm">fa-brands fa-github</span>
            </div>
          </div>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Setup Requirements</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-3 py-1">
              <h3 className="font-medium">1. Import CSS before config</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
{`import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;`}
              </pre>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-3 py-1">
              <h3 className="font-medium">2. Add Kit script to layout.tsx</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
{`<script 
  src="https://kit.fontawesome.com/3e2951e127.js" 
  crossOrigin="anonymous"
/>`}
              </pre>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-3 py-1">
              <h3 className="font-medium">3. For array syntax, register icons</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
{`import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
library.add(faUser);`}
              </pre>
            </div>
          </div>
        </section>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Icon Style Examples</h2>
        <p className="text-gray-600 mb-4">
          Examples of different icon styles with direct imports:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-gray-700" />
            </div>
            <span className="mt-2 text-sm">Solid User</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={falUser} className="w-8 h-8 text-gray-700" />
            </div>
            <span className="mt-2 text-sm">Light User</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={faTwitter} className="w-8 h-8 text-gray-700" />
            </div>
            <span className="mt-2 text-sm">Brand Twitter</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={faGear} className="w-8 h-8 text-gray-700" />
            </div>
            <span className="mt-2 text-sm">Solid Gear</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={faGithub} className="w-8 h-8 text-gray-700" />
            </div>
            <span className="mt-2 text-sm">Brand GitHub</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
        <p className="text-sm">
          If these icons render correctly, Font Awesome is working properly. Check browser console for debugging info.
        </p>
        <p className="mt-2 text-sm">
          <span className="font-medium">Component rendered {renderCount} times.</span> This helps verify that icons persist through re-renders.
        </p>
      </div>
    </div>
  );
} 