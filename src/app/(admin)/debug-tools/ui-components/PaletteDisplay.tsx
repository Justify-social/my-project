'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

// Define the structure for color info
interface ColorInfo {
  name: string;
  variable: string;
  hex: string;
  description: string;
}

// Define the color palette data (consider fetching or defining elsewhere)
const palette: ColorInfo[] = [
  {
    name: 'Primary',
    variable: '--color-primary',
    hex: '#333333',
    description: 'Main text, headers, primary actions.',
  },
  {
    name: 'Secondary',
    variable: '--color-secondary',
    hex: '#4A5568',
    description: 'Secondary text, subheadings, borders.',
  },
  {
    name: 'Accent',
    variable: '--color-accent',
    hex: '#00BFFF',
    description: 'Highlighting active elements, links, primary buttons.',
  },
  {
    name: 'Background',
    variable: '--color-background',
    hex: '#FFFFFF',
    description: 'Main background color.',
  },
  {
    name: 'Divider',
    variable: '--color-divider',
    hex: '#D1D5DB',
    description: 'Borders between sections or items.',
  },
  {
    name: 'Interactive',
    variable: '--color-interactive',
    hex: '#3182CE',
    description: 'Hover states, focus rings, interactive elements.',
  },
  // Add other colors from globals.css as needed
];

export default function PaletteDisplay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colour Palette</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {palette.map(color => (
            <div key={color.variable} className="border rounded-lg p-4 shadow-sm">
              <div
                className="w-full h-20 rounded mb-3 border"
                style={{ backgroundColor: color.hex }}
              ></div>
              <h3 className="font-semibold text-lg mb-1">{color.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">
                <code>{color.variable}</code>
              </p>
              <p className="text-sm text-muted-foreground mb-2">{color.hex}</p>
              <p className="text-xs text-secondary">{color.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
