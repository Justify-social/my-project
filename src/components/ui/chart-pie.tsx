/**
 * @component PieChart
 * @category organism
 * @renderType server
 * @description A responsive pie chart component for visualizing proportional data.
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
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
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
  showLegend?: boolean;
  tooltipFormatter?: (value: any) => string;
}

// Interface for label render props
interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

const DEFAULT_COLORS = ['#3182CE', '#00BFFF', '#4A5568', '#333333', '#38B2AC', '#F56565', '#ED8936', '#48BB78'];

const RADIAN = Math.PI / 180;

// Render custom label with percentage
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: LabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
  outerRadius = "80%",
  paddingAngle = 2,
  showLegend = true,
  tooltipFormatter
}) => {
  return (
    <div className={cn('w-full font-work-sans', className)}>
      {title && (
        <h3 className="text-xl font-medium mb-2 font-sora">{title}</h3>
      )}

      <ResponsiveContainer width={width} height={height}>
        <RechartsPieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            paddingAngle={paddingAngle}
            nameKey={nameKey}
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>

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

          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}; 