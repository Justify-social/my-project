// src/lib/component-registry-map.ts
// MANUAL Single Source of Truth for the UI Component Browser

import {
  type ExtendedComponentMetadata,
  type ComponentCategory,
  // type ComponentRenderType, // Removed unused
  // type ComponentStatus, // Removed unused
} from '@/app/(admin)/debug-tools/ui-components/types'; // Import shared types

// Removed redundant interface ManualComponentEntry
// Define the structure for each component entry
// interface ManualComponentEntry extends ExtendedComponentMetadata {
//    // We might not need filePath anymore if we use a direct import map
//    // Ensure required fields from ExtendedComponentMetadata are present
// }

// --- MANUALLY MAINTAINED COMPONENT LIST ---
// Add ALL your components here with their metadata
// Use the imported ExtendedComponentMetadata type directly
const components: ExtendedComponentMetadata[] = [
  {
    name: 'Button',
    category: 'atom',
    renderType: 'client', // Assuming based on file content
    status: 'stable',
    description: 'Displays a button or a link with button styling.',
    filePath: '/src/components/ui/button.tsx', // Keep for reference or potential future use
    examples: [
      '<Button>Default</Button>',
      '<Button variant="secondary">Secondary</Button>',
      '<Button variant="destructive">Destructive</Button>',
    ],
    // Add other relevant metadata like author, since, etc.
  },
  {
    name: 'Card',
    category: 'molecule',
    renderType: 'client', // Assuming
    status: 'stable',
    description: 'A container for grouping related content.',
    filePath: '/src/components/ui/card.tsx',
    examples: [
      '<Card><CardHeader><CardTitle>Card Title</CardTitle></CardHeader><CardContent>Content</CardContent></Card>',
    ],
  },
  {
    name: 'Badge',
    category: 'atom',
    renderType: 'client',
    status: 'stable',
    description: 'Displays a small badge or tag.',
    filePath: '/src/components/ui/badge.tsx',
    examples: ['<Badge>Default</Badge>', '<Badge variant="secondary">Secondary</Badge>'],
  },
  {
    name: 'AspectRatio',
    category: 'atom',
    subcategory: 'layout',
    renderType: 'client',
    status: 'stable',
    description: 'Displays content within a fixed aspect ratio.',
    filePath: '/src/components/ui/aspect-ratio.tsx',
    examples: [
      '<AspectRatio ratio={16 / 9} className="bg-muted"><img src="..." alt="Image" /></AspectRatio>',
    ],
  },
  // ... ADD ALL OTHER COMPONENTS HERE ...
  // e.g., Alert, AlertDialog, Avatar, Calendar, Checkbox, Input, Select, Table, Tabs, etc.
];

// --- Helper Functions to Process the Manual List ---

// Function to group components by category
const groupComponentsByCategory = (): Record<string, ExtendedComponentMetadata[]> => {
  const grouped: Record<string, ExtendedComponentMetadata[]> = {};
  components.forEach(component => {
    const category = component.category || 'unknown';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(component);
  });
  return grouped;
};

// Function to create a name lookup map (lowercase key)
const createNameLookup = (): Record<string, ExtendedComponentMetadata> => {
  const lookup: Record<string, ExtendedComponentMetadata> = {};
  components.forEach(component => {
    lookup[component.name.toLowerCase()] = component;
  });
  return lookup;
};

// Build the registry object from the manual list
const buildManualRegistry = () => {
  const byCategory = groupComponentsByCategory();
  const byName = createNameLookup();
  const allCategories = Object.keys(byCategory).sort() as ComponentCategory[];

  return {
    components,
    byCategory,
    byName,
    allCategories,
  };
};

// Export the manually built registry
export const manualComponentRegistry = buildManualRegistry();

// --- (Optional but Recommended) Component Import Map for Renderer ---
// This helps ComponentPreviewRenderer load components without complex path logic
export const componentImportMap: Record<string, () => Promise<unknown>> = {
  Button: () => import('@/components/ui/button'),
  Card: () => import('@/components/ui/card'),
  Badge: () => import('@/components/ui/badge'),
  AspectRatio: () => import('@/components/ui/aspect-ratio'),
  // ... ADD IMPORTS FOR ALL OTHER COMPONENTS LISTED ABOVE ...
  // 'Alert': () => import('@/components/ui/alert'),
  // 'AlertDialog': () => import('@/components/ui/alert-dialog'),
  // 'Avatar': () => import('@/components/ui/avatar'),
};
