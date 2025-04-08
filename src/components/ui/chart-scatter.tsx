/**
 * @component ScatterChart
 * @category organism
 * @renderType server
 * @description A responsive scatter chart component for visualizing correlations and distributions
 * @since 2023-07-15
 * 
 * @example
 * <ScatterChart 
 *   data={[
 *     { x: 100, y: 200, z: 200, name: 'Point A' },
 *     { x: 120, y: 100, z: 260, name: 'Point B' },
 *     { x: 170, y: 300, z: 400, name: 'Point C' },
 *     { x: 140, y: 250, z: 280, name: 'Point D' },
 *     { x: 150, y: 400, z: 500, name: 'Point E' }
 *   ]} 
 *   xKey="x"
 *   yKey="y"
 *   zKey="z"
 *   nameKey="name"
 * />
 */

import React from 'react';
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label
} from 'recharts';
import { cn } from '@/lib/utils';

export interface ScatterDataPoint {
  [key: string]: string | number;
}

export interface ScatterChartProps {
  data: ScatterDataPoint[];
  xKey: string;
  yKey: string;
  zKey?: string;
  nameKey?: string;
  height?: number | string;
  width?: number | string;
  color?: string;
  title?: string;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xTickFormatter?: (value: any) => string;
  yTickFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any, name: string) => string;
  gridColor?: string;
  xDomain?: [number | string, number | string];
  yDomain?: [number | string, number | string];
  zDomain?: [number | string, number | string];
}

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  xKey,
  yKey,
  zKey,
  nameKey,
  height = 300,
  width = '100%',
  color = '#3182CE',
  title,
  className,
  showGrid = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
  xTickFormatter,
  yTickFormatter,
  tooltipFormatter,
  gridColor = '#E2E8F0',
  xDomain = ['auto', 'auto'],
  yDomain = ['auto', 'auto'],
  zDomain = [0, 1000]
}) => {
  return (
    <div className={cn('w-full font-work-sans', className)}>
      {title && (
        <h3 className="text-xl font-medium mb-2 font-sora">{title}</h3>
      )}

      <ResponsiveContainer width={width} height={height}>
        <RechartsScatterChart
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
          <XAxis 
            dataKey={xKey} 
            name={xAxisLabel || xKey} 
            type="number" 
            domain={xDomain} 
            tickFormatter={xTickFormatter}
          >
            {xAxisLabel && <Label value={xAxisLabel} position="bottom" offset={5} />}
          </XAxis>
          
          <YAxis 
            dataKey={yKey} 
            name={yAxisLabel || yKey} 
            type="number" 
            domain={yDomain} 
            tickFormatter={yTickFormatter}
          >
            {yAxisLabel && <Label value={yAxisLabel} angle={-90} position="left" offset={10} />}
          </YAxis>
          
          {zKey && <ZAxis dataKey={zKey} domain={zDomain} range={[20, 200]} />}
          
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
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
              verticalAlign="top" 
              height={36}
              iconSize={10}
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
          
          <Scatter 
            name={nameKey || "Data Points"} 
            data={data} 
            fill={color} 
            line={{ stroke: color, strokeWidth: 1 }}
          />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChart; 