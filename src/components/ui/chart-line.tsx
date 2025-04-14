/**
 * @component LineChart
 * @category organism
 * @subcategory visualization
 * @description Responsive line chart component based on Recharts with support for multiple data series.
 * @status 10th April
 * @info date formatting on the X-axis and provides customizable tooltips and legends.
 * @param {LineChartProps} props - The props for the LineChart component.
 * @param {object[]} [props.data=[]] - The dataset for the chart.
 * @param {string} [props.xField] - The key for the x-axis data (usually time). Overrides xKey.
 * @param {LineData[]} [props.lines=[]] - Configuration array for data lines (dataKey, name, stroke).
 * @param {number} [props.height=300] - The height of the chart container.
 * @param {boolean} [props.grid=true] - Whether to display the Cartesian grid.
 * @param {boolean} [props.legend=true] - Whether to display the legend.
 * @param {boolean} [props.tooltip=true] - Whether to display the tooltip on hover.
 * @param {string} [props.dateFormat='MMM d'] - The date format string (using date-fns format tokens) for the x-axis and tooltip.
 * @param {string} [props.className] - Additional CSS classes to apply to the container div.
 * @returns {React.ReactElement | null} The rendered line chart or null if no data is provided.
 */
'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

// Define types directly in the file as a workaround
export interface LineData {
  dataKey: string;
  name?: string;
  stroke?: string;
}

export interface LineChartProps {
  data?: object[];
  xField?: string;
  lines?: LineData[];
  height?: number | string;
  grid?: boolean;
  legend?: boolean;
  tooltip?: boolean;
  dateFormat?: string;
  className?: string;
}

/**
 * Custom tooltip formatter for date values
 */
const formatDate = (dateStr: string, dateFormat = 'MMM d'): string => {
  try {
    const date = parseISO(dateStr);
    if (isValid(date)) {
      return format(date, dateFormat);
    }
  } catch (e) {
    // If not a valid date string, return as is
  }
  return dateStr;
};

/**
 * LineChart component for visualizing trends over time
 */
export function LineChart({
  data = [],
  xField, // Support both naming conventions
  lines = [],
  height = 300,
  grid = true,
  legend = true,
  tooltip = true,
  dateFormat = 'MMM d',
  className,
}: LineChartProps) {
  if (!data?.length) {
    return null;
  }

  // Define the key for the x-axis
  const xAxisKey = xField || 'date'; // Default to 'date' if xField is not provided

  // Use the lines prop directly
  const linesConfig: LineData[] = lines;

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          {/* X-Axis with date formatting */}
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={dateStr => formatDate(dateStr, dateFormat)}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />

          {/* Y-Axis */}
          <YAxis
            width={35}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />

          {/* Grid lines */}
          {grid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}

          {/* Tooltip */}
          {tooltip && (
            <Tooltip
              formatter={(value: number) => [`${value}`, '']}
              labelFormatter={dateStr => formatDate(dateStr as string, dateFormat)}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                padding: '0.5rem',
                fontSize: '12px',
              }}
            />
          )}

          {/* Legend */}
          {legend && <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />}

          {/* Zero reference line */}
          <ReferenceLine y={0} stroke="hsl(var(--border))" />

          {/* Data lines */}
          {linesConfig.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.stroke || getColorByIndex(index)}
              activeDot={{ r: 6 }}
              dot={{ r: 3 }}
              strokeWidth={2}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Get a color from our palette based on index
 */
function getColorByIndex(index: number): string {
  const colors = [
    'hsl(var(--interactive))',
    'hsl(var(--destructive))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--accent))',
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--info))',
  ];

  return colors[index % colors.length];
}
