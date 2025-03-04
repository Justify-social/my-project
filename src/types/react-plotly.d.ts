declare module 'react-plotly.js' {
  import * as Plotly from 'plotly.js';
  import * as React from 'react';

  interface PlotParams {
    data?: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    frames?: Plotly.Frame[];
    config?: Partial<Plotly.Config>;
    onClick?: (event: Plotly.PlotMouseEvent) => void;
    onHover?: (event: Plotly.PlotMouseEvent) => void;
    onUnhover?: (event: Plotly.PlotMouseEvent) => void;
    onSelected?: (event: Plotly.PlotSelectionEvent) => void;
    onDeselect?: (event: Plotly.PlotSelectionEvent) => void;
    onRestyle?: (data: any) => void;
    onRelayout?: (data: any) => void;
    onClickAnnotation?: (event: Plotly.ClickAnnotationEvent) => void;
    onAfterExport?: () => void;
    onAfterPlot?: () => void;
    onAnimated?: () => void;
    onAnimatingFrame?: (event: { name: string; frame: Plotly.Frame; animation: any }) => void;
    onAnimationInterrupted?: () => void;
    onAutoSize?: () => void;
    onBeforeExport?: () => void;
    onButtonClicked?: (event: Plotly.ButtonClickEvent) => void;
    onEvent?: (event: React.SyntheticEvent<HTMLDivElement>) => void;
    onLegendClick?: (event: Plotly.LegendClickEvent) => boolean;
    onLegendDoubleClick?: (event: Plotly.LegendClickEvent) => boolean;
    onSliderChange?: (event: Plotly.SliderChangeEvent) => void;
    onSliderEnd?: (event: Plotly.SliderEndEvent) => void;
    onSliderStart?: (event: Plotly.SliderStartEvent) => void;
    onTransitioning?: () => void;
    onTransitionInterrupted?: () => void;
    onUpdate?: () => void;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    revision?: number;
    divId?: string;
    debug?: boolean;
    [key: string]: any;
  }

  const Plot: React.ComponentType<PlotParams>;
  export default Plot;
} 