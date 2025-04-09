/**
 * @component BarChart
 * @category organism
 * @renderType server
 * @description A responsive bar chart component for comparing categorical data
 * @since 2023-07-15
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
  ResponsiveContainer
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
  tickFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any) => string;
}

const DEFAULT_COLORS = ['#3182CE', '#00BFFF', '#4A5568', '#333333', '#38B2AC'];

const BarChart: React.FC<BarChartProps> = ({
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
  gridColor = '#E2E8F0',
  tickFormatter,
  tooltipFormatter
}) => {
  // Handle multiple y-keys
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <div className={cn('w-full font-work-sans', className)}>
      {title && (
        <h3 className="text-xl font-medium mb-2 font-sora">{title}</h3>
      )}

      <ResponsiveContainer width={width} height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barGap={barGap}
          barSize={barSize}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          )}
          
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
              verticalAlign="bottom" 
              height={36}
              iconSize={20}
              wrapperStyle={{ fontSize: '12px' }}
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

export default BarChart; 