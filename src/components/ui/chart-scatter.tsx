/**
 * @component ScatterChart
 * @category organism
 * @renderType server
 * @description A responsive scatter chart component for visualizing correlations and distributions between two or three variables.
 * @status 10th April
 * @since 2023-07-15
 * @param {ScatterChartProps} props - The props for the ScatterChart component.
 * @param {ScatterDataPoint[]} props.data - The dataset for the chart.
 * @param {string} props.xKey - The key in the data objects for the x-axis values.
 * @param {string} props.yKey - The key in the data objects for the y-axis values.
 * @param {string} [props.zKey] - Optional key in the data objects for the z-axis values (influences point size).
 * @param {string} [props.nameKey] - Optional key in the data objects for the name of each point (used in legend/tooltip).
 * @param {number | string} [props.height=300] - The height of the chart container.
 * @param {number | string} [props.width='100%'] - The width of the chart container.
 * @param {string} [props.color='#3182CE'] - The color used for the scatter points and lines.
 * @param {string} [props.title] - Optional title displayed above the chart.
 * @param {string} [props.className] - Additional CSS classes for the container div.
 * @param {boolean} [props.showGrid=true] - Whether to display the Cartesian grid.
 * @param {boolean} [props.showLegend=true] - Whether to display the legend.
 * @param {string} [props.xAxisLabel] - Label text displayed below the x-axis.
 * @param {string} [props.yAxisLabel] - Label text displayed to the left of the y-axis.
 * @param {Function} [props.xTickFormatter] - Custom formatter function for x-axis tick labels.
 * @param {Function} [props.yTickFormatter] - Custom formatter function for y-axis tick labels.
 * @param {Function} [props.tooltipFormatter] - Custom formatter function for the tooltip content.
 * @param {string} [props.gridColor='#E2E8F0'] - Color of the grid lines.
 * @param {[number | string, number | string]} [props.xDomain=['auto', 'auto']] - Domain (min, max) for the x-axis.
 * @param {[number | string, number | string]} [props.yDomain=['auto', 'auto']] - Domain (min, max) for the y-axis.
 * @param {[number | string, number | string]} [props.zDomain=[0, 1000]] - Domain (min, max) for the z-axis (point size).
 * @returns {React.ReactElement} The rendered scatter chart.
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
  Label,
  TooltipProps,
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
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
  xTickFormatter?: (value: string | number) => string;
  yTickFormatter?: (value: string | number) => string;
  tooltipFormatter?: (value: string | number, name: string) => string;
  gridColor?: string;
  xDomain?: [number | string, number | string];
  yDomain?: [number | string, number | string];
  zDomain?: [number | string, number | string];
}

// Define type for ScatterTooltipContent payload entry
interface ScatterTooltipPayloadEntry {
  name?: NameType | undefined;
  value?: ValueType | undefined;
  color?: string;
  dataKey?: string | number | undefined;
}

// Define custom tooltip content component with proper types
const ScatterTooltipContent = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-background text-foreground p-2 shadow-md rounded-md border border-border text-xs">
        {label && <p className="label mb-1 font-medium text-muted-foreground">{`${label}`}</p>}
        {payload.map((entry: ScatterTooltipPayloadEntry, index: number) => {
          const valueString =
            entry.value === undefined || entry.value === null
              ? 'N/A'
              : typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value;

          return (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {`${entry.name} (${entry.dataKey}): ${valueString}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  xKey,
  yKey,
  zKey,
  nameKey,
  height = 300,
  width = '100%',
  color = 'hsl(var(--interactive))',
  title,
  className,
  showGrid = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
  xTickFormatter,
  yTickFormatter,
  tooltipFormatter,
  gridColor = 'hsl(var(--border))',
  xDomain = ['auto', 'auto'],
  yDomain = ['auto', 'auto'],
  zDomain = [0, 1000],
}) => {
  return (
    <div className={cn('w-full', className)}>
      {title && <h3 className="text-xl font-medium mb-2">{title}</h3>}

      <ResponsiveContainer width={width} height={height}>
        <RechartsScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
            cursor={{
              strokeDasharray: '3 3',
            }}
            formatter={tooltipFormatter}
            content={<ScatterTooltipContent />}
          ></Tooltip>

          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              iconSize={10}
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          )}

          <Scatter
            name={nameKey || 'Data Points'}
            data={data}
            fill={color}
            line={{ stroke: color, strokeWidth: 1 }}
          />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
