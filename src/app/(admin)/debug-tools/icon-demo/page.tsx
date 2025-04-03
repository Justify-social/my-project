'use client';

import React from 'react';
import IconDemo from '../ui-components/features/icon-demo/IconDemo';

export default function IconDemoPage() {
  return (
    <div className="flex-1 p-6 w-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Icon System Demo</h1>
        <p className="text-gray-500">
          Demonstrates the new explicit variant pattern for icons
        </p>
      </header>

      <IconDemo />
      
      <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Developer Note</h3>
        <p className="text-blue-700">
          The solid attribute has been deprecated in favor of explicit variant suffixes.
          This demo shows the recommended patterns for using icons in the application.
        </p>
        <p className="mt-2 text-blue-700">
          Run <code className="bg-blue-100 px-2 py-1 rounded">node scripts/icons/convert-solid-attributes.js</code> to 
          automatically convert existing components.
        </p>
      </div>
    </div>
  );
} 