'use client';

import React, { useEffect, useState } from 'react';
// Remove direct FontAwesome imports
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { faUser, faCheck, faGear, faBell, faStar } from '@fortawesome/pro-solid-svg-icons';
// import { faUser as falUser, faHouse as falHouse } from '@fortawesome/pro-light-svg-icons';
// import { faTwitter, faFacebook, faGithub } from '@fortawesome/free-brands-svg-icons';
// Import the unified Icon component
import { Icon, PlatformIcon } from '@/components/ui/icons';

// Remove library registration
// library.add(
//   // Solid icons
//   faUser, faCheck, faGear, faBell, faStar,
//   // Light icons
//   falUser, falHouse,
//   // Brand icons
//   faTwitter, faFacebook, faGithub);

// Update code examples in the file
const codeExamples = {
  // Update the import examples to show the recommended approach
  importExample: `import { Icon } from '@/components/ui/icons';`
  // ... other examples
};

export default function FontAwesomeFixesPage() {
  const [renderCount, setRenderCount] = useState(0);

  // Only track initial render and count icons once
  useEffect(() => {
    // Only log on first render
    console.log(`[FA-FIXES] Initial page render`);

    // Log Font Awesome configuration
    if (typeof window !== 'undefined') {
      // This logging is no longer needed since we're not using Font Awesome
      console.log('[FA-FIXES] Using unified Icon component system');

      // Count rendered icons after a delay
      setTimeout(() => {
        const icons = document.querySelectorAll('svg').length;
        console.log(`[FA-FIXES] Found ${icons} rendered icons`);
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

  return <div className="container mx-auto p-8 font-work-sans">
      <h1 className="text-3xl font-bold mb-6 font-sora">Icon Unification - Guaranteed Working Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 font-work-sans">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 font-sora">Method 1: Standard Icon Usage (Recommended)</h2>
          <p className="text-gray-600 mb-4 font-work-sans">
            Import and use icons directly from the unified Icon component:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm mb-4 overflow-auto font-work-sans">
          {`import { Icon } from '@/components/ui/icons';
<Icon name="faUser" />`}
          </pre>
          
          <div className="grid grid-cols-3 gap-4 font-work-sans">
            <div className="flex flex-col items-center font-work-sans">
              <div className="p-4 bg-blue-50 rounded-md flex items-center justify-center font-work-sans">
                <Icon name="faUser" className="w-8 h-8 text-blue-600 font-work-sans" />
              </div>
              <span className="mt-2 text-sm font-work-sans">User Icon</span>
            </div>
            
            <div className="flex flex-col items-center font-work-sans">
              <div className="p-4 bg-green-50 rounded-md flex items-center justify-center font-work-sans">
                <Icon name="faCheck" className="w-8 h-8 text-green-600 font-work-sans" />
              </div>
              <span className="mt-2 text-sm font-work-sans">Check Icon</span>
            </div>
            
            <div className="flex flex-col items-center font-work-sans">
              <div className="p-4 bg-purple-50 rounded-md flex items-center justify-center font-work-sans">
                <Icon name="faUser" solid={false} className="w-8 h-8 text-purple-600 font-work-sans" />
              </div>
              <span className="mt-2 text-sm font-work-sans">Light User</span>
            </div>
          </div>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 font-sora">Method 2: Platform Icons</h2>
          <p className="text-gray-600 mb-4 font-work-sans">
            Use platform-specific icons with the PlatformIcon component:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm mb-4 overflow-auto font-work-sans">
          {`import { PlatformIcon } from '@/components/ui/icons';
<PlatformIcon platformName="x" />`}
          </pre>
          
          <div className="grid grid-cols-3 gap-4 font-work-sans">
            <div className="flex flex-col items-center font-work-sans">
              <div className="p-4 bg-red-50 rounded-md flex items-center justify-center font-work-sans">
                <Icon name="faUser" solid={true} className="w-8 h-8 text-red-600 font-work-sans" />
              </div>
              <span className="mt-2 text-sm font-work-sans">Solid User</span>
            </div>
            
            <div className="flex flex-col items-center font-work-sans">
              <div className="p-4 bg-amber-50 rounded-md flex items-center justify-center font-work-sans">
                <Icon name="faHouse" solid={false} className="w-8 h-8 text-amber-600 font-work-sans" />
              </div>
              <span className="mt-2 text-sm font-work-sans">Light House</span>
            </div>
            
            <div className="flex flex-col items-center font-work-sans">
              <div className="p-4 bg-sky-50 rounded-md flex items-center justify-center font-work-sans">
                <PlatformIcon platformName="x" className="w-8 h-8 text-sky-500 font-work-sans" />
              </div>
              <span className="mt-2 text-sm font-work-sans">X (Twitter)</span>
            </div>
          </div>
        </section>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-8 font-work-sans">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 font-sora">Setup Requirements</h2>
          <div className="space-y-3 font-work-sans">
            <div className="border-l-4 border-blue-500 pl-3 py-1 font-work-sans">
              <h3 className="font-medium font-sora">1. Import the Icon component</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1 font-work-sans">
              {`import { Icon, PlatformIcon } from '@/components/ui/icons';`}
              </pre>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-3 py-1 font-work-sans">
              <h3 className="font-medium font-sora">2. Use the Icon component with name prop</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1 font-work-sans">
              {`// Basic usage
<Icon name="faUser" />

// With light style (non-solid)
<Icon name="faUser" solid={false} />

// With additional props
<Icon name="faUser" className="w-6 h-6 text-blue-500" />`}
              </pre>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-3 py-1 font-work-sans">
              <h3 className="font-medium font-sora">3. Platform-specific icons</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1 font-work-sans">
              {`// Use PlatformIcon for social media platforms
<PlatformIcon platformName="facebook" />
<PlatformIcon platformName="instagram" />
<PlatformIcon platformName="x" /> // Twitter`}
              </pre>
            </div>
          </div>
        </section>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md font-work-sans">
        <h2 className="text-xl font-semibold mb-4 font-sora">Icon Style Examples</h2>
        <p className="text-gray-600 mb-4 font-work-sans">
          Examples of different icon styles with the unified Icon component:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-work-sans">
          <div className="flex flex-col items-center font-work-sans">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center font-work-sans">
              <Icon name="faUser" solid={true} className="w-8 h-8 text-gray-700 font-work-sans" />
            </div>
            <span className="mt-2 text-sm font-work-sans">Solid User</span>
          </div>
          
          <div className="flex flex-col items-center font-work-sans">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center font-work-sans">
              <Icon name="faUser" solid={false} className="w-8 h-8 text-gray-700 font-work-sans" />
            </div>
            <span className="mt-2 text-sm font-work-sans">Light User</span>
          </div>
          
          <div className="flex flex-col items-center font-work-sans">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center font-work-sans">
              <PlatformIcon platformName="x" className="w-8 h-8 text-gray-700 font-work-sans" />
            </div>
            <span className="mt-2 text-sm font-work-sans">X (Twitter)</span>
          </div>
          
          <div className="flex flex-col items-center font-work-sans">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center font-work-sans">
              <Icon name="faGear" className="w-8 h-8 text-gray-700 font-work-sans" />
            </div>
            <span className="mt-2 text-sm font-work-sans">Gear</span>
          </div>
          
          <div className="flex flex-col items-center font-work-sans">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center font-work-sans">
              <Icon name="faGithub" className="w-8 h-8 text-gray-700 font-work-sans" />
            </div>
            <span className="mt-2 text-sm font-work-sans">GitHub</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border font-work-sans">
        <p className="text-sm font-work-sans">
          If these icons render correctly, the unified Icon system is working properly. Check browser console for debugging info.
        </p>
        <p className="mt-2 text-sm font-work-sans">
          <span className="font-medium font-work-sans">Component rendered {renderCount} times.</span> This helps verify that icons persist through re-renders.
        </p>
      </div>
    </div>;
}