'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

export interface SankeyNode {
  id: string; // unique identifier
  name: string; // display name
  type: string; // node type, e.g., "channel", "conversion", etc.
  value: number; // node value/size
}

export interface SankeyLink {
  source: string; // source node id
  target: string; // target node id
  value: number; // link value/thickness
  conversionRate?: number; // conversion rate from source to target
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyProps {
  data: SankeyData;
  height?: number;
  width?: number;
  colorMode?: 'source' | 'target' | 'gradient';
  onNodeClick?: (nodeId: string) => void;
  onLinkClick?: (sourceId: string, targetId: string) => void;
}

// Sample data for testing the Sankey diagram
export const sampleSankeyData: SankeyData = {
  nodes: [
  { id: "social", name: "Social Media", type: "channel", value: 10000 },
  { id: "tv", name: "TV", type: "channel", value: 7500 },
  { id: "print", name: "Print", type: "channel", value: 5000 },
  { id: "paid", name: "Paid Search", type: "channel", value: 6000 },
  { id: "ooh", name: "Out-of-Home", type: "channel", value: 3000 },
  { id: "conversion", name: "Conversion", type: "conversion", value: 3500 }],

  links: [
  { source: "social", target: "conversion", value: 1800, conversionRate: 0.18 },
  { source: "tv", target: "conversion", value: 650, conversionRate: 0.09 },
  { source: "print", target: "conversion", value: 350, conversionRate: 0.07 },
  { source: "paid", target: "conversion", value: 520, conversionRate: 0.09 },
  { source: "ooh", target: "conversion", value: 180, conversionRate: 0.06 },
  { source: "social", target: "tv", value: 300 },
  { source: "tv", target: "paid", value: 250 },
  { source: "social", target: "paid", value: 800 },
  { source: "print", target: "social", value: 200 },
  { source: "ooh", target: "social", value: 150 }]
};

const SankeyDiagram: React.FC<SankeyProps> = ({
  data,
  height = 500,
  width = 800,
  colorMode = 'source',
  onNodeClick,
  onLinkClick
}) => {
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  // Transform the data to Recharts Sankey format
  const rechartsSankeyData = useMemo(() => {
    // Recharts Sankey requires nodes with name property and numeric index-based links
    const nodeMap: Record<string, number> = {};
    
    // Create formatted nodes with indices
    const nodes = data.nodes.map((node, index) => {
      nodeMap[node.id] = index; // Store index mapping
      return {
        name: node.name,
        value: node.value,
        // Store original data for reference
        _originalId: node.id,
        _type: node.type
      };
    });
    
    // Create index-based links
    const links = data.links.map(link => ({
      source: nodeMap[link.source],
      target: nodeMap[link.target],
      value: link.value,
      // Store original data
      _sourceId: link.source,
      _targetId: link.target,
      _conversionRate: link.conversionRate
    }));
    
    return { nodes, links };
  }, [data]);

  const handleNodeClick = (nodeData: any) => {
    const nodeId = nodeData._originalId;
    setHighlightedNode(highlightedNode === nodeId ? null : nodeId);
    onNodeClick?.(nodeId);
  };

  const handleLinkClick = (event: any) => {
    if (!event.points || !event.points[0] || !event.points[0].customdata) return;

    const { sourceId, targetId } = event.points[0].customdata;
    onLinkClick?.(sourceId, targetId);
  };

  return (
    <div className="sankey-container font-work-sans">
      <div className="mb-3 flex justify-between items-center font-work-sans">
        <h3 className="text-xl font-semibold text-gray-800 font-sora">Customer Journey Flow</h3>
        <div className="flex gap-2 font-work-sans">
          <button className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors font-work-sans">
            Export
          </button>
          <select className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md font-work-sans">
            <option value="source">Color by Source</option>
            <option value="target">Color by Target</option>
            <option value="gradient">Use Gradient Colors</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm font-work-sans">
        <ResponsiveContainer width="100%" height={500}>
          <Sankey
            data={rechartsSankeyData}
            nodePadding={50}
            nodeWidth={10}
            link={{ 
              stroke: '#77c878',
              strokeOpacity: 0.5,
            }}
            node={{ 
              fill: '#3182CE',
              stroke: '#eee',
              onClick: handleNodeClick
            }}
          >
            <Tooltip 
              formatter={(value: number) => [`${value.toLocaleString()} users`, 'Value']}
              labelFormatter={(name: string) => name}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
      
      {highlightedNode &&
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg font-work-sans">
          <h4 className="font-medium text-gray-800 mb-2 font-sora">
            Node Details: {data.nodes.find((n) => n.id === highlightedNode)?.name}
          </h4>
          <div className="grid grid-cols-2 gap-4 font-work-sans">
            <div className="font-work-sans">
              <h5 className="text-sm font-medium text-gray-600 font-sora">Incoming Connections</h5>
              <ul className="mt-1 space-y-1 font-work-sans">
                {data.links.
              filter((l) => l.target === highlightedNode).
              map((link, i) => {
                const sourceNode = data.nodes.find((n) => n.id === link.source);
                return (
                  <li key={i} className="text-sm font-work-sans">
                        <span className="font-medium font-work-sans">{sourceNode?.name}</span>: {link.value.toLocaleString()} users
                        {link.conversionRate && ` (${(link.conversionRate * 100).toFixed(1)}% conversion)`}
                      </li>);

              })}
              </ul>
            </div>
            <div className="font-work-sans">
              <h5 className="text-sm font-medium text-gray-600 font-sora">Outgoing Connections</h5>
              <ul className="mt-1 space-y-1 font-work-sans">
                {data.links.
              filter((l) => l.source === highlightedNode).
              map((link, i) => {
                const targetNode = data.nodes.find((n) => n.id === link.target);
                return (
                  <li key={i} className="text-sm font-work-sans">
                        <span className="font-medium font-work-sans">{targetNode?.name}</span>: {link.value.toLocaleString()} users
                        {link.conversionRate && ` (${(link.conversionRate * 100).toFixed(1)}% conversion)`}
                      </li>);

              })}
              </ul>
            </div>
          </div>
        </div>
      }
      
      <div className="mt-3 text-sm text-gray-500 font-work-sans">
        <p className="font-work-sans">The Sankey diagram visualizes user flow between marketing channels. Click on any node to see detailed information.</p>
      </div>
    </div>);
};

function getColorForNodeType(type: string): string {
  const colorMap: Record<string, string> = {
    channel: '#00BFFF', // Deep Sky Blue
    conversion: '#4CAF50', // Green
    user: '#FFA500', // Orange
    default: '#888888' // Gray
  };

  return colorMap[type] || colorMap.default;
}

function getColorForLinks(data: SankeyData, mode: 'source' | 'target' | 'gradient'): string[] {
  // Default colors for different channels
  const channelColors: Record<string, string> = {
    social: '#1E40AF', // Blue
    tv: '#7E22CE', // Purple
    print: '#C2410C', // Orange
    paid: '#047857', // Green
    ooh: '#CA8A04', // Yellow
    conversion: '#4CAF50', // Green
    default: '#AAAAAA' // Gray
  };

  return data.links.map((link) => {
    if (mode === 'source') {
      const sourceId = link.source;
      return channelColors[sourceId] || channelColors.default;
    } else if (mode === 'target') {
      const targetId = link.target;
      return channelColors[targetId] || channelColors.default;
    } else {
      // For gradient mode, just return a neutral color
      // (Plotly.js will create the gradient)
      return 'rgba(150, 150, 150, 0.5)';
    }
  });
}

function getLinkColorScale() {
  return [
  [0, '#EAEAEA'],
  [0.5, '#AADDFF'],
  [1, '#00BFFF']];

}

export default SankeyDiagram;