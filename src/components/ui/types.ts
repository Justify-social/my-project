/**
 * Common types for UI components
 */

import { VariantProps } from 'class-variance-authority';
import React from 'react';

/**
 * Asset Card component props
 */
export interface AssetCardProps {
  /** Asset data to display */
  asset: {
    /** Name of the asset */
    name: string;
    /** URL to the asset content */
    url?: string;
    /** Type of asset (image, video, etc.) */
    type?: string;
    /** Platform the asset belongs to */
    platform?: string;
    /** Handle of the influencer associated with the asset */
    influencerHandle?: string;
    /** Description of the asset */
    description?: string;
    /** Budget associated with the asset */
    budget?: number | string;
    /** Any additional properties */
    [key: string]: any;
  };
  /** Currency to display budget in (default: 'USD') */
  currency?: string;
  /** Default platform (platform won't show if it matches this) */
  defaultPlatform?: string;
  /** Additional class names */
  className?: string;
  /** Whether to show type label (image/video) */
  showTypeLabel?: boolean;
  /** Any additional props */
  [key: string]: any;
}

/**
 * Asset Preview component props
 */
export interface AssetPreviewProps {
  /** URL to the asset content */
  url?: string;
  /** Filename of the asset */
  fileName?: string;
  /** Type of asset (image, video, etc.) */
  type?: string;
  /** Whether to show type label (image/video) */
  showTypeLabel?: boolean;
  /** Additional class names */
  className?: string;
  /** Any additional props */
  [key: string]: any;
}

/**
 * Line chart configuration interface
 * Renamed from LineConfig to LineData for clarity
 */
export interface LineData {
  /** Data key for the line's y values */
  dataKey: string;
  /** Name of the line for the legend (optional) */
  name?: string;
  /** Stroke color for the line */
  stroke?: string;
}

/**
 * LineChart component props
 */
export interface LineChartProps {
  /** Data to display in the chart */
  data: Array<Record<string, any>>;
  /** The key in data for the x-axis values */
  xKey?: string;
  /** The field name for the x-axis values (new prop to replace xKey) */
  xField?: string;
  /** Array of data keys for the lines to draw (use lines prop instead) */
  yKey?: string | string[];
  /** Array of line configurations */
  lines?: LineData[];
  /** Height of the chart in pixels */
  height?: number;
  /** Whether to show the grid */
  grid?: boolean;
  /** Whether to show the legend */
  legend?: boolean;
  /** Whether to show the tooltip */
  tooltip?: boolean;
  /** Date format for x-axis if dates are used */
  dateFormat?: string;
  /** Additional class names */
  className?: string;
}

/**
 * KPI Card component props
 */
export interface KpiCardProps {
  /** Title of the KPI */
  title: string;
  /** Value to display */
  value: string | number;
  /** Change percentage */
  delta?: number;
  /** Trend direction (up, down, or neutral) */
  trend?: 'up' | 'down' | 'neutral';
  /** Description or subtitle */
  description?: string;
  /** Icon name to display */
  icon?: string;
  /** Unit/suffix to display after the value */
  suffix?: string;
  /** Prefix to display before the value (like currency symbol) */
  prefix?: string;
  /** Chart type for sparkline */
  chart?: 'line' | 'area' | 'bar';
  /** Data for the sparkline chart */
  chartData?: Array<any>;
  /** Whether to show the chart */
  showChart?: boolean;
  /** Number of decimal places for value formatting */
  decimals?: number;
  /** Whether to show a sparkline */
  sparkline?: boolean;
  /** Previous value for comparison */
  previousValue?: number | string;
  /** Change value (calculated from previous) */
  change?: number;
  /** Icon color */
  iconColor?: string;
  /** Custom formatter function */
  formatter?: (value: number | string) => string;
  /** Additional class names */
  className?: string;
}

/**
 * Metric Data item for comparison
 */
export interface MetricData {
  /** Unique identifier for the metric */
  id: string;
  /** Display name of the metric */
  name: string;
  /** Field name for x-axis (default: 'date') */
  xField?: string;
  /** Field name(s) for y-axis values */
  yField: string | string[];
  /** Data array for the chart */
  data: Array<Record<string, any>>;
  /** Date format pattern (default: 'MMM dd') */
  dateFormat?: string;
  /** Optional footnote text */
  footnote?: string;
}

/**
 * Metric Comparison props
 */
export interface MetricComparisonProps {
  /** Title of the comparison */
  title?: string;
  /** Description text */
  description?: string;
  /** Array of metrics to compare */
  metrics: MetricData[];
  /** Default selected tab ID */
  defaultTab?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Metrics Dashboard props
 */
export interface MetricsDashboardProps {
  /** Dashboard title */
  title: string;
  /** Dashboard description */
  description?: string;
  /** Array of KPI metrics to display */
  metrics: Omit<KpiCardProps, 'className'>[];
  /** Additional class names */
  className?: string;
  /** Number of columns in the grid */
  columns?: 1 | 2 | 3 | 4;
  /** Additional content to render below metrics */
  children?: React.ReactNode;
}

/**
 * Loading Skeleton props
 */
export interface LoadingSkeletonProps {
  /** The shape of the skeleton: text, circle, or rect */
  variant?: 'text' | 'circle' | 'rect' | 'card';
  /** Width of the skeleton (CSS value or number for pixels) */
  width?: string | number;
  /** Height of the skeleton (CSS value or number for pixels) */
  height?: string | number;
  /** Whether to animate the skeleton */
  animate?: boolean;
  /** Number of skeleton items to display (for multiple items) */
  count?: number;
  /** Gap between multiple items */
  gap?: string | number;
  /** Additional classes to apply */
  className?: string;
  /** Whether to stretch to fill container */
  fullWidth?: boolean;
  /** Border radius (CSS value) */
  radius?: string;
}

/**
 * Typography Text component props
 */
export interface TypographyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** The HTML tag to render the text as */
  as?: React.ElementType;
  /** Use Slot pattern to pass element through */
  asChild?: boolean;
  /** The variant style of the text */
  variant?: 'body' | 'lead' | 'small' | 'muted' | 'caption';
  /** The font weight of the text */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** The text alignment */
  align?: 'left' | 'center' | 'right';
  /** Text transform style */
  transform?: 'normal' | 'uppercase' | 'lowercase' | 'capitalize';
  /** Whether to truncate text with ellipsis */
  truncate?: boolean;
  /** Maximum number of lines to display (for multi-line ellipsis) */
  lines?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Typography Heading component props
 */
export interface TypographyHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** The level of the heading (h1-h6) */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Whether to use the Slot pattern to pass down props to child elements */
  asChild?: boolean;
  /** Custom alignment for the heading */
  align?: 'left' | 'center' | 'right';
  /** Size override - use this to visually change the size independently of semantic level */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Whether to apply tracking (letter spacing) */
  tracking?: 'normal' | 'tight' | 'wide';
  /** Whether the heading should be truncated if it overflows */
  truncate?: boolean;
  /** Additional class names */
  className?: string;
} 