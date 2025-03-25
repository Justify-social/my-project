'use client';

import React from 'react';
import { IconTester } from './test/IconTester';

/**
 * A wrapper component for the locked IconTester component
 * This allows us to extend the IconTester functionality without modifying the original
 */
export const CustomIconDisplay = () => {
  return (
    <div className="space-y-4 font-work-sans">
      <h3 className="text-lg font-medium mb-4 font-sora">Icon Library Preview</h3>
      <p className="text-sm text-gray-500 mb-4 font-work-sans">
        This component displays all available FontAwesome icons in the system.
        Hover over an icon to see its solid variant.
      </p>
      <div className="p-4 border rounded-md font-work-sans">
        <IconTester />
      </div>
    </div>);

};

export default CustomIconDisplay;