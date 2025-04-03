'use client';

import React from 'react';

/**
 * Color Palette component to display the project's color scheme
 */
export function Palette() {
  const colors = [
    { name: 'Primary (Jet)', hex: '#333333', className: 'bg-primary' },
    { name: 'Secondary (Payne\'s Grey)', hex: '#4A5568', className: 'bg-secondary' },
    { name: 'Accent (Deep Sky Blue)', hex: '#00BFFF', className: 'bg-accent' },
    { name: 'Background', hex: '#FFFFFF', className: 'bg-background' },
    { name: 'Divider (French Grey)', hex: '#D1D5DB', className: 'bg-divider' },
    { name: 'Interactive (Medium Blue)', hex: '#3182CE', className: 'bg-interactive' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Brand Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map((color) => (
            <div 
              key={color.name} 
              className="border rounded-md overflow-hidden shadow-sm"
            >
              <div 
                className={`h-24 ${color.className}`} 
                style={{ backgroundColor: color.className.startsWith('bg-') ? undefined : color.hex }}
              />
              <div className="p-3 bg-white">
                <h4 className="font-medium">{color.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-500">{color.hex}</span>
                  <button 
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    onClick={() => {
                      navigator.clipboard.writeText(color.hex);
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Typography</h3>
        <div className="space-y-3 border rounded-md p-4">
          <div>
            <span className="text-xs text-gray-500">Heading Font</span>
            <h4 className="text-2xl">Inter Sans-Serif</h4>
          </div>
          <div>
            <span className="text-xs text-gray-500">Body Font</span>
            <p className="text-base">Inter Sans-Serif</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Code Font</span>
            <code className="px-2 py-1 rounded bg-gray-100">JetBrains Mono</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Palette; 