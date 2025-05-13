/**
 * @component PieChart
 * @category organism
 * @renderType server
 * @description A responsive pie chart component for visualizing proportional data.
 * @status 10th April
 * @since 2023-07-15
 * @param {PieChartProps} props - The props for the PieChart component.
 * @param {PieDataPoint[]} props.data - The dataset for the chart. Each object requires keys matching `nameKey` and `dataKey`.
 * @param {string} props.nameKey - The key in the data objects for the name of each pie slice.
 * @param {string} props.dataKey - The key in the data objects for the numeric value of each pie slice.
 * @param {number | string} [props.height=300] - The height of the chart container.
 * @param {number | string} [props.width='100%'] - The width of the chart container.
 * @param {string[]} [props.colors] - Optional array of hex color strings for the pie slices.
 * @param {string} [props.title] - Optional title displayed above the chart.
 * @param {string} [props.className] - Additional CSS classes for the container div.
 * @param {number | string} [props.innerRadius=0] - The inner radius of the pie (for creating donut charts). Can be pixels or percentage.
 * @param {number | string} [props.outerRadius='80%'] - The outer radius of the pie. Can be pixels or percentage.
 * @param {number} [props.paddingAngle=2] - The angle padding between pie slices.
 * @param {boolean} [props.showLegend=true] - Whether to display the legend.
 * @param {Function} [props.tooltipFormatter] - Custom formatter function for the tooltip content.
 * @returns {React.ReactElement} The rendered pie chart.
 *
 * @example
 * <PieChart
 *   data={[
 *     { name: 'Group A', value: 400 },
 *     { name: 'Group B', value: 300 },
 *     { name: 'Group C', value: 300 },
 *     { name: 'Group D', value: 200 }
 *   ]}
 *   nameKey="name"
 *   dataKey="value"
 * />
 */

import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export interface PieDataPoint {
  [key: string]: string | number;
}

export interface PieChartProps {
  data: PieDataPoint[];
  nameKey: string;
  dataKey: string;
  height?: number | string;
  width?: number | string;
  colors?: string[];
  title?: string;
  className?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  paddingAngle?: number;
}

// Refined Color Palette (Example using Brand + variations)
const DEFAULT_COLORS = [
  'hsl(var(--primary))', // Jet #333333
  'hsl(var(--accent))', // Deep Sky Blue #00BFFF
  'hsl(var(--secondary))', // Payne's Grey #4A5568
  'hsl(var(--primary) / 0.7)', // Lighter Jet
  'hsl(var(--accent) / 0.7)', // Lighter Blue
  'hsl(var(--secondary) / 0.7)', // Lighter Grey
  'hsl(var(--primary) / 0.4)', // Even Lighter Jet
  'hsl(var(--accent) / 0.4)', // Even Lighter Blue
];

// Define type for renderOutsideLabel props
interface OutsideLabelProps {
  cx?: string | number | undefined;
  cy?: string | number | undefined;
  midAngle?: number;
  outerRadius?: string | number | undefined;
  percent?: number;
  name?: string;
  payload?: PieDataPoint;
  // Add other potential props if needed
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  nameKey,
  dataKey,
  height = 300,
  width = '100%',
  colors = DEFAULT_COLORS,
  title,
  className,
  innerRadius = 0,
  outerRadius = '80%',
  paddingAngle = 1,
}) => {
  // Custom label renderer for outside labels
  const renderOutsideLabel = (props: OutsideLabelProps) => {
    // Use defined type
    const { cx, cy, midAngle, outerRadius, percent, name } = props;

    // Parse and validate numeric props
    const numCx = typeof cx === 'string' ? parseFloat(cx) : cx;
    const numCy = typeof cy === 'string' ? parseFloat(cy) : cy;
    const numOuterRadius = typeof outerRadius === 'string' ? parseFloat(outerRadius) : outerRadius;

    if (
      numCx === undefined ||
      isNaN(numCx) ||
      numCy === undefined ||
      isNaN(numCy) ||
      numOuterRadius === undefined ||
      isNaN(numOuterRadius) ||
      midAngle === undefined ||
      percent === undefined
    ) {
      return null; // Don't render if essential props are invalid
    }

    const RADIAN = Math.PI / 180;
    const radius = numOuterRadius * 1.15; // Position labels further out
    const x = numCx + radius * Math.cos(-midAngle * RADIAN);
    const y = numCy + radius * Math.sin(-midAngle * RADIAN);
    const percentValue = `${(percent * 100).toFixed(0)}%`;

    // Basic check to avoid tiny labels
    if (percent < 0.03) return null;

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor={x > numCx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-[11px] font-medium"
      >
        {`${name} (${percentValue})`}
      </text>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {title && (
        (<h3 className="text-lg font-semibold text-foreground mb-4 text-center">{title}</h3>) // Centered title
      )}
      <ResponsiveContainer width={width} height={height}>
        <RechartsPieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          {' '}
          {/* More margin for labels */}
          <defs>
            {/* Add a drop shadow filter definition */}
            <filter id="pie-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="1"
                dy="2"
                stdDeviation="2"
                floodColor="hsl(var(--foreground))"
                floodOpacity="0.1"
              />
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false} // Keep label lines off for cleaner look with custom outside label
            label={renderOutsideLabel} // Use the outside label renderer
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            paddingAngle={paddingAngle}
            nameKey={nameKey}
            dataKey={dataKey}
            stroke="hsl(var(--background))" // Background color as stroke
            strokeWidth={2} // Slightly thicker stroke
            style={{ filter: 'url(#pie-shadow)' }} // Apply drop shadow
          >
            {data.map((_entry: PieDataPoint, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                style={{ outline: 'none' }} // Prevent focus outline on cells
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
