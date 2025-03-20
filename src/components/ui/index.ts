// Import and re-export all UI components for easier imports
export * from './button';
export * from './spinner';
// Import the original icon module but don't export it directly
import * as IconModule from './icon';
// Export our enhanced icon instead
export * from './icon-fix';
// But still export the types and map objects from the original module
export { 
  type IconName, 
  type KpiIconName,
  type AppIconName,
  type PlatformIconName,
  UI_ICON_MAP,
  UI_OUTLINE_ICON_MAP,
  KPI_ICON_URLS,
  APP_ICON_URLS,
  PLATFORM_ICON_MAP,
  PLATFORM_COLORS
} from './icon';
export * from './typography';
export * from './card';
export * from './input';
export * from './toast';
export * from './container';
export * from './grid';
export * from './alert';
export * from './avatar';
export * from './badge';
export * from './calendar';
export * from './progress';
export * from './tabs';
export * from './skeleton';
export * from './colors';

// Export backward-compatibility components
export * from './loading-spinner';

// Export all UI components from a single entry point
export { Card, CardHeader, CardContent, CardFooter, MetricCard } from './card';
export { Spinner } from './spinner';
export { LoadingSpinner } from './loading-spinner';
export { ToastProvider, useToast } from './toast';
export { default as NotificationBell } from './NotificationBell';
export { Button } from './button';
export { Input } from './input';
export { colors } from './colors';
export { Icon } from './icon-fix';
export { Heading, Text, Paragraph } from './typography';
export { Avatar } from './avatar';
export { Badge, StatusBadge } from './badge';
export { Calendar } from './calendar';
export { Progress, CircularProgress } from './progress';
export { Tabs, Tab, TabList, TabPanels, TabPanel } from './tabs';
export { 
  Skeleton, 
  TextSkeleton, 
  AvatarSkeleton, 
  CardSkeleton, 
  TableRowSkeleton 
} from './skeleton';

// Wave 3: Form and Data Components
export * from './form-field';
export * from './select';
export * from './checkbox';
export * from './radio';
export * from './table';
export * from './list'; 

// Examples: exported for debug tools
export { ColorPaletteLogosExamples } from './examples'; 