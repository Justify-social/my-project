/**
 * @component FunnelChart
 * @category organism
 * @renderType server
 * @description A responsive funnel chart component for visualizing sequential data flows and conversion rates.
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
  Cell
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

const DEFAULT_COLORS = [
  '#3182CE', '#4299E1', '#63B3ED', '#90CDF4', '#BEE3F8',
  '#00BFFF', '#4A5568', '#333333', '#38B2AC'
];

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
  tooltipFormatter
}) => {
  const renderLabelContent = (props: any) => {
    const { value, percent, x, y, width, height, name } = props;
    const percentValue = (percent * 100).toFixed(0);

    return (
      <g transform={`translate(${x + width / 2}, ${y + height / 2})`}>
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-sora"
          fontSize="14"
          fontWeight="bold"
          fill="#FFFFFF"
        >
          {name}
        </text>
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-work-sans"
          fontSize="12"
          fontWeight="normal"
          dy="20"
          fill="#FFFFFF"
        >
          {value.toLocaleString()}
        </text>
        {showPercentage && (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-work-sans"
            fontSize="10"
            fontWeight="normal"
            dy="35"
            fill="#FFFFFF"
          >
            {`${percentValue}%`}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className={cn('w-full font-work-sans', className)}>
      {title && (
        <h3 className="text-xl font-medium mb-2 font-sora">{title}</h3>
      )}

      <ResponsiveContainer width={width} height={height}>
        <RechartsFunnelChart width={500} height={300}>
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              fontSize: '12px',
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Funnel
            dataKey="value"
            data={data}
            isAnimationActive={isAnimationActive}
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
            {showLabels && (
              <LabelList
                position={labelPosition}
                content={renderLabelContent}
              />
            )}
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>
    </div>
  );
}; 