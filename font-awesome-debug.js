#!/usr/bin/env node

/**
 * FontAwesome Icon Debug and Fix Tool
 * 
 * This script diagnoses issues with FontAwesome icons in the UI components debug page
 * and helps ensure all required icons are properly imported and registered.
 */

import fs from 'fs';
import path from 'path';

const WORKSPACE_ROOT = process.cwd();
const ICON_COMPONENT_PATH = path.join(WORKSPACE_ROOT, 'src/components/ui/icon.tsx');
const ICON_MAPPINGS_PATH = path.join(WORKSPACE_ROOT, 'src/lib/icon-mappings.ts');
const LAYOUT_PATH = path.join(WORKSPACE_ROOT, 'src/app/layout.tsx');

// List of all UI icons from the debug page
const UI_ICONS = [
  'search', 'plus', 'minus', 'close', 'check',
  'chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight',
  'user', 'settings', 'mail', 'calendar', 'trash',
  'warning', 'info', 'bell', 'circleCheck', 'lightBulb',
  'chatBubble', 'view', 'edit', 'copy', 'delete',
  'heart', 'star', 'bookmark', 'share', 'upload',
  'menu', 'filter', 'grid', 'list', 'tag',
  'lock', 'unlock', 'key', 'paperclip', 'download',
  'play', 'document', 'documentText', 'xMark', 'fileLines',
  'home', 'chart', 'chartPie', 'money', 'trendUp',
  'trendDown', 'lightning', 'globe', 'userGroup', 'building',
  'rocket', 'signal', 'bellAlert', 'map', 'shield',
  'clock', 'calendarDays', 'arrowDown', 'arrowUp', 'arrowRight',
  'arrowLeft', 'xCircle', 'checkCircle', 'magnifyingGlassPlus', 'swatch',
  'creditCard', 'history', 'presentationChartBar', 'tableCells', 'chartBar'
];

// FontAwesome icon name mapping (camelCase to kebab-case)
const ICON_NAME_MAP = {
  search: 'magnifying-glass',
  close: 'xmark',
  settings: 'gear',
  mail: 'envelope', 
  warning: 'triangle-exclamation',
  info: 'circle-info',
  circleCheck: 'circle-check',
  lightBulb: 'lightbulb',
  chatBubble: 'comment-dots',
  view: 'eye',
  edit: 'pen-to-square',
  delete: 'trash-can',
  menu: 'bars',
  grid: 'table-cells',
  document: 'file',
  documentText: 'file-lines',
  xMark: 'xmark',
  fileLines: 'file-lines',
  chart: 'chart-bar',
  money: 'money-bill',
  trendUp: 'arrow-trend-up',
  trendDown: 'arrow-trend-down',
  lightning: 'bolt',
  userGroup: 'user-group',
  bellAlert: 'bell-slash',
  xCircle: 'circle-xmark',
  checkCircle: 'circle-check',
  magnifyingGlassPlus: 'magnifying-glass-plus',
  swatch: 'palette',
  creditCard: 'credit-card',
  history: 'clock-rotate-left',
  presentationChartBar: 'chart-line',
  tableCells: 'table',
  chartBar: 'chart-column'
};

// Main function
async function main() {
  console.log("=== FontAwesome Icon Debug and Fix Tool ===\n");
  
  // Step 1: Check if FontAwesome packages are installed
  console.log("Checking FontAwesome packages...");
  
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'package.json'), 'utf8'));
    
    const requiredPackages = [
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/react-fontawesome',
      '@fortawesome/pro-solid-svg-icons',
      '@fortawesome/pro-light-svg-icons',
      '@fortawesome/pro-regular-svg-icons',
      '@fortawesome/free-brands-svg-icons'
    ];
    
    const missingPackages = requiredPackages.filter(pkg => 
      !packageJson.dependencies[pkg] && !packageJson.devDependencies[pkg]
    );
    
    if (missingPackages.length > 0) {
      console.log(`❌ Missing FontAwesome packages: ${missingPackages.join(', ')}`);
      console.log("Please install these packages before proceeding.");
    } else {
      console.log("✅ All required FontAwesome packages are installed.");
    }
  } catch (error) {
    console.error("❌ Error reading package.json:", error.message);
  }
  
  // Step 2: Check icon.tsx file for proper imports
  console.log("\nAnalyzing icon.tsx file...");
  
  let iconFileContent;
  try {
    iconFileContent = fs.readFileSync(ICON_COMPONENT_PATH, 'utf8');
    
    // Check for necessary imports
    const hasStyles = iconFileContent.includes("@fortawesome/fontawesome-svg-core/styles.css");
    const hasConfig = iconFileContent.includes("import { config") && iconFileContent.includes("config.autoAddCss = false");
    const hasLibrary = iconFileContent.includes("import { library") || iconFileContent.includes("library.add(");
    
    if (!hasStyles) {
      console.log("❌ Missing FontAwesome styles import in icon.tsx");
    }
    
    if (!hasConfig) {
      console.log("❌ Missing FontAwesome config setup in icon.tsx");
    }
    
    if (!hasLibrary) {
      console.log("❌ Missing FontAwesome library import or registration in icon.tsx");
    }
    
    if (hasStyles && hasConfig && hasLibrary) {
      console.log("✅ Basic FontAwesome configuration in icon.tsx looks good.");
    }
  } catch (error) {
    console.error(`❌ Error reading icon.tsx: ${error.message}`);
  }
  
  // Step 3: Check icon-mappings.ts for proper icon definitions
  console.log("\nAnalyzing icon-mappings.ts file...");
  
  let mappingsFileContent;
  try {
    mappingsFileContent = fs.readFileSync(ICON_MAPPINGS_PATH, 'utf8');
    
    // Check if all UI icons are defined in the mappings
    const missingIcons = [];
    
    for (const icon of UI_ICONS) {
      if (!mappingsFileContent.includes(`${icon}:`)) {
        missingIcons.push(icon);
      }
    }
    
    if (missingIcons.length > 0) {
      console.log(`❌ Found ${missingIcons.length} missing icon definitions in icon-mappings.ts:`);
      console.log(`   ${missingIcons.join(', ')}`);
    } else {
      console.log("✅ All UI icons are defined in icon-mappings.ts.");
    }
  } catch (error) {
    console.error(`❌ Error reading icon-mappings.ts: ${error.message}`);
  }
  
  // Step 4: Check if icons are imported and registered in layout.tsx or icon.tsx
  console.log("\nChecking icon imports and registrations...");
  
  let layoutFileContent;
  try {
    layoutFileContent = fs.readFileSync(LAYOUT_PATH, 'utf8');
    
    const missingImports = [];
    
    // Convert UI_ICONS to their FA icon names
    for (const iconName of UI_ICONS) {
      const faName = ICON_NAME_MAP[iconName] || iconName;
      const importPattern = new RegExp(`(fa|fa${faName}|fa-${faName}).*from.*pro-solid-svg-icons`);
      
      if (!importPattern.test(iconFileContent) && !importPattern.test(layoutFileContent)) {
        missingImports.push(faName);
      }
    }
    
    if (missingImports.length > 0) {
      console.log(`❌ Found ${missingImports.length} potentially missing icon imports:`);
      console.log(`   ${missingImports.join(', ')}`);
    } else {
      console.log("✅ All required icons appear to be imported.");
    }
    
    // Check for library.add in either file
    const hasIconRegistration = iconFileContent.includes("library.add(") || layoutFileContent.includes("library.add(");
    
    if (!hasIconRegistration) {
      console.log("❌ No icon registration with library.add() found in icon.tsx or layout.tsx.");
    } else {
      console.log("✅ Icon registration with library.add() found.");
    }
  } catch (error) {
    console.error(`❌ Error reading layout.tsx: ${error.message}`);
  }
  
  // Step 5: Generate fix suggestions
  console.log("\n=== FIX RECOMMENDATIONS ===");
  
  // Create a test component
  console.log("\n1. Create or update an icon registration component in src/lib/icon-registry.tsx:");
  
  const iconRegistryCode = `'use client';

import { config, library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Configure Font Awesome
config.autoAddCss = false; // Prevent Font Awesome from automatically injecting CSS

// Import all required icons
import { 
  faUser, faCheck, faGear, faSearch, faPlus, faMinus, faXmark,
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faEnvelope, faCalendarDays, faTrash, faTriangleExclamation,
  faCircleInfo, faBell, faCircleCheck, faLightbulb, faCommentDots,
  faEye, faPenToSquare, faCopy, faTrashCan, faHeart, faStar,
  faBookmark, faShare, faUpload, faBars, faFilter, faTableCells,
  faList, faTag, faLock, faUnlock, faKey, faPaperclip, faDownload,
  faPlay, faFile, faFileLines, faHome, faChartBar, faChartPie,
  faMoneyBill, faArrowTrendUp, faArrowTrendDown, faBolt, faGlobe,
  faUserGroup, faBuilding, faRocket, faSignal, faBellSlash, faMap,
  faShield, faClock, faArrowDown, faArrowUp, faArrowRight, faArrowLeft,
  faCircleXmark, faMagnifyingGlassPlus, faPalette, faCreditCard,
  faClockRotateLeft, faChartLine, faTable, faQuestion
} from '@fortawesome/pro-solid-svg-icons';

// Light variants for outline styles
import {
  faUser as falUser,
  faGear as falGear,
  // Add more light icons as needed
} from '@fortawesome/pro-light-svg-icons';

// Register all icons with library
library.add(
  // Solid icons
  faUser, faCheck, faGear, faSearch, faPlus, faMinus, faXmark,
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faEnvelope, faCalendarDays, faTrash, faTriangleExclamation,
  faCircleInfo, faBell, faCircleCheck, faLightbulb, faCommentDots,
  faEye, faPenToSquare, faCopy, faTrashCan, faHeart, faStar,
  faBookmark, faShare, faUpload, faBars, faFilter, faTableCells,
  faList, faTag, faLock, faUnlock, faKey, faPaperclip, faDownload,
  faPlay, faFile, faFileLines, faHome, faChartBar, faChartPie,
  faMoneyBill, faArrowTrendUp, faArrowTrendDown, faBolt, faGlobe,
  faUserGroup, faBuilding, faRocket, faSignal, faBellSlash, faMap,
  faShield, faClock, faArrowDown, faArrowUp, faArrowRight, faArrowLeft,
  faCircleXmark, faMagnifyingGlassPlus, faPalette, faCreditCard,
  faClockRotateLeft, faChartLine, faTable, faQuestion,
  
  // Light icons
  falUser, falGear
  // Add more light icons here
);

// Component that can be used to ensure icons are loaded
export function IconRegistry() {
  // This component doesn't render anything visible
  return null;
}

export default IconRegistry;`;

  console.log(iconRegistryCode);
  
  console.log("\n2. Import the IconRegistry component in your app/layout.tsx file:");
  console.log(`
// Add this import in layout.tsx
import IconRegistry from '@/lib/icon-registry';

// Add this in the RootLayout component
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <IconRegistry />
        {children}
      </body>
    </html>
  );
}`);
  
  console.log("\n3. Run the application and navigate to http://localhost:3000/debug-tools/ui-components to check if icons are fixed.");
  
  // Ask if user wants to create the fix
  console.log("\nWould you like to automatically apply these fixes? (yes/no)");
  console.log("To apply manually, copy the above code and follow the instructions.");
}

// Run the main function
main().catch(error => {
  console.error("Error running FontAwesome diagnostic tool:", error);
  process.exit(1);
}); 