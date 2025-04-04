/**
 * Component Registry Utilities
 * 
 * Provides utilities for consistent component registration, path handling,
 * and default props management to ensure a single source of truth
 * for all UI components.
 */

import dynamic from 'next/dynamic';
import React from 'react';

// Cache for previously loaded components to improve performance
const componentCache = new Map();

/**
 * Simplified Component Import Mapping
 * 
 * Maps normalized component names to static import functions.
 * This eliminates webpack critical dependency warnings by using static imports
 * instead of dynamic expressions with variables.
 * 
 * Keys are component names in lowercase for consistent lookup.
 */
export const COMPONENT_IMPORTS = {
  // Atomic Components
  'accordion': () => import('@/components/ui/atoms/accordion/Accordion'),
  'alert': () => import('@/components/ui/atoms/alert/Alert'),
  'aspectratio': () => import('@/components/ui/atoms/aspect-ratio/Aspect-ratio'),
  'avatar': () => import('@/components/ui/atoms/avatar/Avatar'),
  'badge': () => import('@/components/ui/atoms/badge/badge'),
  'button': () => import('@/components/ui/atoms/button/Button'),
  'buttonwithicon': () => import('@/components/ui/atoms/button/ButtonWithIcon'),
  'iconbutton': () => import('@/components/ui/atoms/button/IconButton'),
  'actionbuttons': () => import('@/components/ui/atoms/button/ActionButtons'),
  'checkbox': () => import('@/components/ui/atoms/checkbox/Checkbox'),
  'collapsible': () => import('@/components/ui/atoms/collapsible/Collapsible'),
  'command': () => import('@/components/ui/atoms/command/Command'),
  'contextmenu': () => import('@/components/ui/atoms/context-menu/Context-menu'),
  'dialog': () => import('@/components/ui/atoms/dialog/Dialog'),
  'dropdownmenu': () => import('@/components/ui/atoms/dropdown-menu/Dropdown-menu'),
  'hovercard': () => import('@/components/ui/atoms/hover-card/Hover-card'),
  'icon': () => import('@/components/ui/atoms/icon/Icon'),
  'input': () => import('@/components/ui/atoms/input/Input'),
  'label': () => import('@/components/ui/atoms/label/Label'),
  'loadingspinner': () => import('@/components/ui/atoms/loading-spinner/loading-spinner'),
  'menubar': () => import('@/components/ui/atoms/menubar/Menubar'),
  'navigationmenu': () => import('@/components/ui/atoms/navigation-menu/Navigation-menu'),
  'popover': () => import('@/components/ui/atoms/popover/Popover'),
  'progress': () => import('@/components/ui/atoms/progress/Progress'),
  'radiogroup': () => import('@/components/ui/atoms/radio-group/Radio-group'),
  'scrollarea': () => import('@/components/ui/atoms/scroll-area/Scroll-area'),
  'select': () => import('@/components/ui/atoms/select/Select'),
  'separator': () => import('@/components/ui/atoms/separator/Separator'),
  'sheet': () => import('@/components/ui/atoms/sheet/Sheet'),
  'slider': () => import('@/components/ui/atoms/slider/slider'),
  'switch': () => import('@/components/ui/atoms/switch/Switch'),
  'table': () => import('@/components/ui/atoms/table/Table'),
  'tabs': () => import('@/components/ui/atoms/tabs/Tabs'),
  'textarea': () => import('@/components/ui/atoms/textarea/Textarea'),
  'toast': () => import('@/components/ui/atoms/toast/Toast'),
  'toggle': () => import('@/components/ui/atoms/toggle/Toggle'),
  'tooltip': () => import('@/components/ui/atoms/tooltip/Tooltip'),
  'heading': () => import('@/components/ui/atoms/typography/Heading'),
  'paragraph': () => import('@/components/ui/atoms/typography/Paragraph'),
  'text': () => import('@/components/ui/atoms/typography/Text'),
  'typography': () => import('@/components/ui/atoms/typography/Typography'),
  
  // Molecule Components
  'breadcrumb': () => import('@/components/ui/molecules/breadcrumb/Breadcrumb'),
  'carousel': () => import('@/components/ui/molecules/carousel/Carousel'),
  'combobox': () => import('@/components/ui/molecules/combobox/Combobox'),
  'datatable': () => import('@/components/ui/molecules/data-table/DataTable'),
  'pagination': () => import('@/components/ui/molecules/pagination/Pagination'),
  'resizable': () => import('@/components/ui/molecules/resizable/Resizable'),
  'searchbar': () => import('@/components/ui/molecules/search-bar/SearchBar'),
  'skeleton': () => import('@/components/ui/molecules/skeleton/Skeleton'),
  'formfieldskeleton': () => import('@/components/ui/molecules/skeleton/FormFieldSkeleton'),
  'loadingskeleton': () => import('@/components/ui/molecules/skeleton/LoadingSkeleton'),
  'skeletonsection': () => import('@/components/ui/molecules/skeleton/SkeletonSection'),
  'sonner': () => import('@/components/ui/molecules/sonner/Sonner'),
  'customtabs': () => import('@/components/ui/molecules/tabs/custom-tabs/CustomTabs'),
  
  // Organism Components
  'calendar': () => import('@/components/ui/organisms/calendar/Calendar'), // Maps both shadcn/calendar and atoms/calendar
  'calendardashboard': () => import('@/components/ui/organisms/calendar/CalendarDashboard'),
  'calendarupcoming': () => import('@/components/ui/organisms/calendar/CalendarUpcoming'),
  'calendardaterangepicker': () => import('@/components/ui/organisms/calendar-date-range-picker/CalendarDateRangePicker'),
  'card': () => import('@/components/ui/organisms/card/Card'), // Maps both shadcn/card and atoms/card
  'metriccard': () => import('@/components/ui/organisms/card/MetricCard'),
  'upcomingcampaignscard': () => import('@/components/ui/organisms/card/UpcomingCampaignsCard'),
  'assetcard': () => import('@/components/ui/organisms/card/asset-card/AssetCard'),
  'assetpreview': () => import('@/components/ui/organisms/card/asset-card/AssetPreview'),
  'datagrid': () => import('@/components/ui/organisms/data-display/data-grid/DataGrid'),
  'datepicker': () => import('@/components/ui/organisms/date-picker/DatePicker'),
  'form': () => import('@/components/ui/organisms/form/Form'),
  'modal': () => import('@/components/ui/organisms/modal/Modal'),
  'multiselect': () => import('@/components/ui/organisms/multi-select/MultiSelect'),
  'header': () => import('@/components/ui/organisms/navigation/header/Header'),
  'mobilemenu': () => import('@/components/ui/organisms/navigation/mobile-menu/MobileMenu'),
  'sidebar': () => import('@/components/ui/organisms/navigation/sidebar/Sidebar')
};

/**
 * Legacy path mapping - maintained for backward compatibility
 * Maps Shadcn-style flat paths to normalized component names
 */
export const SHADCN_PATH_MAPPING = {
  '@/components/ui/accordion': 'accordion',
  '@/components/ui/alert': 'alert',
  '@/components/ui/aspect-ratio': 'aspectratio',
  '@/components/ui/avatar': 'avatar',
  '@/components/ui/badge': 'badge',
  '@/components/ui/button': 'button',
  '@/components/ui/calendar': 'calendar',
  '@/components/ui/card': 'card',
  '@/components/ui/checkbox': 'checkbox',
  '@/components/ui/collapsible': 'collapsible',
  '@/components/ui/command': 'command',
  '@/components/ui/context-menu': 'contextmenu',
  '@/components/ui/dialog': 'dialog',
  '@/components/ui/dropdown-menu': 'dropdownmenu',
  '@/components/ui/hover-card': 'hovercard',
  '@/components/ui/icon': 'icon',
  '@/components/ui/input': 'input',
  '@/components/ui/label': 'label',
  '@/components/ui/loading-spinner': 'loadingspinner',
  '@/components/ui/menubar': 'menubar',
  '@/components/ui/navigation-menu': 'navigationmenu',
  '@/components/ui/popover': 'popover',
  '@/components/ui/progress': 'progress',
  '@/components/ui/radio-group': 'radiogroup',
  '@/components/ui/scroll-area': 'scrollarea',
  '@/components/ui/select': 'select',
  '@/components/ui/separator': 'separator',
  '@/components/ui/sheet': 'sheet',
  '@/components/ui/slider': 'slider',
  '@/components/ui/switch': 'switch',
  '@/components/ui/table': 'table',
  '@/components/ui/tabs': 'tabs',
  '@/components/ui/textarea': 'textarea',
  '@/components/ui/toast': 'toast',
  '@/components/ui/toggle': 'toggle',
  '@/components/ui/tooltip': 'tooltip',
  '@/components/ui/typography': 'typography',
  '@/components/ui/heading': 'heading',
  '@/components/ui/paragraph': 'paragraph',
  '@/components/ui/text': 'text'
};

/**
 * Extract component name from a path for simplified lookup
 * @param {string} path - The component path
 * @returns {string} - Normalized component name for lookup
 */
export function normalizeComponentPath(path) {
  if (!path) return '';
  
  // Handle shadcn flat paths directly
  if (SHADCN_PATH_MAPPING[path]) {
    return SHADCN_PATH_MAPPING[path];
  }
  
  // Extract component name from path
  const segments = path
    .replace('@/components/ui/', '')
    .replace(/^\/|\/$/g, '')
    .split('/');
  
  // Use last segment (the component name)
  const componentName = segments[segments.length - 1]
    .toLowerCase()
    .replace(/[.-]/g, ''); // Remove hyphens and dots for consistent matching
  
  return componentName;
}

/**
 * Find a similar component by partial name matching
 * @param {string} normalizedName - Normalized component name
 * @returns {Function|null} - Import function for similar component or null
 */
export function findSimilarComponentImport(normalizedName) {
  if (!normalizedName) return null;
  
  // Check if any key contains this name
  const keys = Object.keys(COMPONENT_IMPORTS);
  
  // Try to find a match
  const matchingKey = keys.find(key => 
    key.includes(normalizedName) || normalizedName.includes(key)
  );
  
  return matchingKey ? COMPONENT_IMPORTS[matchingKey] : null;
}

/**
 * Creates a fallback error component
 * @param {string} message - Error message to display
 * @returns {React.FC} A component that displays an error message
 */
export function createErrorComponent(message) {
  return function ErrorComponent(props) {
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50 text-red-600">
        <h3 className="font-medium mb-2">Component Error</h3>
        <div className="text-sm">{message}</div>
      </div>
    );
  };
}

/**
 * Resolve the component from a module, handling various export patterns
 * @param {Object} mod - The imported module
 * @param {string} componentName - Name of the component to extract
 * @returns {React.Component} The resolved component
 */
export function resolveComponentFromModule(mod, componentName) {
  if (!mod) {
    console.error('Module is undefined');
    return createErrorComponent('Module is undefined');
  }
  
  // Try exact named export first
  if (mod[componentName] && typeof mod[componentName] === 'function') {
    return mod[componentName];
  }
  
  // Try default export
  if (mod.default) {
    // If default is the component
    if (typeof mod.default === 'function') {
      return mod.default;
    }
    
    // If default contains the component
    if (mod.default[componentName]) {
      return mod.default[componentName];
    }
  }
  
  // For accordion-like components that export multiple parts
  const potentialComponentKeys = Object.keys(mod).filter(
    key => key.toLowerCase() === componentName?.toLowerCase() ||
           (componentName && key.toLowerCase().includes(componentName.toLowerCase()))
  );
  
  if (potentialComponentKeys.length > 0) {
    return mod[potentialComponentKeys[0]];
  }
  
  // Last resort: return first function export
  const firstFunctionExport = Object.values(mod).find(
    value => typeof value === 'function'
  );
  
  if (firstFunctionExport) {
    return firstFunctionExport;
  }
  
  console.warn(`Could not resolve component from module for: ${componentName}`);
  return createErrorComponent(`Component resolution failed: ${componentName}`);
}

/**
 * Register a new component in the registry
 * @param {string} key - The component key/name
 * @param {Function} importFn - Import function returning a Promise
 * @returns {boolean} Success status
 */
export function registerComponent(key, importFn) {
  if (typeof key !== 'string' || typeof importFn !== 'function') {
    console.error('Invalid component registration parameters');
    return false;
  }
  
  const normalizedKey = key.toLowerCase().replace(/[.-]/g, '');
  COMPONENT_IMPORTS[normalizedKey] = importFn;
  return true;
}

/**
 * Safely import a component with robust resolution and error handling
 * This is the main entry point for component imports
 * 
 * @param {string} importPath - Path to the component
 * @param {string} componentName - Name of the component to extract
 * @param {React.Component} fallback - Optional fallback component
 * @returns {Promise<React.Component>} Promise resolving to the component
 */
export function safeDynamicImport(importPath, componentName, fallback) {
  // For backward compatibility with previous dynamic path handling
  if (typeof importPath === 'object' && importPath.then) {
    return importPath
      .then(mod => resolveComponentFromModule(mod, componentName))
      .catch(error => {
        console.error(`Error importing module:`, error);
        return fallback || createErrorComponent(`Import failed`);
      });
  }

  // Check cache for performance
  const cacheKey = `${importPath}:${componentName}`;
  if (componentCache.has(cacheKey)) {
    return Promise.resolve(componentCache.get(cacheKey));
  }

  // Normalize path for lookup
  const normalizedPath = normalizeComponentPath(importPath);
  
  // Get import function or use similar path matching
  const importFn = COMPONENT_IMPORTS[normalizedPath] || 
                 findSimilarComponentImport(normalizedPath);
  
  if (!importFn) {
    console.error(`No component mapping found for: ${importPath} (normalized: ${normalizedPath})`);
    return Promise.resolve(fallback || createErrorComponent(`Component not found: ${importPath}`));
  }
  
  // Use the static import function
  return importFn()
    .then(mod => {
      const resolvedComponent = resolveComponentFromModule(mod, componentName || normalizedPath);
      
      if (resolvedComponent) {
        // Cache the result
        componentCache.set(cacheKey, resolvedComponent);
      }
      
      return resolvedComponent;
    })
    .catch(error => {
      console.error(`Error importing ${importPath}:`, error);
      return fallback || createErrorComponent(`Failed to load: ${importPath}`);
    });
}

/**
 * Resolve a Shadcn flat path to its corresponding component
 * Simplified version that uses the SHADCN_PATH_MAPPING
 * 
 * @param {string} importPath - The flat Shadcn-style path
 * @returns {string} - The normalized component name
 */
export function resolveShadcnPath(importPath) {
  // Handle non-string inputs
  if (typeof importPath !== 'string') {
    return importPath;
  }
  
  return SHADCN_PATH_MAPPING[importPath] || normalizeComponentPath(importPath);
}

/**
 * Dynamic component loader with error boundary
 * @param {string} path - Component path 
 * @param {string} name - Component name
 * @param {object} props - Default props
 * @returns {React.Component} Dynamically loaded component
 */
export function loadComponent(path, name, props = {}) {
  return dynamic(
    () => safeDynamicImport(path, name)
      .then(Component => {
        if (!Component) {
          console.error(`Failed to load component: ${name} from ${path}`);
          return createErrorComponent(`Failed to load ${name}`);
        }
        return Component;
      }),
    { 
      loading: () => <div className="p-2 text-gray-400">Loading {name}...</div>,
      ssr: false
    }
  );
}

// Export additional utilities for path handling and default props
export function applyDefaultProps(Component, props = {}) {
  if (!Component) return null;
  
  const ComponentWithDefaultProps = React.forwardRef((componentProps, ref) => {
    const mergedProps = { ...props, ...componentProps, ref };
    return <Component {...mergedProps} />;
  });
  
  ComponentWithDefaultProps.displayName = `WithDefaults(${Component.displayName || Component.name || 'Component'})`;
  
  return ComponentWithDefaultProps;
} 