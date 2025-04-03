'use client';

import React, { useState } from 'react';
import { Icon, getLightVariant, getSolidVariant, ensureIconVariant } from '../../../../../../components/ui/atoms/icon';

/**
 * Demonstrates the new icon system with explicit variants
 */
export const IconDemo: React.FC = () => {
  const [active, setActive] = useState(false);
  
  // Sample icon names to demonstrate with
  const iconExamples = [
    'faCheck',
    'faUser',
    'faHeart',
    'faArrowRight',
    'faCircleInfo',
  ];
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Icon System Demo</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Explicit Variant Pattern</h3>
        <p className="mb-4 text-gray-700">
          Use explicit Solid/Light suffixes instead of the solid prop:
        </p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          {iconExamples.map(icon => (
            <div key={icon} className="flex flex-col items-center border p-4 rounded-lg">
              <div className="flex gap-4 mb-2">
                <div className="flex flex-col items-center">
                  <Icon iconId={`${icon}Light`} size="xl" />
                  <span className="text-sm mt-2">{`${icon}Light`}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon iconId={`${icon}Solid`} size="xl" />
                  <span className="text-sm mt-2">{`${icon}Solid`}</span>
                </div>
              </div>
              <code className="bg-gray-100 p-2 rounded text-xs w-full mt-2 text-center">
                {`<Icon iconId="${icon}Light" />`}
                <br />
                {`<Icon iconId="${icon}Solid" />`}
              </code>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">With Utility Functions</h3>
        <p className="mb-4 text-gray-700">
          Use utility functions for type-safe icon variants:
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {iconExamples.slice(0, 2).map(icon => (
            <div key={icon} className="flex flex-col items-center border p-4 rounded-lg">
              <div className="flex gap-4 mb-2">
                <div className="flex flex-col items-center">
                  <Icon iconId={getLightVariant(icon)} size="xl" />
                  <span className="text-sm mt-2">Light Variant</span>
                </div>
                <div className="flex flex-col items-center">
                  <Icon iconId={getSolidVariant(icon)} size="xl" />
                  <span className="text-sm mt-2">Solid Variant</span>
                </div>
              </div>
              <code className="bg-gray-100 p-2 rounded text-xs w-full mt-2 text-center">
                {`<Icon iconId={getLightVariant('${icon}')} />`}
                <br />
                {`<Icon iconId={getSolidVariant('${icon}')} />`}
              </code>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Active State Demo</h3>
        <p className="mb-4 text-gray-700">
          The active prop still works, switching to solid variant:
        </p>
        
        <div className="flex flex-col items-center border p-4 rounded-lg mb-6">
          <div className="flex gap-8 mb-4">
            <div className="flex flex-col items-center">
              <Icon iconId="faHeartLight" active={false} size="2xl" />
              <span className="text-sm mt-2">active=false</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon iconId="faHeartSolid" active={true} size="2xl" />
              <span className="text-sm mt-2">active=true</span>
            </div>
          </div>
          
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setActive(!active)}
          >
            Toggle Active State
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <span>Current state:</span>
            <Icon iconId={active ? "faHeartSolid" : "faHeartLight"} size="xl" />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 mb-6">
        <h4 className="text-lg font-semibold text-yellow-800">Migration Note</h4>
        <p className="text-yellow-700">
          The <code className="bg-yellow-100 px-1 rounded">name</code> prop and <code className="bg-yellow-100 px-1 rounded">solid</code> prop are deprecated. 
          Use the new <code className="bg-yellow-100 px-1 rounded">iconId</code> property with explicit suffixes (e.g., <code className="bg-yellow-100 px-1 rounded">iconId="faCheckSolid"</code>) 
          or utility functions (e.g., <code className="bg-yellow-100 px-1 rounded">iconId={getSolidVariant('faCheck')}</code>).
        </p>
        <p className="text-yellow-700 mt-2">
          The <code className="bg-yellow-100 px-1 rounded">iconId</code> approach provides better type safety and makes the variant explicit in the component usage.
        </p>
      </div>
    </div>
  );
};

export default IconDemo; 