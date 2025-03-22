import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { IconData } from '@/components/ui/icons/validation';

/**
 * API endpoint to provide the icon data for client-side rendering
 * 
 * This endpoint scans the icon directories and returns all valid icons and any errors.
 * It's used by the IconTester component to display all available icons dynamically.
 */
export async function GET() {
  try {
    // Define paths
    const publicPath = path.join(process.cwd(), 'public');
    const lightIconsPath = path.join(publicPath, 'ui-icons/light');
    const solidIconsPath = path.join(publicPath, 'ui-icons/solid');
    
    // Read directory contents if they exist
    let lightIcons: string[] = [];
    let solidIcons: string[] = [];
    const errors: string[] = [];
    
    // Special debug for x-circle.svg
    const lightXCirclePath = path.join(lightIconsPath, 'x-circle.svg');
    const solidXCirclePath = path.join(solidIconsPath, 'x-circle.svg');
    
    console.log('Checking x-circle.svg files:');
    console.log(`Light x-circle.svg exists: ${fs.existsSync(lightXCirclePath)}`);
    console.log(`Solid x-circle.svg exists: ${fs.existsSync(solidXCirclePath)}`);
    
    if (fs.existsSync(lightIconsPath)) {
      const lightFiles = fs.readdirSync(lightIconsPath);
      lightIcons = lightFiles
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''));
      console.log(`Found ${lightIcons.length} light icons`);
      
      // Check if x-circle is in the list
      console.log(`x-circle in light icons: ${lightIcons.includes('x-circle')}`);
    } else {
      const error = `Light icons directory not found: ${lightIconsPath}`;
      console.error(error);
      errors.push(error);
    }
    
    if (fs.existsSync(solidIconsPath)) {
      const solidFiles = fs.readdirSync(solidIconsPath);
      solidIcons = solidFiles
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''));
      console.log(`Found ${solidIcons.length} solid icons`);
      
      // Check if x-circle is in the list
      console.log(`x-circle in solid icons: ${solidIcons.includes('x-circle')}`);
    } else {
      const error = `Solid icons directory not found: ${solidIconsPath}`;
      console.error(error);
      errors.push(error);
    }
    
    // Identify missing counterparts
    const missingInSolid = lightIcons.filter(icon => !solidIcons.includes(icon));
    const missingInLight = solidIcons.filter(icon => !lightIcons.includes(icon));
    
    // Log and add diagnostics for missing icons
    if (missingInSolid.length > 0) {
      const error = `Icons missing solid variants (${missingInSolid.length}): ${missingInSolid.join(', ')}`;
      console.warn(error);
      errors.push(error);
    }
    
    if (missingInLight.length > 0) {
      const error = `Icons missing light variants (${missingInLight.length}): ${missingInLight.join(', ')}`;
      console.warn(error);
      errors.push(error);
    }
    
    // Find common icons (exist in both light and solid variants)
    const validIconNames = lightIcons.filter(icon => solidIcons.includes(icon));
    console.log(`Found ${validIconNames.length} valid icon pairs (have both light and solid variants)`);
    
    // Debug check for x-circle in valid icons
    console.log(`x-circle in valid icons: ${validIconNames.includes('x-circle')}`);
    
    // Create proper icon data objects
    const validIcons: IconData[] = validIconNames.map(icon => {
      // Convert kebab-case to camelCase
      let camelCaseName = icon.replace(/-([a-z])/g, g => g[1].toUpperCase());
      
      // Ensure first character is lowercase
      camelCaseName = camelCaseName.charAt(0).toLowerCase() + camelCaseName.slice(1);
      
      const iconData = {
        name: camelCaseName,
        lightName: `fa${camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1)}Light`,
        solidName: `fa${camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1)}`,
        fileName: icon
      };
      
      // Debug log for xCircle
      if (camelCaseName === 'xCircle') {
        console.log('Found xCircle icon:', iconData);
      }
      
      return iconData;
    });
    
    // Extra diagnostics
    if (validIcons.length === 0 && (lightIcons.length > 0 || solidIcons.length > 0)) {
      const error = "No matching icon pairs found. All icons need both light and solid variants.";
      console.error(error);
      errors.push(error);
    }
    
    return NextResponse.json({ 
      icons: validIcons, 
      errors,
      diagnostics: {
        totalLight: lightIcons.length,
        totalSolid: solidIcons.length,
        validPairs: validIcons.length,
        missingLight: missingInLight.length,
        missingSolid: missingInSolid.length
      }
    });
  } catch (error) {
    console.error('Error in icons API:', error);
    return NextResponse.json({ 
      icons: [], 
      errors: ['Server error processing icons: ' + (error instanceof Error ? error.message : String(error))] 
    }, { status: 500 });
  }
} 