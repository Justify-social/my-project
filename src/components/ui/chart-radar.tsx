/**
 * @component RadarChart
 * @category organism
 * @renderType server
 * @description A responsive radar chart component for visualizing multivariate data
 * @since 2023-07-15
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
  ResponsiveContainer
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

const DEFAULT_COLORS = ['#3182CE', '#00BFFF', '#4A5568', '#333333', '#38B2AC'];

const RadarChart: React.FC<RadarChartProps> = ({
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
  gridColor = '#E2E8F0',
  outerRadius = "80%",
  tooltipFormatter
}) => {
  return (
    <div className={cn('w-full font-work-sans', className)}>
      {title && (
        <h3 className="text-xl font-medium mb-2 font-sora">{title}</h3>
      )}

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
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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

export default RadarChart; 