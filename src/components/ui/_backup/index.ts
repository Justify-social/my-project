/**
 * UI Component Library
 * 
 * This file provides convenient exports for all UI components
 * following the Shadcn UI flat structure pattern.
 */

// Re-export existing components from the flat structure
export { Button } from './button';
export type { ButtonProps } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Input } from './input';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
export { Table } from './table';
export { ThemeToggle } from './theme-toggle';

// Export button stories
export * from './button.stories';

// Visualization components - category-first naming
export { default as ChartLine } from './chart-line';
export { default as ChartBar } from './chart-bar';
export { default as ChartPie } from './chart-pie';
export { default as ChartArea } from './chart-area';
export { default as ChartRadar } from './chart-radar';
export { default as ChartScatter } from './chart-scatter';
export { default as ChartFunnel } from './chart-funnel';

// KPI and Metrics components - category-first naming
export { default as CardKpi } from './card-kpi';
export { default as MetricsDashboard } from './metrics-dashboard';
export { default as MetricsComparison } from './metrics-comparison';

// Asset card components - category-first naming
export { default as CardAsset } from './card-asset';
export { AssetCardSubmission } from './card-asset-submission';

// Typography components - category-first naming
export { default as TypographyText } from './typography-text';
export { default as TypographyHeading } from './typography-heading';

// Notification components - category-first naming
export { default as NotificationSonner } from './notification-sonner';

// Icons and Navigation components
export { Icon } from './icon/icon';
// export { default as IconContext, IconContextProvider, useIconContext } from './icon/icon-context'; // Removed export for deleted file
export { default as Sidebar } from './navigation/sidebar';
export { default as Header } from './navigation/header';
export { default as MenuMobile, MenuMobileBase } from './navigation/mobile-menu';

// Form components
export { default as SearchBar } from './search-bar';

// Client components
export * from './client/button-client';
export * from './client/card-client';

// Form and feedback components
export { Alert, AlertTitle, AlertDescription } from './alert';
export { Badge, badgeVariants } from './badge';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';

// Loading Components - category-first naming
export { LoadingSpinner } from './loading-spinner';
export { default as LoadingSkeleton, DashboardSkeleton, TableSkeleton, WizardSkeleton } from './loading-skeleton';

// Utilities
export * from './utils';
export * from './types';

// Shadcn exports for compatibility
import * as utils from './utils';
export const shadcn = { utils };
export * as shadcnUtils from './utils';
