/**
 * @component FunnelChart
 * @category organism
 * @renderType server
 * @description A responsive funnel chart component for visualizing sequential data flows and conversion rates.
 * @status 10th April
 * @since 2023-07-15
 * @param {FunnelChartProps} props - The props for the FunnelChart component.
 * @param {FunnelDataPoint[]} props.data - The dataset for the chart (requires 'name' and 'value' keys).
 * @param {number | string} [props.height=400] - The height of the chart container.
 * @param {number | string} [props.width='100%'] - The width of the chart container.
 * @param {string[]} [props.colors] - Optional array of hex color strings for funnel segments.
 * @param {string} [props.title] - Optional title displayed above the chart.
 * @param {string} [props.className] - Additional CSS classes for the container div.
 * @param {boolean} [props.isAnimationActive=true] - Whether to animate the funnel segments on render.
 * @param {boolean} [props.showLabels=true] - Whether to display labels on the funnel segments.
 * @param {'inside' | 'outside' | 'center'} [props.labelPosition='inside'] - Position of the labels.
 * @param {boolean} [props.showPercentage=true] - Whether to show percentage values within the labels.
 * @param {Function} [props.tooltipFormatter] - Custom formatter function for the tooltip content.
 * @returns {React.ReactElement} The rendered funnel chart.
 *
 * @example
 * <FunnelChart
 *   data={[
 *     { name: 'Visitors', value: 5000 },
 *     { name: 'Leads', value: 3200 },
 *     { name: 'Prospects', value: 1800 },
 *     { name: 'Opportunities', value: 800 },
 *     { name: 'Customers', value: 400 }
 *   ]}
 * />
 */

import React from 'react';
import {
  FunnelChart as RechartsFunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface FunnelDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface FunnelChartProps {
  data: FunnelDataPoint[];
  height?: number | string;
  width?: number | string;
  colors?: string[];
  title?: string;
  className?: string;
  isAnimationActive?: boolean;
  showLabels?: boolean;
  labelPosition?: 'inside' | 'outside' | 'center';
  showPercentage?: boolean;
  tooltipFormatter?: (value: any, name: string, props: any) => React.ReactNode;
}

// Use brand colors or a compatible palette
const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--primary) / 0.2)',
  'hsl(var(--secondary))',
  'hsl(var(--secondary) / 0.7)',
  'hsl(var(--secondary) / 0.4)',
];

// Default Tooltip Formatter
const defaultTooltipFormatter = (value: number, name: string, props: any) => {
  const percent = props.payload?.percent;
  const percentString = percent !== undefined ? `(${(percent * 100).toFixed(0)}%)` : '';
  return [`${value.toLocaleString()} ${percentString}`, name];
};

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  height = 400,
  width = '100%',
  colors = DEFAULT_COLORS,
  title,
  className,
  isAnimationActive = true,
  showLabels = true,
  labelPosition = 'inside',
  showPercentage = true,
  tooltipFormatter = defaultTooltipFormatter, // Use default formatter
}) => {
  const renderLabelContent = (props: any) => {
    const { value, percent, x, y, width, height, name, payload } = props;
    const percentValue = (percent * 100).toFixed(0);
    const originalValue = payload?.value ?? value;

    // Use fixed light color for text inside segments for better contrast
    const textColor = 'hsl(var(--primary-foreground))'; // Assume this is white/light

    return (
      <g transform={`translate(${x + width / 2}, ${y + height / 2 + 5})`}>
        {/* Stage Name - slightly less prominent */}
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-heading"
          fontSize="11" // Reduced size
          fontWeight="normal" // Reduced weight
          fill={textColor}
          opacity={0.9}
        >
          {name}
        </text>
        {/* Main Value - prominent */}
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-body"
          fontSize="14"
          fontWeight="semibold" // Use semibold
          dy="16" // Adjusted dy
          fill={textColor}
        >
          {originalValue.toLocaleString()}
        </text>
        {/* Percentage - smaller, below value */}
        {showPercentage && (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-body"
            fontSize="10"
            fontWeight="normal"
            dy="32" // Adjusted dy
            fill={textColor}
            opacity={0.7}
          >
            {`(${percentValue}%)`}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className={cn('w-full font-body', className)}>
      {title && <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        <RechartsFunnelChart data={data}>
          <Tooltip
            formatter={tooltipFormatter} // Use the (potentially default) formatter
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--popover-foreground))',
              fontSize: '12px',
              borderRadius: 'var(--radius)',
              boxShadow: 'hsl(var(--shadow))',
            }}
            cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
          />
          <Funnel
            dataKey="value"
            data={data}
            isAnimationActive={isAnimationActive}
            nameKey="name"
            lastShapeType="rectangle"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="hsl(var(--background))"
                strokeWidth={1}
              />
            ))}
            {showLabels && (
              <LabelList
                position={labelPosition}
                content={renderLabelContent} // Use enhanced renderer
              />
            )}
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>
    </div>
  );
};
