// src/lib/ui-component-map.ts

export type ComponentCategory = 'Atom' | 'Molecule' | 'Organism';

export interface UIComponentMapEntry {
  name: string;
  path: string; // Path relative to '@/components/ui/'
  componentName: string; // Exported component name
  category: ComponentCategory;
}

export const uiComponentMap: UIComponentMapEntry[] = [
  // Atoms (Basic building blocks)
  {
    name: 'Button',
    path: 'button',
    componentName: 'Button',
    category: 'Atom',
  },
  {
    name: 'Input',
    path: 'input',
    componentName: 'Input',
    category: 'Atom',
  },
  {
    name: 'Icon',
    path: 'icon',
    componentName: 'Icon',
    category: 'Atom',
  },
  {
    name: 'Spinner',
    path: 'spinner/Spinner',
    componentName: 'Spinner',
    category: 'Atom',
  },

  // Molecules (Combinations of atoms)
  {
    name: 'Card',
    path: 'card',
    componentName: 'Card',
    category: 'Molecule',
  },
  {
    name: 'Tabs',
    path: 'tabs',
    componentName: 'Tabs',
    category: 'Molecule',
  },
  {
    name: 'Search Bar',
    path: 'search-bar',
    componentName: 'SearchBar',
    category: 'Molecule',
  },

  // Organisms (Complex structures)
  {
    name: 'Header',
    path: 'navigation/header',
    componentName: 'Header',
    category: 'Organism',
  },
  {
    name: 'Sidebar',
    path: 'navigation/sidebar',
    componentName: 'Sidebar',
    category: 'Organism',
  },
  {
    name: 'Mobile Menu',
    path: 'navigation/mobile-menu',
    componentName: 'MobileMenu',
    category: 'Organism',
  },
  // Add all other components from src/components/ui here...
];
