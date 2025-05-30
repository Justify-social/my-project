// AUTO-GENERATED BARREL FILE - DO NOT EDIT MANUALLY
// Re-exports all components for easier importing

export * from './accordion';
export * from './alert';
export * from './alert-dialog';
export * from './aspect-ratio';
export * from './avatar';
export * from './badge';
export * from './button';
export * from './calendar';
export * from './calendar-upcoming';
export * from './card';
export * from './card-asset';
export * from './card-kpi';
export * from './carousel';
export * from './chart-area';
export * from './chart-bar';
export * from './chart-funnel';
export * from './chart-line';
export * from './chart-pie';
export * from './chart-radar';
export * from './chart-scatter';
export * from './checkbox';
export * from './collapsible';
export * from './command';
export * from './context-menu';
export * from './date-picker';
export * from './dialog';
export * from './dropdown-menu';
export * from './form';
export * from './hover-card';
export * from './input';
export * from './label';
export * from './loading-skeleton';
export * from './loading-spinner';
export * from './metrics-comparison';
export * from './metrics-dashboard';
export * from './navigation-menu';
export * from './pagination';
export * from './popover';
export * from './progress';
export * from './radio-group';
export * from './resizable';
export * from './scroll-area';
export * from './search-bar';
export * from './section-header';
export * from './select';
export * from './separator';
export * from './sheet';
export * from './skeleton';
export * from './slider';
export * from './switch';
export * from './table';
export * from './tabs';
export * from './textarea';
export * from './theme-toggle';
export * from './tooltip';
export * from './card-upcoming-campaign'; // Renamed from UpcomingCampaignsTable

// Export types from subdirectories if needed, e.g.:
// export * from "./navigation/mobile-menu";
// export * from "./icon/icon";

// Shared Chart Types
export interface DataPoint {
  [key: string]: string | number;
}
export interface LineData {
  key: string;
  color?: string;
  name?: string;
}

// Explicit Chart Exports (avoiding duplicate type exports)
export { AreaChart } from './chart-area';
export type { AreaChartProps } from './chart-area';
export { BarChart } from './chart-bar';
export type { BarChartProps } from './chart-bar';
export { FunnelChart } from './chart-funnel';
export type { FunnelChartProps } from './chart-funnel';
export { LineChart } from './chart-line';
export type { LineChartProps } from './chart-line';
export { PieChart } from './chart-pie';
export type { PieChartProps } from './chart-pie';

// Other Component Exports (ensure no conflicting names)
export * from './checkbox';
