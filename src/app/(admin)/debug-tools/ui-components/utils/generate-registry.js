/**
 * UI Component Registry Generator
 * 
 * This script generates a standardized registry of all UI components in the application
 * following the Single Source of Truth (SSOT) principle for component discovery,
 * path resolution, and metadata.
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { findIconReferences } = require('./icon-utils');

// Configure paths
const UI_ROOT = path.resolve(process.cwd(), 'src/components/ui');
const REGISTRY_OUTPUT = path.resolve(process.cwd(), 'public/static/component-registry.json');
const ATOMIC_CATEGORIES = ['atoms', 'molecules', 'organisms'];

// Define Shadcn component mapping to maintain compatibility with both patterns
// This serves as the SSOT for all Shadcn component definitions
const SHADCN_COMPONENTS = {
  // Core UI Components
  'accordion': { 
    category: 'atoms', 
    subComponents: ['AccordionItem', 'AccordionTrigger', 'AccordionContent'],
    description: 'A vertically stacked set of interactive headings that each reveal a section of content.',
  },
  'alert': { 
    category: 'atoms',
    subComponents: ['AlertTitle', 'AlertDescription'],
    description: 'Displays a callout for user attention.',
  },
  'alert-dialog': { 
    category: 'molecules',
    subComponents: ['AlertDialogTrigger', 'AlertDialogContent', 'AlertDialogHeader', 'AlertDialogFooter', 'AlertDialogTitle', 'AlertDialogDescription', 'AlertDialogAction', 'AlertDialogCancel'],
    description: 'A modal dialog that interrupts the user with important content and expects a response.',
  },
  'aspect-ratio': { 
    category: 'atoms',
    description: 'Displays content within a desired ratio.',
  },
  'avatar': { 
    category: 'atoms',
    subComponents: ['AvatarImage', 'AvatarFallback'],
    description: 'An image element with a fallback for representing the user.',
  },
  'badge': { 
    category: 'atoms',
    description: 'A small visual indicator for statuses, labels, or counts.',
  },
  'button': { 
    category: 'atoms',
    description: 'Displays a button or a component that looks like a button.',
  },
  'calendar': { 
    category: 'molecules',
    description: 'A date field component that allows users to enter and edit date values.',
  },
  'card': { 
    category: 'molecules',
    subComponents: ['CardHeader', 'CardFooter', 'CardTitle', 'CardDescription', 'CardContent'],
    description: 'Containers for displaying content and actions about a single subject.',
  },
  'checkbox': { 
    category: 'atoms',
    description: 'A control that allows the user to toggle between checked and not checked.',
  },
  'collapsible': { 
    category: 'molecules',
    subComponents: ['CollapsibleTrigger', 'CollapsibleContent'],
    description: 'A component that can be expanded/collapsed with animation.',
  },
  'command': { 
    category: 'molecules',
    subComponents: ['CommandInput', 'CommandList', 'CommandEmpty', 'CommandGroup', 'CommandItem', 'CommandShortcut', 'CommandSeparator'],
    description: 'Fast, composable, command menu for React.',
  },
  'context-menu': { 
    category: 'molecules',
    subComponents: ['ContextMenuTrigger', 'ContextMenuContent', 'ContextMenuItem', 'ContextMenuCheckboxItem', 'ContextMenuRadioItem', 'ContextMenuLabel', 'ContextMenuSeparator', 'ContextMenuShortcut', 'ContextMenuGroup', 'ContextMenuSub', 'ContextMenuSubTrigger', 'ContextMenuSubContent', 'ContextMenuRadioGroup'],
    description: 'Displays a menu at the pointer\'s position with a context-specific list of actions.',
  },
  'dialog': { 
    category: 'molecules',
    subComponents: ['DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogFooter', 'DialogTitle', 'DialogDescription'],
    description: 'A window overlaid on the primary window that interrupts the user\'s workflow.',
  },
  'dropdown-menu': { 
    category: 'molecules',
    subComponents: ['DropdownMenuTrigger', 'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuCheckboxItem', 'DropdownMenuRadioItem', 'DropdownMenuLabel', 'DropdownMenuSeparator', 'DropdownMenuShortcut', 'DropdownMenuGroup', 'DropdownMenuSub', 'DropdownMenuSubTrigger', 'DropdownMenuSubContent', 'DropdownMenuRadioGroup', 'DropdownMenuPortal'],
    description: 'Displays a menu to the user — such as a set of actions or functions.',
  },
  'hover-card': { 
    category: 'molecules',
    subComponents: ['HoverCardTrigger', 'HoverCardContent'],
    description: 'For sighted users to preview content available behind a link.',
  },
  'input': { 
    category: 'atoms',
    description: 'Displays form input field or a component that looks like an input field.',
  },
  'label': { 
    category: 'atoms',
    description: 'Renders an accessible label associated with controls.',
  },
  'menubar': { 
    category: 'molecules',
    subComponents: ['MenubarMenu', 'MenubarTrigger', 'MenubarContent', 'MenubarItem', 'MenubarSeparator', 'MenubarLabel', 'MenubarCheckboxItem', 'MenubarRadioGroup', 'MenubarRadioItem', 'MenubarPortal', 'MenubarSubContent', 'MenubarSubTrigger', 'MenubarGroup', 'MenubarSub', 'MenubarShortcut'],
    description: 'A horizontal menu commonly found at the top of desktop applications.',
  },
  'navigation-menu': { 
    category: 'molecules',
    subComponents: ['NavigationMenuList', 'NavigationMenuItem', 'NavigationMenuContent', 'NavigationMenuTrigger', 'NavigationMenuLink', 'NavigationMenuIndicator', 'NavigationMenuViewport'],
    description: 'A collection of links for navigating websites.',
  },
  'popover': { 
    category: 'molecules',
    subComponents: ['PopoverTrigger', 'PopoverContent'],
    description: 'Displays rich content in a portal, triggered by a button.',
  },
  'progress': { 
    category: 'atoms',
    description: 'Displays an indicator showing the completion progress of a task.',
  },
  'radio-group': { 
    category: 'molecules',
    subComponents: ['RadioGroupItem'],
    description: 'A set of checkable buttons—known as radio buttons—where no more than one can be checked.',
  },
  'scroll-area': { 
    category: 'atoms',
    subComponents: ['ScrollBar'],
    description: 'Augments native scroll functionality for custom, cross-browser styling.',
  },
  'select': { 
    category: 'molecules',
    subComponents: ['SelectGroup', 'SelectValue', 'SelectTrigger', 'SelectContent', 'SelectLabel', 'SelectItem', 'SelectSeparator', 'SelectScrollUpButton', 'SelectScrollDownButton'],
    description: 'Displays a list of options for the user to pick from—triggered by a button.',
  },
  'separator': { 
    category: 'atoms',
    description: 'Visually or semantically separates content.',
  },
  'sheet': { 
    category: 'molecules',
    subComponents: ['SheetTrigger', 'SheetClose', 'SheetContent', 'SheetHeader', 'SheetFooter', 'SheetTitle', 'SheetDescription'],
    description: 'Extends the Dialog component to display content that complements the main content of the screen.',
  },
  'skeleton': { 
    category: 'atoms',
    description: 'Used to show a placeholder while content is loading.',
  },
  'slider': { 
    category: 'molecules',
    description: 'An input where the user selects a value from within a given range.',
  },
  'switch': { 
    category: 'atoms',
    description: 'A control that allows the user to toggle between checked and not checked.',
  },
  'table': { 
    category: 'molecules',
    subComponents: ['TableHeader', 'TableBody', 'TableFooter', 'TableHead', 'TableRow', 'TableCell', 'TableCaption'],
    description: 'A responsive table component with various display options.',
  },
  'tabs': { 
    category: 'molecules',
    subComponents: ['TabsList', 'TabsTrigger', 'TabsContent'],
    description: 'A set of layered sections of content—known as tab panels—that display one panel at a time.',
  },
  'textarea': { 
    category: 'atoms',
    description: 'Displays a form textarea or a component that looks like a textarea.',
  },
  'toast': { 
    category: 'molecules',
    subComponents: ['ToastProvider', 'ToastViewport', 'ToastAction', 'ToastClose', 'ToastTitle', 'ToastDescription'],
    description: 'A succinct message that is displayed temporarily.',
  },
  'toggle': { 
    category: 'atoms',
    description: 'A two-state button that can be either on or off.',
  },
  'tooltip': { 
    category: 'atoms',
    subComponents: ['TooltipTrigger', 'TooltipContent', 'TooltipProvider'],
    description: 'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
  }
};

// Helper: Get component category from its path
function getComponentCategory(componentPath) {
  // Check for Atomic Design categories (atoms, molecules, organisms)
  for (const category of ATOMIC_CATEGORIES) {
    if (componentPath.includes(`/${category}/`)) {
      return category;
    }
  }
  
  // If not in an Atomic Design category, check if it's a Shadcn component
  const componentName = path.basename(componentPath).toLowerCase().replace(/\.tsx$/i, '');
  if (SHADCN_COMPONENTS[componentName]) {
    return SHADCN_COMPONENTS[componentName].category || 'atoms'; // Default to atoms
  }
  
  return 'atoms'; // Default category
}

// Helper: Extract component name from file path
function getComponentName(filePath) {
  // Extract PascalCase component name from file path
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Handle differently based on capitalization pattern (PascalCase vs kebab-case)
  if (/^[A-Z]/.test(fileName)) {
    // Already PascalCase
    return fileName; 
  } else {
    // Convert kebab-case to PascalCase
    return fileName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}

// Helper: Process a component file to extract metadata
function processComponentFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  const importPath = `@/${relativePath.replace(/^src\//, '').replace(/\.[^/.]+$/, '')}`;
  const componentName = getComponentName(filePath);
  const category = getComponentCategory(relativePath);
  const iconReferences = findIconReferences(filePath);
  
  return {
    name: componentName,
    category,
    importPath,
    filePath: relativePath,
    icons: iconReferences
  };
}

// Helper: Process Shadcn components to include their sub-components
function processShadcnComponents(components) {
  const result = [];
  const nameCollisions = new Map();
  
  // First pass: identify component name collisions
  components.forEach(component => {
    const name = component.name.toLowerCase();
    if (!nameCollisions.has(name)) {
      nameCollisions.set(name, 0);
    }
    nameCollisions.set(name, nameCollisions.get(name) + 1);
  });
  
  // Process all components, adding proper metadata for Shadcn components
  components.forEach(component => {
    const filename = path.basename(component.filePath).toLowerCase().replace(/\.tsx$/i, '');
    const shadcnInfo = SHADCN_COMPONENTS[filename];
    
    // Check if this is a Shadcn component
    if (shadcnInfo) {
      // For each Shadcn component, we might need to add subcomponents
      let mainComponent = {
        ...component,
        shadcn: true,
        description: shadcnInfo.description || component.description || '',
      };
      
      // Check for name collisions
      const name = component.name.toLowerCase();
      if (nameCollisions.get(name) > 1) {
        mainComponent.namespaced = true;
        mainComponent.displayName = `Shadcn${component.name}`;
      }
      
      result.push(mainComponent);
      
      // Add sub-components
      if (shadcnInfo.subComponents && Array.isArray(shadcnInfo.subComponents)) {
        shadcnInfo.subComponents.forEach(subComponentName => {
          result.push({
            name: subComponentName,
            category: component.category,
            parentComponent: component.name,
            _hidden: true, // Mark subcomponents as hidden in the direct registry
            importPath: component.importPath,
            filePath: component.filePath,
            shadcn: true,
            description: `Sub-component of ${component.name}`,
          });
        });
      }
    } else {
      // Regular component (not Shadcn) - add as is
      result.push(component);
    }
  });
  
  return result;
}

// Main function to generate the registry
async function generateComponentRegistry() {
  console.log('Generating UI component registry...');
  
  try {
    // Find all component files following Atomic Design
    const files = glob.sync(`${UI_ROOT}/**/*.{tsx,jsx}`, {
      ignore: [
        '**/*.stories.{tsx,jsx}',
        '**/*.test.{tsx,jsx}',
        '**/*.spec.{tsx,jsx}',
        '**/node_modules/**',
        '**/__tests__/**',
        '**/index.{tsx,jsx}'
      ]
    });
    
    console.log(`Found ${files.length} potential component files`);
    
    // Process all component files
    let components = files.map(processComponentFile);
    
    // Apply Shadcn processing
    components = processShadcnComponents(components);
    
    // Count visible components (excluding _hidden ones)
    const visibleCount = components.filter(c => !c._hidden).length;
    
    // Build final registry with metadata
    const registry = {
      components,
      count: visibleCount,
      generatedAt: new Date().toISOString(),
      version: '2.0.0'
    };
    
    // Write the registry to disk
    fs.writeFileSync(REGISTRY_OUTPUT, JSON.stringify(registry, null, 2));
    console.log(`Component registry generated with ${visibleCount} components`);
    
    return registry;
  } catch (error) {
    console.error('Error generating component registry:', error);
    throw error;
  }
}

// Validate that all components in the registry exist in the file system
function validateRegistry() {
  try {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_OUTPUT, 'utf8'));
    
    let missingFiles = 0;
    const validation = {
      valid: true,
      components: []
    };
    
    registry.components.forEach(component => {
      if (component._hidden) return; // Skip hidden components in validation
      
      const exists = fs.existsSync(component.filePath);
      if (!exists) {
        missingFiles++;
        validation.valid = false;
        validation.components.push({
          name: component.name,
          path: component.filePath,
          status: 'missing'
        });
      }
    });
    
    if (missingFiles > 0) {
      console.warn(`Validation failed: ${missingFiles} components in registry not found in the file system`);
      fs.writeFileSync(
        path.resolve(process.cwd(), 'public/static/component-validation.json'),
        JSON.stringify(validation, null, 2)
      );
    } else {
      console.log('Registry validation passed!');
    }
    
    return validation.valid;
  } catch (error) {
    console.error('Error validating registry:', error);
    return false;
  }
}

// Export the generator and validator functions
module.exports = {
  generateComponentRegistry,
  validateRegistry
};

// Allow direct execution
if (require.main === module) {
  generateComponentRegistry()
    .then(validateRegistry)
    .catch(err => {
      console.error('Registry generation failed:', err);
      process.exit(1);
    });
} 