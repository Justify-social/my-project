/**
 * HeroIcon to FontAwesome Migration Script
 * 
 * This script scans the codebase for HeroIcon usage and converts it to our
 * FontAwesome-based icon system. It handles both direct imports and 
 * migrateHeroIcon function usage.
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Mapping of HeroIcon imports to our corresponding icon names
const HERO_ICON_MAP = {
  // From @heroicons/react/24/outline or @heroicons/react/24/solid
  'UserIcon': 'user',
  'UsersIcon': 'userGroup',
  'CogIcon': 'settings',
  'BellIcon': 'bell',
  'CalendarIcon': 'calendar',
  'DocumentIcon': 'document',
  'DocumentTextIcon': 'documentText',
  'TrashIcon': 'delete',
  'PencilIcon': 'edit',
  'PencilAltIcon': 'edit',
  'EyeIcon': 'view',
  'EyeOffIcon': 'view',
  'ChevronDownIcon': 'chevronDown',
  'ChevronUpIcon': 'chevronUp',
  'ChevronLeftIcon': 'chevronLeft',
  'ChevronRightIcon': 'chevronRight',
  'XIcon': 'xmark',
  'XCircleIcon': 'xCircle',
  'CheckIcon': 'check',
  'CheckCircleIcon': 'checkCircle',
  'ExclamationIcon': 'warning',
  'ExclamationCircleIcon': 'warning',
  'PlusIcon': 'plus',
  'MinusIcon': 'minus',
  'SearchIcon': 'search',
  'HomeIcon': 'home',
  'HeartIcon': 'heart',
  'PhotographIcon': 'photo',
  'UserCircleIcon': 'userCircle',
  'InformationCircleIcon': 'circleInfo',
  'ArrowLeftIcon': 'chevronLeft',
  'ArrowTrendingUpIcon': 'chartLine',
  'ArrowTrendingDownIcon': 'chartLine',
  'ArrowPathIcon': 'rotate',
  'PrinterIcon': 'print',
  'ShareIcon': 'share',
  'CurrencyDollarIcon': 'dollarSign',
  'BuildingOfficeIcon': 'building',
  'ServerIcon': 'server',
  'DocumentChartBarIcon': 'chartBar',
  'ExclamationTriangleIcon': 'warning',
  'BugAntIcon': 'bug',
  'TagIcon': 'tag',
  'ChartBarIcon': 'chartBar',
  'PhoneIcon': 'phone',
  'EnvelopeIcon': 'envelope',
  'MapPinIcon': 'locationDot',
  'ClockIcon': 'clock',
  'GlobeAltIcon': 'globe',
  'IdentificationIcon': 'idCard',
  'LightBulbIcon': 'lightbulb',
  'ShieldCheckIcon': 'shieldCheck',
  // Add missing mappings found in dry run
  'PhotoIcon': 'photo',
  'BellAlertIcon': 'bellAlert',
  'LightningBoltIcon': 'lightning',
  'CreditCardIcon': 'creditCard',
  'CashIcon': 'money',
  'KeyIcon': 'key',
  'SwatchIcon': 'swatch',
};

// Check if glob is installed
try {
  require.resolve('glob');
} catch (e) {
  console.log('Installing required dependency: glob...');
  execSync('npm install glob --save-dev', { stdio: 'inherit' });
  console.log('Dependency installed successfully!');
}

// Command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const fixFlag = args.includes('--fix');
const targetFiles = args.filter(arg => !arg.startsWith('--')).filter(Boolean);

// Default target patterns
const DEFAULT_PATTERNS = ['src/**/*.{ts,tsx,js,jsx}'];

// Files to process
const patterns = targetFiles.length > 0 ? targetFiles : DEFAULT_PATTERNS;

// Get all files matching patterns
const sourceFiles = patterns.reduce((acc, pattern) => {
  return acc.concat(glob.sync(pattern, { ignore: ['**/node_modules/**', '**/build/**', '**/dist/**'] }));
}, []);

if (verbose) {
  console.log(`Found ${sourceFiles.length} files to process`);
}

let totalHeroIconImports = 0;
let totalMigrateHeroIconUsages = 0;
let modifiedFiles = 0;

// Statistics for different types of changes
const stats = {
  directImports: 0,
  componentUsages: 0,
  migrateHeroIconCalls: 0,
  iconComponentFactoryCalls: 0,
  unknownIconNames: new Set(),
};

// Process each file
sourceFiles.forEach(filePath => {
  if (verbose) {
    console.log(`Processing: ${filePath}`);
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileModified = false;
  
  // Replace direct HeroIcon imports
  const heroIconImportRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@heroicons\/react\/[^'"]+['"]/g;
  const importMatches = content.match(heroIconImportRegex) || [];
  totalHeroIconImports += importMatches.length;
  
  if (importMatches.length > 0) {
    stats.directImports += importMatches.length;
    // Replace each import statement
    content = content.replace(heroIconImportRegex, (match, iconList) => {
      // Extract individual icon names
      const icons = iconList.split(',').map(i => i.trim());
      const iconAliases = icons.filter(i => i.includes(' as '));
      const regularIcons = icons.filter(i => !i.includes(' as '));
      
      if (verbose) {
        console.log(`  Found import with icons: ${regularIcons.join(', ')}`);
      }
      
      // Process regular icons (no aliases)
      const iconNames = regularIcons.map(icon => HERO_ICON_MAP[icon] || icon);
      
      // Return the new import statement
      return `import { Icon } from '@/components/ui/icons'`;
    });
    
    fileModified = true;
  }
  
  // Fix className syntax errors in Icon components
  const classNameSyntaxErrorRegex = /<Icon\s+name=["']([^"']+)["']\s+className:\s*["']([^"']+)["']\s*\}?\/?>/g;
  const classNameSyntaxMatches = [...content.matchAll(classNameSyntaxErrorRegex)] || [];
  
  if (classNameSyntaxMatches.length > 0) {
    if (verbose) {
      console.log(`  Found ${classNameSyntaxMatches.length} Icon components with className syntax errors`);
    }
    
    content = content.replace(classNameSyntaxErrorRegex, (match, iconName, classValue) => {
      return `<Icon name="${iconName}" className="${classValue}" />`;
    });
    
    fileModified = true;
  }
  
  // Replace HeroIcon component usage
  Object.entries(HERO_ICON_MAP).forEach(([heroIcon, faIcon]) => {
    const componentRegex = new RegExp(`<${heroIcon}([^>]*)>`, 'g');
    const componentClosingRegex = new RegExp(`</${heroIcon}>`, 'g');
    
    const matches = content.match(componentRegex) || [];
    if (matches.length > 0) {
      stats.componentUsages += matches.length;
      
      if (verbose) {
        console.log(`  Found component usage: ${heroIcon} -> ${faIcon}`);
      }
      
      content = content.replace(componentRegex, (match, props) => {
        return `<Icon name="${faIcon}"${props}>`;
      });
      
      content = content.replace(componentClosingRegex, '</Icon>');
      fileModified = true;
    }
  });
  
  // Replace migrateHeroIcon usage with direct Icon components
  const migrateHeroIconRegex = /migrateHeroIcon\(\s*['"]([^'"]+)['"]\s*,\s*(\{[^}]+\})\s*\)/g;
  const migrateMatches = [...content.matchAll(migrateHeroIconRegex)] || [];
  totalMigrateHeroIconUsages += migrateMatches.length;
  
  if (migrateMatches.length > 0) {
    stats.migrateHeroIconCalls += migrateMatches.length;
    
    migrateMatches.forEach(match => {
      const [fullMatch, iconName, props] = match;
      const mappedName = HERO_ICON_MAP[iconName];
      
      if (!mappedName) {
        stats.unknownIconNames.add(iconName);
      }
      
      if (verbose) {
        console.log(`  Found migrateHeroIcon call: ${iconName} -> ${mappedName || 'UNKNOWN'}`);
      }
    });
    
    content = content.replace(migrateHeroIconRegex, (match, iconName, props) => {
      const mappedName = HERO_ICON_MAP[iconName] || 
                         (iconName.charAt(0) === iconName.charAt(0).toUpperCase() ? 
                          HERO_ICON_MAP[iconName.replace(/Icon$/, '')] : iconName);
      
      if (!mappedName) {
        console.warn(`  WARNING: No mapping found for icon: ${iconName}`);
        return match; // Keep the original if no mapping is found
      }
      
      return `<Icon name="${mappedName}" ${props.slice(1, -1)}}/>`;
    });
    
    fileModified = true;
  }
  
  // Replace iconComponentFactory usage
  const iconComponentFactoryRegex = /iconComponentFactory\(\s*['"]([^'"]+)['"]\s*\)/g;
  const factoryMatches = [...content.matchAll(iconComponentFactoryRegex)] || [];
  
  if (factoryMatches.length > 0) {
    stats.iconComponentFactoryCalls += factoryMatches.length;
    
    factoryMatches.forEach(match => {
      const [fullMatch, iconName] = match;
      const mappedName = HERO_ICON_MAP[iconName];
      
      if (!mappedName) {
        stats.unknownIconNames.add(iconName);
      }
      
      if (verbose) {
        console.log(`  Found iconComponentFactory call: ${iconName} -> ${mappedName || 'UNKNOWN'}`);
      }
    });
    
    content = content.replace(iconComponentFactoryRegex, (match, iconName) => {
      const mappedName = HERO_ICON_MAP[iconName] || 
                         (iconName.charAt(0) === iconName.charAt(0).toUpperCase() ? 
                          HERO_ICON_MAP[iconName.replace(/Icon$/, '')] : iconName);
      
      if (!mappedName) {
        console.warn(`  WARNING: No mapping found for icon: ${iconName}`);
        return match; // Keep the original if no mapping is found
      }
      
      return `(props) => <Icon name="${mappedName}" {...props} />`;
    });
    
    fileModified = true;
  }
  
  // Clean up imports if using migrateHeroIcon but not using direct HeroIcon imports
  if (content.includes('import { migrateHeroIcon') && !content.includes('migrateHeroIcon(')) {
    // Replace import statements that only import migrateHeroIcon
    content = content.replace(/import\s+\{\s*migrateHeroIcon\s*\}\s+from\s+['"]@\/components\/ui\/icons['"];?/g, 
      (match) => {
        if (verbose) {
          console.log(`  Removing unused migrateHeroIcon import`);
        }
        return `import { Icon } from '@/components/ui/icons';`;
      });
    
    // Replace import statements that import migrateHeroIcon along with other imports
    content = content.replace(/import\s+\{\s*([^}]*),\s*migrateHeroIcon\s*,?\s*([^}]*)\s*\}\s+from\s+['"]@\/components\/ui\/icons['"];?/g, 
      (match, before, after) => {
        const beforeClean = before.trim();
        const afterClean = after.trim();
        
        if (verbose) {
          console.log(`  Cleaning up import with migrateHeroIcon: before=${beforeClean}, after=${afterClean}`);
        }
        
        const newImports = [];
        if (beforeClean) newImports.push(beforeClean);
        if (!beforeClean.includes('Icon') && !afterClean.includes('Icon')) {
          newImports.push('Icon');
        }
        if (afterClean) newImports.push(afterClean);
        
        if (newImports.length === 0) {
          return '';
        }
        
        return `import { ${newImports.join(', ')} } from '@/components/ui/icons';`;
      });
    
    fileModified = true;
  }
  
  // Write changes if the file was modified
  if (fileModified) {
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`🔍 Would update (dry run): ${filePath}`);
    }
  }
});

console.log(`
Migration Summary:
-----------------
Files scanned: ${sourceFiles.length}
Files modified: ${modifiedFiles}

Changes found:
- Direct HeroIcon imports: ${stats.directImports}
- HeroIcon component usages: ${stats.componentUsages}
- migrateHeroIcon calls: ${stats.migrateHeroIconCalls}
- iconComponentFactory calls: ${stats.iconComponentFactoryCalls}

Unknown icons found: ${Array.from(stats.unknownIconNames).join(', ') || 'None'}
`);

if (dryRun) {
  console.log('This was a dry run. No files were actually modified.');
  console.log('To apply changes, run without the --dry-run flag or use --fix');
} else if (modifiedFiles > 0) {
  console.log('✅ Migration complete! Please verify the changes.');
  console.log('Run the application to ensure everything works correctly.');
  console.log('Once verified, you can remove @heroicons/react from dependencies.');
} else {
  console.log('No files were modified. Either all migrations have been completed or no HeroIcon usage was found.');
}

// Verification instructions
console.log(`
Next steps:
1. Run verification: npm run verify-icons
2. Start the app: npm run dev
3. Check all pages with icon usage
4. Once verified, remove HeroIcon dependency: npm uninstall @heroicons/react
`); 