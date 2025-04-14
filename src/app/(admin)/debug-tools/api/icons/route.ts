import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Specify Node.js runtime since we're using fs module
export const runtime = 'nodejs';

// Define paths for icon directories - updated to use new icon directory structure
const lightIconsPath = path.join(process.cwd(), 'public', 'icons', 'light');
const solidIconsPath = path.join(process.cwd(), 'public', 'icons', 'solid');

// Initialize icon arrays
const lightIcons: string[] = [];
const solidIcons: string[] = [];

// After the special debug for x-circle.svg section

// Special mapping for menu icon to bars (FontAwesome uses bars for menu icon)
const menuToBarsFixes = () => {
  // If menu.svg files exist but are not being used properly
  if (
    fs.existsSync(path.join(lightIconsPath, 'menu.svg')) &&
    fs.existsSync(path.join(solidIconsPath, 'menu.svg'))
  ) {
    console.log('Found menu.svg icons - creating bars aliases');

    // Create copy of menu.svg as bars.svg if it doesn't exist
    if (!fs.existsSync(path.join(lightIconsPath, 'bars.svg'))) {
      try {
        fs.copyFileSync(
          path.join(lightIconsPath, 'menu.svg'),
          path.join(lightIconsPath, 'bars.svg')
        );
        lightIcons.push('bars');
        console.log('Created bars.svg in light icons from menu.svg');
      } catch (err) {
        console.error('Error creating bars.svg light icon:', err);
      }
    }

    if (!fs.existsSync(path.join(solidIconsPath, 'bars.svg'))) {
      try {
        fs.copyFileSync(
          path.join(solidIconsPath, 'menu.svg'),
          path.join(solidIconsPath, 'bars.svg')
        );
        solidIcons.push('bars');
        console.log('Created bars.svg in solid icons from menu.svg');
      } catch (err) {
        console.error('Error creating bars.svg solid icon:', err);
      }
    }
  }
};

// Call the fix function
menuToBarsFixes();

// Handle GET requests to this route
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Icon mapping completed',
    icons: {
      light: lightIcons,
      solid: solidIcons,
    },
  });
}
