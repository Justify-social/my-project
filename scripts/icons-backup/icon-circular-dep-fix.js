#!/usr/bin/env node

/**
 * Icon Circular Dependency Fix Script
 * 
 * This script fixes the circular dependency between:
 * - src/components/ui/icons/core/SvgIcon.tsx
 * - src/components/ui/icons/core/safe-icon.tsx
 * 
 * The circular dependency occurs because:
 * 1. SvgIcon imports SafeIcon for critical icons
 * 2. SafeIcon imports SvgIconProps from SvgIcon
 * 
 * This script resolves it by:
 * 1. Extracting the shared types to a separate file (icon-types.ts)
 * 2. Updating both files to import from the new types file
 * 3. Creating backups before making any changes
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, '../../../../.circular-dep-fixes-backup');
const ROOT_DIR = path.join(__dirname, '../../../../');

// Paths to components
const SVGICON_PATH = path.join(ROOT_DIR, 'src/components/ui/icons/core/SvgIcon.tsx');
const SAFEICON_PATH = path.join(ROOT_DIR, 'src/components/ui/icons/core/safe-icon.tsx');
const TYPES_PATH = path.join(ROOT_DIR, 'src/components/ui/icons/core/icon-types.ts');

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Stats for tracking
const stats = {
  backupsMade: 0,
  filesCreated: 0,
  filesModified: 0
};

/**
 * Creates a backup of files before modifying them
 */
function createBackups() {
  console.log(`${colors.blue}Creating backups of icon files...${colors.reset}`);
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Format timestamp
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  // Backup SvgIcon file
  if (fs.existsSync(SVGICON_PATH)) {
    const backupPath = path.join(BACKUP_DIR, `SvgIcon.${timestamp}.tsx`);
    if (!DRY_RUN) {
      fs.copyFileSync(SVGICON_PATH, backupPath);
    }
    console.log(`${colors.green}✓ Backed up${colors.reset} SvgIcon to ${backupPath}`);
    stats.backupsMade++;
  }
  
  // Backup SafeIcon file
  if (fs.existsSync(SAFEICON_PATH)) {
    const backupPath = path.join(BACKUP_DIR, `safe-icon.${timestamp}.tsx`);
    if (!DRY_RUN) {
      fs.copyFileSync(SAFEICON_PATH, backupPath);
    }
    console.log(`${colors.green}✓ Backed up${colors.reset} safe-icon to ${backupPath}`);
    stats.backupsMade++;
  }
}

/**
 * Creates a new type definition file for shared types
 */
function createTypeDefinitions() {
  console.log(`${colors.blue}Creating type definitions file...${colors.reset}`);
  
  // Define the content for the types file
  const typesContent = `/**
 * Icon Type Definitions
 * 
 * This file contains shared type definitions for the icon system.
 * It is separated to avoid circular dependencies between components.
 */

// Base icon types
export type IconName = string;
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type PlatformName = 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'x';
export type ActionType = 'default' | 'delete' | 'warning' | 'success';
export type IconType = 'button' | 'static';
export type IconStyle = 'solid' | 'light' | 'brands' | 'regular';

// Size constants
export const SIZE_CLASSES: Record<IconSize, string> = {
  'xs': 'w-3 h-3',
  'sm': 'w-4 h-4',
  'md': 'w-5 h-5',
  'lg': 'w-6 h-6',
  'xl': 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12',
  '4xl': 'w-16 h-16'
};

// Platform icon map
export const PLATFORM_ICON_MAP: Record<PlatformName, IconName> = {
  'facebook': 'faFacebook',
  'instagram': 'faInstagram',
  'linkedin': 'faLinkedin',
  'tiktok': 'faTiktok',
  'youtube': 'faYoutube',
  'x': 'faXTwitter'
} as const;

// SvgIcon props interface
export interface SvgIconProps {
  /**
   * Name of the icon to display
   */
  name: IconName;

  /**
   * CSS class names to apply to the icon
   */
  className?: string;

  /**
   * Size variant of the icon
   */
  size?: IconSize;

  /**
   * Optional title for accessibility
   */
  title?: string;

  /**
   * Click handler for the icon
   */
  onClick?: (e: React.MouseEvent<SVGElement>) => void;

  /**
   * Whether to apply a spin animation to the icon
   */
  spin?: boolean;

  /**
   * Whether to apply a pulse animation to the icon
   */
  pulse?: boolean;

  /**
   * Whether the icon should be flipped horizontally
   */
  flipHorizontal?: boolean;

  /**
   * Whether the icon should be flipped vertically
   */
  flipVertical?: boolean;

  /**
   * Degree rotation for the icon (0-360)
   */
  rotation?: 0 | 90 | 180 | 270;

  /**
   * Icon style (solid, light, etc) - by default uses the style from the icon prefix
   */
  style?: IconStyle;

  /**
   * Whether to use solid variant of the icon (alternative to style='solid')
   */
  solid?: boolean;

  /**
   * Whether the icon is in active state
   */
  active?: boolean;

  /**
   * Type of icon (button or static) - affects hover behavior
   */
  iconType?: IconType;

  /**
   * Action type of the icon - affects hover color
   */
  action?: ActionType;

  // Allow any other props to be passed through to the SVG element
  [key: string]: any;
}

// Platform icon props interface
export interface PlatformIconProps {
  /**
   * Name of the platform
   */
  platformName: PlatformName;

  /**
   * CSS class names to apply to the icon
   */
  className?: string;

  /**
   * Size variant of the icon
   */
  size?: IconSize;

  /**
   * Click handler for the icon
   */
  onClick?: (e: React.MouseEvent<SVGElement>) => void;
}

// Safe icon props interface
export interface SafeIconProps {
  icon: string;
  className?: string;
  solid?: boolean;
  size?: IconSize;
  iconType?: IconType;
  action?: ActionType;
  title?: string;
}`;
  
  if (!DRY_RUN) {
    fs.writeFileSync(TYPES_PATH, typesContent);
  }
  
  console.log(`${colors.green}✓ Created${colors.reset} type definitions file at ${TYPES_PATH}`);
  stats.filesCreated++;
}

/**
 * Updates the SvgIcon component to use the new types
 */
function updateSvgIcon() {
  console.log(`${colors.blue}Updating SvgIcon component...${colors.reset}`);
  
  // Check if file exists
  if (!fs.existsSync(SVGICON_PATH)) {
    console.log(`${colors.red}Error: SvgIcon file not found at ${SVGICON_PATH}${colors.reset}`);
    return;
  }
  
  // Read file content
  const content = fs.readFileSync(SVGICON_PATH, 'utf8');
  
  // Replace imports and export statements
  const updatedContent = content
    // Update the import of SvgIconProps
    .replace(
      /import React.+from 'react';/,
      `import React, { forwardRef, useRef, useMemo } from 'react';\nimport { SvgIconProps, PlatformIconProps, IconSize, IconName, PlatformName, SIZE_CLASSES, PLATFORM_ICON_MAP } from './icon-types';`
    )
    // Remove export of interfaces that are now in the types file
    .replace(/export interface SvgIconProps \{[\s\S]*?\[key: string\]: any;\n\}/m, '')
    .replace(/export interface PlatformIconProps \{[\s\S]*?\}\n/m, '')
    // Remove SIZE_CLASSES and PLATFORM_ICON_MAP definitions that are now in types
    .replace(/const SIZE_CLASSES: Record<IconSize, string> = \{[\s\S]*?\};/m, '')
    .replace(/const PLATFORM_ICON_MAP: Record<PlatformName, IconName> = \{[\s\S]*?\} as const;/m, '')
    // Remove type definitions that are now in the types file
    .replace(/type IconName = string;/m, '')
    .replace(/type IconSize = .+;/m, '')
    .replace(/type PlatformName = .+;/m, '');
  
  if (!DRY_RUN) {
    fs.writeFileSync(SVGICON_PATH, updatedContent);
  }
  
  console.log(`${colors.green}✓ Updated${colors.reset} SvgIcon component to use shared types`);
  stats.filesModified++;
}

/**
 * Updates the SafeIcon component to use the new types
 */
function updateSafeIcon() {
  console.log(`${colors.blue}Updating SafeIcon component...${colors.reset}`);
  
  // Check if file exists
  if (!fs.existsSync(SAFEICON_PATH)) {
    console.log(`${colors.red}Error: SafeIcon file not found at ${SAFEICON_PATH}${colors.reset}`);
    return;
  }
  
  // Read file content
  const content = fs.readFileSync(SAFEICON_PATH, 'utf8');
  
  // Replace the import from SvgIcon with import from icon-types
  const updatedContent = content
    .replace(
      /import .*SvgIcon.*;/,
      `import { SafeIconProps, SIZE_CLASSES } from './icon-types';`
    )
    // Remove interface definition
    .replace(/interface SafeIconProps \{[\s\S]*?\}\n/m, '')
    // Remove SIZE_CLASSES definition
    .replace(/const SIZE_CLASSES = \{[\s\S]*?\} as const;/m, '');
  
  if (!DRY_RUN) {
    fs.writeFileSync(SAFEICON_PATH, updatedContent);
  }
  
  console.log(`${colors.green}✓ Updated${colors.reset} SafeIcon component to use shared types`);
  stats.filesModified++;
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Icon Circular Dependency Fix Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Execute steps
  createBackups();
  createTypeDefinitions();
  updateSvgIcon();
  updateSafeIcon();
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}✓ Backups created:${colors.reset} ${stats.backupsMade}`);
  console.log(`${colors.green}✓ Files created:${colors.reset} ${stats.filesCreated}`);
  console.log(`${colors.green}✓ Files modified:${colors.reset} ${stats.filesModified}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}Circular dependency between SvgIcon and SafeIcon has been resolved!${colors.reset}`);
  }
}

// Run the script
main(); 