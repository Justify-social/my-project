'use client';

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faHouse, faGear } from '@fortawesome/pro-solid-svg-icons';
import { faUser as falUser } from '@fortawesome/pro-light-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

// Add icons to library
library.add(faUser, faHouse, faGear, falUser, faTwitter);

export default function FontAwesomeDirectTest() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      console.log('[DIRECT-TEST] Running in browser');
      
      try {
        // Log FontAwesome global objects
        console.log('[DIRECT-TEST] window.FontAwesome:', (window as any).FontAwesome);
        console.log('[DIRECT-TEST] window.FontAwesomeKitConfig:', (window as any).FontAwesomeKitConfig);
        
        // Check if FontAwesome script is in DOM
        const faScript = document.querySelector('script[src*="fontawesome"]');
        console.log('[DIRECT-TEST] FontAwesome script in DOM:', !!faScript);
        
        setLoaded(true);
      } catch (err) {
        console.error('[DIRECT-TEST] Error:', err);
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }, []);
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Font Awesome Direct Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <p>Environment loaded: <span className="font-medium">{loaded ? 'Yes' : 'No'}</span></p>
        {error && <p className="text-red-600">Error: {error}</p>}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Direct Icon Import Rendering</h2>
        <p className="mb-4 text-sm text-gray-600">
          These icons are imported directly from Font Awesome packages and added to the library
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="w-10 h-10 text-blue-600" />
            </div>
            <span className="mt-2 text-sm">Solid User</span>
            <span className="mt-1 text-xs text-gray-500">faUser</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={faHouse} className="w-10 h-10 text-green-600" />
            </div>
            <span className="mt-2 text-sm">Solid House</span>
            <span className="mt-1 text-xs text-gray-500">faHouse</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={falUser} className="w-10 h-10 text-purple-600" />
            </div>
            <span className="mt-2 text-sm">Light User</span>
            <span className="mt-1 text-xs text-gray-500">falUser</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={faTwitter} className="w-10 h-10 text-blue-400" />
            </div>
            <span className="mt-2 text-sm">Brand Twitter</span>
            <span className="mt-1 text-xs text-gray-500">faTwitter</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Array Format Rendering</h2>
        <p className="mb-4 text-sm text-gray-600">
          These icons use the array format which relies on the library.add() call above
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={['fas', 'user']} className="w-10 h-10 text-red-600" />
            </div>
            <span className="mt-2 text-sm">Array format (fas, user)</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={['fas', 'house']} className="w-10 h-10 text-amber-600" />
            </div>
            <span className="mt-2 text-sm">Array format (fas, house)</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={['fab', 'twitter']} className="w-10 h-10 text-sky-500" />
            </div>
            <span className="mt-2 text-sm">Array format (fab, twitter)</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Kit Format (Style Prefix)</h2>
        <p className="mb-4 text-sm text-gray-600">
          These icons test the kit-specific format that should work when the kit script is loaded
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <i className="fa-solid fa-user w-10 h-10 text-indigo-600" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <span className="mt-2 text-sm">HTML format (fa-solid fa-user)</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <i className="fa-light fa-user w-10 h-10 text-teal-600" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <span className="mt-2 text-sm">HTML format (fa-light fa-user)</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
              <i className="fa-brands fa-twitter w-10 h-10 text-cyan-500" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <span className="mt-2 text-sm">HTML format (fa-brands fa-twitter)</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-sm text-gray-600">
          Check browser console for detailed debug information.
        </p>
      </div>
    </div>
  );
} 