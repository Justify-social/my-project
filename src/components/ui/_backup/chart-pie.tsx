/**
 * @component PieChart
 * @category organism
 * @renderType server
 * @description A responsive pie chart component for visualizing proportional data
 * @since 2023-07-15
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

const PieChart: React.FC<PieChartProps> = ({
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

export default PieChart; 