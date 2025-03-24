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
    const brandsIconsPath = path.join(publicPath, 'ui-icons/brands');
    
    // Read directory contents if they exist
    let lightIcons: string[] = [];
    let solidIcons: string[] = [];
    let brandsIcons: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Essential icons that should always be present in both light and solid variants
    const requiredIcons = [
      'bell', 'calendar', 'check', 'xmark', 'trash-can', 'info', 'envelope', 
      'menu', 'minus', 'plus', 'magnifying-glass', 'gear', 'user', 
      'triangle-exclamation', 'play', 'pause', 'house', 'pen-to-square', 
      'file-audio', 'file-image', 'file-video', 'rotate-right'
    ];
    
    // Function to validate SVG content
    const validateSvgContent = (filePath: string): boolean => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Basic SVG validation - check for essential elements
        return content.includes('<svg') && 
               content.includes('viewBox') && 
               (content.includes('<path') || content.includes('<g') || content.includes('<rect'));
      } catch (error) {
        return false;
      }
    };
    
    // Function to compare two SVG files to ensure they are different
    const compareIconFiles = (path1: string, path2: string): boolean => {
      try {
        if (!fs.existsSync(path1) || !fs.existsSync(path2)) {
          return false;
        }
        
        const content1 = fs.readFileSync(path1, 'utf8');
        const content2 = fs.readFileSync(path2, 'utf8');
        
        // Extract the path data for comparison, ignoring styling
        const pathMatch1 = content1.match(/<path[^>]*d="([^"]+)"/);
        const pathMatch2 = content2.match(/<path[^>]*d="([^"]+)"/);
        
        if (!pathMatch1 || !pathMatch2) {
          return false; // Can't compare if path data is missing
        }
        
        // Compare the actual path data, which should be different between light and solid
        return pathMatch1[1] !== pathMatch2[1];
      } catch (error) {
        return false;
      }
    };
    
    // Load and validate icons from directories
    if (fs.existsSync(lightIconsPath)) {
      const lightFiles = fs.readdirSync(lightIconsPath);
      lightIcons = lightFiles
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''));
      console.log(`Found ${lightIcons.length} light icons`);
      
      // Validate SVG content for each light icon
      const invalidLightIcons = lightIcons.filter(icon => 
        !validateSvgContent(path.join(lightIconsPath, `${icon}.svg`))
      );
      
      if (invalidLightIcons.length > 0) {
        warnings.push(`Invalid or corrupt light SVG files (${invalidLightIcons.length}): ${invalidLightIcons.join(', ')}`);
      }
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
      
      // Validate SVG content for each solid icon
      const invalidSolidIcons = solidIcons.filter(icon => 
        !validateSvgContent(path.join(solidIconsPath, `${icon}.svg`))
      );
      
      if (invalidSolidIcons.length > 0) {
        warnings.push(`Invalid or corrupt solid SVG files (${invalidSolidIcons.length}): ${invalidSolidIcons.join(', ')}`);
      }
    } else {
      const error = `Solid icons directory not found: ${solidIconsPath}`;
      console.error(error);
      errors.push(error);
    }

    // Check brands icons if they exist
    if (fs.existsSync(brandsIconsPath)) {
      const brandsFiles = fs.readdirSync(brandsIconsPath);
      brandsIcons = brandsFiles
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''));
      console.log(`Found ${brandsIcons.length} brands icons`);
    }
    
    // Check for missing required icons
    const missingRequiredInLight = requiredIcons.filter(icon => !lightIcons.includes(icon));
    const missingRequiredInSolid = requiredIcons.filter(icon => !solidIcons.includes(icon));
    
    if (missingRequiredInLight.length > 0) {
      errors.push(`Essential icons missing light variants (${missingRequiredInLight.length}): ${missingRequiredInLight.join(', ')}`);
    }
    
    if (missingRequiredInSolid.length > 0) {
      errors.push(`Essential icons missing solid variants (${missingRequiredInSolid.length}): ${missingRequiredInSolid.join(', ')}`);
    }
    
    // Identify missing counterparts for all icons
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
    
    // Check if light and solid icons have identical content (which is wrong)
    const identicalIcons = validIconNames.filter(icon => {
      const lightPath = path.join(lightIconsPath, `${icon}.svg`);
      const solidPath = path.join(solidIconsPath, `${icon}.svg`);
      return !compareIconFiles(lightPath, solidPath);
    });
    
    if (identicalIcons.length > 0) {
      warnings.push(`Icons with identical light/solid variants (${identicalIcons.length}): ${identicalIcons.join(', ')}`);
    }
    
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
        fileName: icon,
        valid: validateSvgContent(path.join(lightIconsPath, `${icon}.svg`)) && 
               validateSvgContent(path.join(solidIconsPath, `${icon}.svg`)) &&
               compareIconFiles(
                 path.join(lightIconsPath, `${icon}.svg`), 
                 path.join(solidIconsPath, `${icon}.svg`)
               )
      };
      
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
      warnings,
      diagnostics: {
        totalLight: lightIcons.length,
        totalSolid: solidIcons.length,
        totalBrands: brandsIcons.length,
        validPairs: validIcons.length,
        invalidPairs: identicalIcons?.length || 0,
        missingLight: missingInLight.length,
        missingSolid: missingInSolid.length,
        missingRequiredLight: missingRequiredInLight.length,
        missingRequiredSolid: missingRequiredInSolid.length
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