'use client';

/**
 * Color Palette and Logos Examples Component
 * 
 * This component displays examples of color palettes and logos.
 * It has been extracted to its own file to resolve circular dependencies.
 */

import React from 'react';
import { colors } from '../colors';
import { Icon } from '../icons';
import { Card, CardHeader, CardContent } from '../card';
import { Heading, Text } from '../typography';

export function ColorPaletteLogosExamples() {
  return <div className="space-y-8 font-work-sans">
      {/* Color Palette */}
      <div className="font-work-sans">
        <h3 className="text-md font-medium mb-4 font-sora">Brand Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-work-sans">
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#333333] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Primary Color - Jet</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#333333</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--primary-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#4A5568] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Secondary Color - Payne's Grey</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#4A5568</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--secondary-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#00BFFF] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Accent Color - Deep Sky Blue</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#00BFFF</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--accent-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#FFFFFF] border rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Background Color - White</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#FFFFFF</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--background-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#D1D5DB] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Divider Color - French Grey</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#D1D5DB</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--divider-color</p>
            </div>
          </div>
          <div className="p-4 border rounded-md font-work-sans">
            <div className="h-16 bg-[#3182CE] rounded-md mb-2 font-work-sans"></div>
            <div className="space-y-1 font-work-sans">
              <p className="font-medium font-work-sans">Interactive Color - Medium Blue</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">#3182CE</p>
              <p className="text-sm text-gray-500 font-mono font-work-sans">--interactive-color</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logos */}
      <div className="font-work-sans">
        <h3 className="text-md font-medium mb-4 font-sora">Logos</h3>
        <p className="text-sm text-gray-500 mb-6 font-work-sans">
          Sample logo displays would go here in a production environment
        </p>
      </div>
    </div>;
}

// Default export for backwards compatibility
export default ColorPaletteLogosExamples;
