/**
 * @component BarChart
 * @category organism
 * @renderType server
 * @description A responsive bar chart component for comparing categorical data, supporting horizontal and vertical layouts.
 * @status 10th April
 * @since 2023-07-15
 * @param {BarChartProps} props - The props for the BarChart component.
 * @param {DataPoint[]} props.data - The dataset for the chart.
 * @param {string} props.xKey - The key in the data objects for the category axis (horizontal layout) or value axis (vertical layout).
 * @param {string | string[]} props.yKey - The key(s) in the data objects for the value axis (horizontal layout) or category axis (vertical layout).
 * @param {number | string} [props.height=300] - The height of the chart container.
 * @param {number | string} [props.width='100%'] - The width of the chart container.
 * @param {string[]} [props.colors] - Optional array of hex color strings for the bars.
 * @param {string} [props.title] - Optional title displayed above the chart.
 * @param {string} [props.className] - Additional CSS classes for the container div.
 * @param {'vertical' | 'horizontal'} [props.layout='horizontal'] - The layout orientation of the chart.
 * @param {boolean} [props.showGrid=true] - Whether to display the Cartesian grid.
 * @param {boolean} [props.showLegend=true] - Whether to display the legend.
 * @param {number} [props.barSize=20] - The width or height of the bars.
 * @param {number} [props.barGap=4] - The gap between bars of the same category (for grouped charts).
 * @param {string} [props.gridColor='#E2E8F0'] - Color of the grid lines.
 * @param {Function} [props.tickFormatter] - Custom formatter function for axis tick labels.
 * @param {Function} [props.tooltipFormatter] - Custom formatter function for the tooltip content.
 * @returns {React.ReactElement} The rendered bar chart.
 *
 * @example
 * <BarChart
 *   data={[
 *     { category: 'A', value: 100 },
 *     { category: 'B', value: 200 },
 *     { category: 'C', value: 150 }
 *   ]}
 *   xKey="category"
 *   yKey="value"
 * />
 */

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface DataPoint {
  [key: string]: string | number;
}

export interface BarChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string | string[];
  height?: number | string;
  width?: number | string;
  colors?: string[];
  title?: string;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  showGrid?: boolean;
  showLegend?: boolean;
  barSize?: number;
  barGap?: number;
  gridColor?: string;
  tickFormatter?: (value: string | number) => string;
  tooltipFormatter?: (value: string | number) => string;
}

// Use HSL theme variables for default colors
const DEFAULT_COLORS = [
  'hsl(var(--accent))', // Deep Sky Blue
  'hsl(var(--interactive))', // Medium Blue
  'hsl(var(--primary))', // Jet
  'hsl(var(--secondary))', // Payne's Grey
  'hsl(var(--success))', // Example: Assuming a success color variable exists
];

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  height = 300,
  width = '100%',
  colors = DEFAULT_COLORS,
  title,
  className,
  layout = 'horizontal',
  showGrid = true,
  showLegend = true,
  barSize = 20,
  barGap = 4,
  gridColor = 'hsl(var(--border))', // Use theme border color
  tickFormatter,
  tooltipFormatter,
}) => {
  // Handle multiple y-keys
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <div className={cn('w-full', className)}>
      {title && <h3 className="text-xl font-medium mb-2">{title}</h3>}

      <ResponsiveContainer width={width} height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barGap={barGap}
          barSize={barSize}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}

          <XAxis
            dataKey={layout === 'horizontal' ? xKey : undefined}
            type={layout === 'horizontal' ? 'category' : 'number'}
            tick={{ fontSize: 12 }}
            tickFormatter={tickFormatter}
          />

          <YAxis
            dataKey={layout === 'vertical' ? xKey : undefined}
            type={layout === 'vertical' ? 'category' : 'number'}
            tick={{ fontSize: 12 }}
            tickFormatter={tickFormatter}
          />

          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{}}
            wrapperStyle={{
              backgroundColor: 'bg-background',
              color: 'text-foreground',
              borderRadius: 'rounded-md',
              boxShadow: 'shadow-md',
              padding: 'p-2',
              fontSize: 'text-xs',
            }}
          />

          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={20}
              wrapperStyle={{ fontSize: 'text-xs', paddingTop: 'pt-2' }}
            />
          )}

          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              name={key}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
