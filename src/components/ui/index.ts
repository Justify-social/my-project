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
export { AspectRatio } from '@/components/ui/atoms/aspect-ratio/Aspect-ratio';
export { Separator } from '@/components/ui/atoms/separator/Separator';

// Form components 
export { Button } from '@/components/ui/atoms/button/Button';
export { ButtonWithIcon } from '@/components/ui/atoms/button/ButtonWithIcon';
export { IconButton } from '@/components/ui/atoms/button/IconButton';
export { Checkbox } from '@/components/ui/atoms/checkbox/Checkbox';
export { Input } from '@/components/ui/atoms/input/Input';
export { Label } from '@/components/ui/atoms/label/Label';
export { Select } from '@/components/ui/atoms/select/Select';
export { Switch } from '@/components/ui/atoms/switch/Switch';
export { Textarea } from '@/components/ui/atoms/textarea/Textarea';
export { Toggle } from '@/components/ui/atoms/toggle/Toggle';

// Interactive components
export { Accordion } from '@/components/ui/atoms/accordion/Accordion';
export { Alert } from '@/components/ui/atoms/alert/Alert';
export { Avatar } from '@/components/ui/atoms/avatar/Avatar';
export { Badge } from '@/components/ui/atoms/badge/badge';
export { Command } from '@/components/ui/atoms/command/Command';
export { Dialog } from '@/components/ui/atoms/dialog/Dialog';
export { Popover } from '@/components/ui/atoms/popover/Popover';
export { Progress } from '@/components/ui/atoms/progress/Progress';
export { Sheet } from '@/components/ui/atoms/sheet/Sheet';
export { Table } from '@/components/ui/atoms/table/Table';
export { Tabs } from '@/components/ui/atoms/tabs/Tabs';
export { Toast } from '@/components/ui/atoms/toast/Toast';
export { Tooltip } from '@/components/ui/atoms/tooltip/Tooltip';

// Navigation components
export { Menubar } from '@/components/ui/atoms/menubar/Menubar';

// Media components
export { Icon } from '@/components/ui/atoms/icon/Icon';

// Typography components
export { Heading } from '@/components/ui/atoms/typography/Heading';
export { Paragraph } from '@/components/ui/atoms/typography/Paragraph';
export { Text } from '@/components/ui/atoms/typography/Text';
export { Typography } from '@/components/ui/atoms/typography/Typography';

// Utility components
export { Collapsible } from '@/components/ui/atoms/collapsible/Collapsible';

// =========================================================================
// MOLECULE COMPONENTS - with namespacing for duplicates
// =========================================================================

// Import default exports that don't have named exports
import MoleculeAspectRatio from '@/components/ui/molecules/aspect-ratio/Aspect-ratio';
import FormFieldSkeleton from '@/components/ui/molecules/skeleton/FormFieldSkeleton';
import LoadingSkeleton from '@/components/ui/molecules/skeleton/LoadingSkeleton';
import SkeletonSection from '@/components/ui/molecules/skeleton/SkeletonSection';
import Modal from '@/components/ui/organisms/modal/Modal';
import UpcomingCampaignsCard from '@/components/ui/organisms/card/UpcomingCampaignsCard';
import { Toaster as Sonner } from '@/components/ui/molecules/sonner/Sonner';

// Re-export them
export { MoleculeAspectRatio, FormFieldSkeleton, LoadingSkeleton, SkeletonSection, Sonner };

export { Breadcrumb } from '@/components/ui/molecules/breadcrumb/Breadcrumb';
export { Carousel } from '@/components/ui/molecules/carousel/Carousel';
export { Combobox } from '@/components/ui/molecules/combobox/Combobox';
export { DataTable } from '@/components/ui/molecules/data-table/DataTable';
export { Pagination } from '@/components/ui/molecules/pagination/Pagination';
export { ScrollArea as MoleculeScrollArea } from '@/components/ui/molecules/scroll-area/ScrollArea';
export { SearchBar } from '@/components/ui/molecules/search-bar/SearchBar';
export { Skeleton } from '@/components/ui/molecules/skeleton/Skeleton';

// Import Resizable components and re-export
export { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/molecules/resizable/Resizable';

// =========================================================================
// ORGANISM COMPONENTS
// =========================================================================

export { Calendar } from '@/components/ui/organisms/calendar/Calendar';
export { CalendarDashboard } from '@/components/ui/organisms/calendar/CalendarDashboard';
export { CalendarUpcoming } from '@/components/ui/organisms/calendar/CalendarUpcoming';
export { CalendarDateRangePicker } from '@/components/ui/organisms/calendar-date-range-picker/CalendarDateRangePicker';
export { Card } from '@/components/ui/organisms/card/Card';
export { MetricCard } from '@/components/ui/organisms/card/MetricCard';
export { Modal, UpcomingCampaignsCard }; // Re-export from imports above
export { DatePicker } from '@/components/ui/organisms/date-picker/DatePicker';
export { Form } from '@/components/ui/organisms/form/Form';
export { MultiSelect } from '@/components/ui/organisms/multi-select/MultiSelect';

// =========================================================================
// SPECIAL COMPONENTS WITH COMPOSED NAMES (hyphenated file paths)
// =========================================================================

// Context Menu component and subcomponents
export { default as ContextMenu } from '@/components/ui/atoms/context-menu/Context-menu';
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
} from '@/components/ui/atoms/context-menu/Context-menu';

// Dropdown Menu component and subcomponents
export { default as DropdownMenu } from '@/components/ui/atoms/dropdown-menu/Dropdown-menu';

// Hover Card component
export { default as HoverCard } from '@/components/ui/atoms/hover-card/Hover-card';

// Icon registry and adapters
export { default as RegistryLoader } from '@/components/ui/atoms/icon/registry-loader';
export { iconRegistry } from '@/components/ui/atoms/icon/registry-loader';

// Import FontAwesomeAdapter properly (it doesn't use default export)
import * as FontAwesomeAdapterModule from '@/components/ui/atoms/icon/adapters/font-awesome-adapter';
export { FontAwesomeAdapterModule as FontAwesomeAdapter };

// Loading Spinner component
export { default as LoadingSpinner } from '@/components/ui/atoms/loading-spinner/loading-spinner';

// Navigation Menu component
export { default as NavigationMenu } from '@/components/ui/atoms/navigation-menu/Navigation-menu';

// Radio Group component
export { default as RadioGroup } from '@/components/ui/atoms/radio-group/Radio-group';

// Scroll Area components (distinguished by namespace)
export { default as AtomScrollArea } from '@/components/ui/atoms/scroll-area/Scroll-area';
export { default as MoleculeScrollAreaAlt } from '@/components/ui/molecules/scroll-area/scroll-area';

// =========================================================================
// UTILITY EXPORTS (lowercase functions, constants, etc.)
// =========================================================================

// Utilities from atoms
export { badgeVariants } from '@/components/ui/atoms/badge/badge';
export { buttonVariants } from '@/components/ui/atoms/button/Button';

// Get the accordion utility functions from default export 
import accordionModule from '@/components/ui/molecules/accordion/accordion';
export { accordionModule as accordion };

// Export slider and other components properly
export { Slider } from '@/components/ui/atoms/slider/slider';
export { ScrollArea } from '@/components/ui/molecules/scroll-area/ScrollArea';
export { Tabs as tabs } from '@/components/ui/molecules/tabs/tabs';

// Rename to avoid duplicates
export { Switch as toggleSwitch } from '@/components/ui/atoms/toggle/switch';
