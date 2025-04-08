/**
 * @component AreaChart
 * @category organism
 * @renderType server
 * @description A responsive area chart component for visualizing cumulative data over time
 * @since 2023-07-15
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
  ResponsiveContainer
} from 'recharts';
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
  tickFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any) => string;
}

const DEFAULT_COLORS = [
  { stroke: '#3182CE', fill: 'rgba(49, 130, 206, 0.2)' },
  { stroke: '#00BFFF', fill: 'rgba(0, 191, 255, 0.2)' },
  { stroke: '#4A5568', fill: 'rgba(74, 85, 104, 0.2)' },
  { stroke: '#333333', fill: 'rgba(51, 51, 51, 0.2)' },
  { stroke: '#38B2AC', fill: 'rgba(56, 178, 172, 0.2)' }
];

const AreaChart: React.FC<AreaChartProps> = ({
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
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          )}
          
          <XAxis 
            dataKey={xKey} 
            tick={{ fontSize: 12 }}
            tickFormatter={tickFormatter}
          />
          
          <YAxis 
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

export default AreaChart; 