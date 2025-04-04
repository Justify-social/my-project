# UI Component Export Error Analysis

## Problem Analysis

We're encountering parsing errors in `src/components/ui/index.ts` due to **duplicate exports** of the same component names. This is causing a 500 error when accessing the UI components page.

Key error message:
```
Module parse failed: Duplicate export 'AspectRatio' (163:20)
```

### Current Issues

1. **Multiple export methods in the same file**:
   - Named exports from paths using `@/components/ui/...`
   - Wildcard exports (`export * from "./atoms/..."`) 
   - Default exports with aliases (`export { default as X }`)

2. **Specific duplicate exports identified**:
   - `AspectRatio` exported 4 different ways:
     - Named export from path
     - Named export with alias
     - Wildcard export
     - Default export with alias

3. **Multiple naming conflicts**:
   - Components with hyphenated filenames (`aspect-ratio`, `context-menu`)
   - Components exported multiple times with different import methods
   - Components with both named and default exports

## Root Cause

JavaScript/TypeScript modules cannot have multiple exports with the same name. Our current approach tries to provide multiple ways to import components, but it creates naming collisions in the process.

## Solution Plan

### 1. Eliminate the Three-Tier Export Approach

Currently, the file is trying to export components in three redundant ways:
- Direct imports with absolute paths
- Wildcard exports with relative paths
- Default exports with aliases

We should pick **ONE** consistent approach.

### 2. Proposed Structure

```typescript
/**
 * Centralized UI Component Exports
 */

// APPROACH 1: Use named exports with consistent namespacing
export { AspectRatio } from './atoms/aspect-ratio/Aspect-ratio';
export { AspectRatio as MoleculeAspectRatio } from './molecules/aspect-ratio/Aspect-ratio';

// APPROACH 2: Or, namespaced exports for atomic design pattern
export * as Atoms from './atoms/index';
export * as Molecules from './molecules/index';
export * as Organisms from './organisms/index';

// APPROACH 3: Or, category-based direct exports without wildcards
// Button components
export { Button } from './atoms/button/Button';
export { ButtonWithIcon } from './atoms/button/ButtonWithIcon';
export { IconButton } from './atoms/button/IconButton';

// Layout components
export { AspectRatio } from './atoms/aspect-ratio/Aspect-ratio';
export { Card } from './organisms/card/Card';
```

### 3. Implementation Steps

1. **Create a backup** of the current index.ts file
2. **Remove all wildcard exports** (`export * from...`)
3. **Choose one naming pattern** for duplicate components:
   - Either use namespaced exports (ComponentName + Category)
   - Or use one source as the canonical export
4. **Fix hyphenated component names** by using consistent camelCase/PascalCase
5. **Test each step** incrementally to identify any missing exports

### 4. Additional Recommendations

- Create separate barrel files for each category (atoms/index.ts, molecules/index.ts)
- Use a component registry to track all UI components
- Add automated tests to verify component exports
- Consider using a script to generate the exports file to prevent human error

## Expected Outcome

- Clean UI component exports without duplicates
- More maintainable export structure
- Clear patterns for adding new components
- No naming collisions

## Dry Run Implementation

Based on the analysis, here's how the fixed `src/components/ui/index.ts` file should look:

```typescript
/**
 * Centralized UI Component Exports
 * 
 * This file provides a centralized export point for all UI components.
 * Components are organized by category with clear namespacing for duplicates.
 * 
 * IMPORTANT: No wildcard exports or duplicate named exports are used to prevent
 * parsing errors and name collisions.
 */

// =========================================================================
// ATOM COMPONENTS
// =========================================================================

// Container and Layout components
export { AspectRatio } from './atoms/aspect-ratio/Aspect-ratio';
export { Separator } from './atoms/separator/Separator';

// Form components 
export { Button } from './atoms/button/Button';
export { ButtonWithIcon } from './atoms/button/ButtonWithIcon';
export { IconButton } from './atoms/button/IconButton';
export { Checkbox } from './atoms/checkbox/Checkbox';
export { Input } from './atoms/input/Input';
export { Label } from './atoms/label/Label';
export { Select } from './atoms/select/Select';
export { Switch } from './atoms/switch/Switch';
export { Textarea } from './atoms/textarea/Textarea';
export { Toggle } from './atoms/toggle/Toggle';

// Interactive components
export { Accordion } from './atoms/accordion/Accordion';
export { Alert } from './atoms/alert/Alert';
export { Avatar } from './atoms/avatar/Avatar';
export { Badge } from './atoms/badge/badge';
export { Command } from './atoms/command/Command';
export { Dialog } from './atoms/dialog/Dialog';
export { Popover } from './atoms/popover/Popover';
export { Progress } from './atoms/progress/Progress';
export { Sheet } from './atoms/sheet/Sheet';
export { Table } from './atoms/table/Table';
export { Tabs } from './atoms/tabs/Tabs';
export { Toast } from './atoms/toast/Toast';
export { Tooltip } from './atoms/tooltip/Tooltip';

// Navigation components
export { Menubar } from './atoms/menubar/Menubar';

// Media components
export { Icon } from './atoms/icon/Icon';

// Typography components
export { Heading } from './atoms/typography/Heading';
export { Paragraph } from './atoms/typography/Paragraph';
export { Text } from './atoms/typography/Text';
export { Typography } from './atoms/typography/Typography';

// Utility components
export { Collapsible } from './atoms/collapsible/Collapsible';

// =========================================================================
// MOLECULE COMPONENTS - with namespacing for duplicates
// =========================================================================

export { AspectRatio as MoleculeAspectRatio } from './molecules/aspect-ratio/Aspect-ratio';
export { Breadcrumb } from './molecules/breadcrumb/Breadcrumb';
export { Carousel } from './molecules/carousel/Carousel';
export { Combobox } from './molecules/combobox/Combobox';
export { DataTable } from './molecules/data-table/DataTable';
export { Pagination } from './molecules/pagination/Pagination';
export { Resizable } from './molecules/resizable/Resizable';
export { ScrollArea as MoleculeScrollArea } from './molecules/scroll-area/ScrollArea';
export { SearchBar } from './molecules/search-bar/SearchBar';
export { FormFieldSkeleton } from './molecules/skeleton/FormFieldSkeleton';
export { LoadingSkeleton } from './molecules/skeleton/LoadingSkeleton';
export { Skeleton } from './molecules/skeleton/Skeleton';
export { SkeletonSection } from './molecules/skeleton/SkeletonSection';
export { Sonner } from './molecules/sonner/Sonner';

// =========================================================================
// ORGANISM COMPONENTS
// =========================================================================

export { Calendar } from './organisms/calendar/Calendar';
export { CalendarDashboard } from './organisms/calendar/CalendarDashboard';
export { CalendarUpcoming } from './organisms/calendar/CalendarUpcoming';
export { CalendarDateRangePicker } from './organisms/calendar-date-range-picker/CalendarDateRangePicker';
export { Card } from './organisms/card/Card';
export { MetricCard } from './organisms/card/MetricCard';
export { UpcomingCampaignsCard } from './organisms/card/UpcomingCampaignsCard';
export { DatePicker } from './organisms/date-picker/DatePicker';
export { Form } from './organisms/form/Form';
export { Modal } from './organisms/modal/Modal';
export { MultiSelect } from './organisms/multi-select/MultiSelect';

// =========================================================================
// SPECIAL COMPONENTS WITH COMPOSED NAMES (hyphenated file paths)
// =========================================================================

// Context Menu component and subcomponents
export { default as ContextMenu } from './atoms/context-menu/Context-menu';
export { 
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup
} from './atoms/context-menu/Context-menu';

// Dropdown Menu component and subcomponents
export { default as DropdownMenu } from './atoms/dropdown-menu/Dropdown-menu';

// Hover Card component
export { default as HoverCard } from './atoms/hover-card/Hover-card';

// Icon registry and adapters
export { default as RegistryLoader, iconRegistry } from './atoms/icon/registry-loader';
export { default as FontAwesomeAdapter } from './atoms/icon/adapters/font-awesome-adapter';

// Loading Spinner component
export { default as LoadingSpinner } from './atoms/loading-spinner/loading-spinner';

// Navigation Menu component
export { default as NavigationMenu } from './atoms/navigation-menu/Navigation-menu';

// Radio Group component
export { default as RadioGroup } from './atoms/radio-group/Radio-group';

// Scroll Area components (distinguished by namespace)
export { default as AtomScrollArea } from './atoms/scroll-area/Scroll-area';
export { default as MoleculeScrollArea2 } from './molecules/scroll-area/scroll-area';

// =========================================================================
// UTILITY EXPORTS (lowercase functions, constants, etc.)
// =========================================================================

export { badgeVariants } from './atoms/badge/badge';
export { buttonVariants } from './atoms/button/Button';
export { iconRegistry as semanticMap } from './atoms/icon/registry-loader';
```

With this implementation:

1. We've eliminated wildcard exports completely
2. Organized exports by component category
3. Added namespacing for duplicate components (AspectRatio, ScrollArea)  
4. Properly handled hyphenated file paths with explicit exports
5. Clearly separated component exports from utility exports

This structure is more maintainable, eliminates duplicate exports, and provides a clear pattern for adding new components in the future.
