'use client';

import React from 'react';
import { IconTester } from './icons/test/IconTester';

/**
 * A wrapper component for the locked IconTester component
 * This allows us to extend the IconTester functionality without modifying the original
 */
export const CustomIconDisplay = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Icon Library Preview</h3>
      <p className="text-sm text-gray-500 mb-4">
        This component displays all available FontAwesome icons in the system.
        Hover over an icon to see its solid variant.
      </p>
      <div className="p-4 border rounded-md">
        <IconTester />
      </div>
    </div>
  );
};

export default CustomIconDisplay; 