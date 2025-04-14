/**
 * @component RadarChart
 * @category organism
 * @renderType server
 * @description A responsive radar chart component for visualizing multivariate data across several categories.
 * @status 10th April
 * @since 2023-07-15
 * @param {RadarChartProps} props - The props for the RadarChart component.
 * @param {RadarDataPoint[]} props.data - The dataset for the chart. Each object should have a key matching `angleKey` and keys matching the values in `categories`.
 * @param {string[]} props.categories - An array of strings representing the different data series (radars) to plot.
 * @param {string} props.angleKey - The key in the data objects that defines the different axes (spokes) of the radar.
 * @param {number | string} [props.height=300] - The height of the chart container.
 * @param {number | string} [props.width='100%'] - The width of the chart container.
 * @param {string[]} [props.colors] - Optional array of hex color strings for the radar series.
 * @param {string} [props.title] - Optional title displayed above the chart.
 * @param {string} [props.className] - Additional CSS classes for the container div.
 * @param {boolean} [props.showLegend=true] - Whether to display the legend.
 * @param {number} [props.strokeWidth=2] - The width of the radar lines.
 * @param {number} [props.fillOpacity=0.2] - The opacity of the filled area under the radar lines.
 * @param {string} [props.gridColor='#E2E8F0'] - Color of the polar grid lines.
 * @param {number | string} [props.outerRadius='80%'] - The outer radius of the radar chart (percentage or pixel value).
 * @param {Function} [props.tooltipFormatter] - Custom formatter function for the tooltip content.
 * @returns {React.ReactElement} The rendered radar chart.
 *
 * @example
 * <RadarChart
 *   data={[
 *     { subject: 'Math', A: 120, B: 110, fullMark: 150 },
 *     { subject: 'English', A: 98, B: 130, fullMark: 150 },
 *     { subject: 'Science', A: 86, B: 130, fullMark: 150 },
 *     { subject: 'History', A: 99, B: 100, fullMark: 150 },
 *     { subject: 'Geography', A: 85, B: 90, fullMark: 150 }
 *   ]}
 *   categories={['A', 'B']}
 *   angleKey="subject"
 * />
 */

import React from 'react';
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface RadarDataPoint {
  [key: string]: string | number;
}

export interface RadarChartProps {
  data: RadarDataPoint[];
  categories: string[];
  angleKey: string;
  height?: number | string;
  width?: number | string;
  colors?: string[];
  title?: string;
  className?: string;
  showLegend?: boolean;
  strokeWidth?: number;
  fillOpacity?: number;
  gridColor?: string;
  outerRadius?: number | string;
  tooltipFormatter?: (value: any) => string;
}

// Use HSL theme variables for default colors
const DEFAULT_COLORS = [
  'hsl(var(--interactive))', // Medium Blue
  'hsl(var(--accent))', // Deep Sky Blue
  'hsl(var(--secondary))', // Payne's Grey
  'hsl(var(--primary))', // Jet
  'hsl(var(--success))', // Example: Assuming a success color
];

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  categories,
  angleKey,
  height = 300,
  width = '100%',
  colors = DEFAULT_COLORS,
  title,
  className,
  showLegend = true,
  strokeWidth = 2,
  fillOpacity = 0.2,
  gridColor = 'hsl(var(--border))', // Use theme border color
  outerRadius = '80%',
  tooltipFormatter,
}) => {
  return (
    <div className={cn('w-full font-body', className)}>
      {title && <h3 className="text-xl font-medium mb-2 font-heading">{title}</h3>}

      <ResponsiveContainer width={width} height={height}>
        <RechartsRadarChart
          data={data}
          outerRadius={outerRadius}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis dataKey={angleKey} tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={30} tick={{ fontSize: 10 }} />

          {categories.map((category, index) => (
            <Radar
              key={category}
              name={category}
              dataKey={category}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={fillOpacity}
              strokeWidth={strokeWidth}
            />
          ))}

          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              fontSize: '12px',
              backgroundColor: 'hsl(var(--background))', // Use theme background
              border: '1px solid hsl(var(--border))', // Use theme border
              borderRadius: '4px',
              boxShadow: 'var(--shadow-sm)', // Use CSS variable for shadow consistent with Tailwind's shadow-sm
            }}
          />

          {showLegend && (
            <Legend
              verticalAlign="bottom"
              align="center"
              height={36}
              iconSize={20}
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
