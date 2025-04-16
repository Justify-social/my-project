/**
 * @component AreaChart
 * @category organism
 * @renderType server
 * @description A responsive area chart component for visualizing cumulative or quantitative data over time or categories.
 * @status 10th April
 * @since 2023-07-15
 * @param {AreaChartProps} props - The props for the AreaChart component.
 * @param {DataPoint[]} props.data - The dataset for the chart.
 * @param {string} props.xKey - The key in the data objects for the x-axis values (categories or time).
 * @param {string | string[]} props.yKey - The key(s) in the data objects for the y-axis values (numeric).
 * @param {number | string} [props.height=300] - The height of the chart container.
 * @param {number | string} [props.width='100%'] - The width of the chart container.
 * @param {Array<{stroke: string; fill: string}>} [props.colors] - Optional array of color objects (stroke and fill) for the area series.
 * @param {string} [props.title] - Optional title displayed above the chart.
 * @param {string} [props.className] - Additional CSS classes for the container div.
 * @param {boolean} [props.showGrid=true] - Whether to display the Cartesian grid.
 * @param {boolean} [props.showLegend=true] - Whether to display the legend.
 * @param {string} [props.stackId] - Optional stack ID. If provided, areas with the same ID will be stacked.
 * @param {number} [props.strokeWidth=2] - The width of the area outline stroke.
 * @param {string} [props.gridColor='#E2E8F0'] - Color of the grid lines.
 * @param {Function} [props.tickFormatter] - Custom formatter function for axis tick labels.
 * @param {Function} [props.tooltipFormatter] - Custom formatter function for the tooltip content.
 * @returns {React.ReactElement} The rendered area chart.
 *
 * @example
 * <AreaChart
 *   data={[
 *     { date: '2020-01', value: 100 },
 *     { date: '2020-02', value: 200 },
 *     { date: '2020-03', value: 150 }
 *   ]}
 *   xKey="date"
 *   yKey="value"
 * />
 */

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { cn } from '@/lib/utils';

export interface DataPoint {
  [key: string]: string | number;
}

export interface AreaChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string | string[];
  height?: number | string;
  width?: number | string;
  colors?: Array<{
    stroke: string;
    fill: string;
  }>;
  title?: string;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  stackId?: string;
  strokeWidth?: number;
  gridColor?: string;
  tickFormatter?: (value: unknown) => string;
  tooltipFormatter?: (value: unknown) => string;
}

// Use HSL theme variables for default colors
const DEFAULT_COLORS = [
  { stroke: 'hsl(var(--interactive))', fill: 'hsl(var(--interactive) / 0.2)' }, // Medium Blue
  { stroke: 'hsl(var(--accent))', fill: 'hsl(var(--accent) / 0.2)' }, // Deep Sky Blue
  { stroke: 'hsl(var(--secondary))', fill: 'hsl(var(--secondary) / 0.2)' }, // Payne's Grey
  { stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary) / 0.2)' }, // Jet
  { stroke: 'hsl(var(--success))', fill: 'hsl(var(--success) / 0.2)' }, // Example: Assuming a success color
];

// Define interface for tooltip payload entry
interface TooltipPayloadEntry {
  name?: NameType | undefined;
  value?: ValueType | undefined;
  color?: string;
  // Add other potential properties if needed
}

// Use imported types for CustomTooltip props
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border shadow-lg rounded-md p-2">
        <p className="label text-sm font-medium mb-1 text-muted-foreground">{`${label}`}</p>
        {payload.map((entry: TooltipPayloadEntry, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  xKey,
  yKey,
  height = 300,
  width = '100%',
  colors = DEFAULT_COLORS,
  title,
  className,
  showGrid = true,
  showLegend = true,
  stackId = '',
  strokeWidth = 2,
  gridColor = 'hsl(var(--border))', // Use theme border color
  tickFormatter,
}) => {
  // Handle multiple y-keys
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <div className={cn('w-full font-body', className)}>
      {title && <h3 className="text-xl font-medium mb-2 font-heading">{title}</h3>}

      <ResponsiveContainer width={width} height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}

          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickFormatter={tickFormatter} />

          <YAxis tick={{ fontSize: 12 }} tickFormatter={tickFormatter} />

          <Tooltip content={<CustomTooltip />} labelStyle={{ color: 'hsl(var(--foreground))' }} />

          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={20}
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          )}

          {yKeys.map((key, index) => {
            const colorIndex = index % colors.length;

            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                strokeWidth={strokeWidth}
                stroke={colors[colorIndex].stroke}
                fill={colors[colorIndex].fill}
                stackId={stackId || undefined}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name={key}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
