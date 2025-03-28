'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area } from 'recharts';
import dynamic from 'next/dynamic';

// Import our Sankey diagram component (with dynamic import to avoid SSR issues)
const SankeyDiagram = dynamic(() => import('@/components/mmm/customer-journey/SankeyDiagram'), {
  ssr: false,
  loading: () =>
  <div className="bg-[var(--background-color)] rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px] border border-[var(--divider-color)] font-work-sans">
      <div className="animate-pulse flex flex-col items-center font-work-sans">
        <div className="h-8 w-64 bg-[var(--divider-color)] rounded mb-4 font-work-sans"></div>
        <div className="h-80 w-full bg-[var(--divider-color)] rounded font-work-sans"></div>
      </div>
    </div>

});

// Import sample data for Sankey diagram
import { sampleSankeyData } from '@/components/mmm/customer-journey/SankeyDiagram';

// Mock data - would come from API in production
const channelData = [
{ channel: 'Social Media', contribution: 55, spend: 125000, cpa: 12.50, roi: 4.8 },
{ channel: 'TV', contribution: 20, spend: 200000, cpa: 45.20, roi: 2.1 },
{ channel: 'Print', contribution: 10, spend: 75000, cpa: 33.75, roi: 1.8 },
{ channel: 'Paid Search', contribution: 10, spend: 60000, cpa: 15.00, roi: 3.9 },
{ channel: 'OOH', contribution: 5, spend: 50000, cpa: 50.00, roi: 1.2 }];


const timeSeriesData = [
{ date: '2023-06-01', social: 83, tv: 45, print: 28, search: 32, ooh: 15 },
{ date: '2023-07-01', social: 86, tv: 42, print: 25, search: 37, ooh: 14 },
{ date: '2023-08-01', social: 90, tv: 46, print: 24, search: 40, ooh: 13 },
{ date: '2023-09-01', social: 96, tv: 48, print: 22, search: 43, ooh: 14 },
{ date: '2023-10-01', social: 105, tv: 50, print: 20, search: 45, ooh: 16 },
{ date: '2023-11-01', social: 110, tv: 49, print: 18, search: 48, ooh: 18 }];


const benchmarkData = [
{ metric: 'ROI', value: 2.5, industryAverage: 2.0, percentDifference: 25 },
{ metric: 'Brand Recall', value: 75, industryAverage: 65, percentDifference: 15.4 },
{ metric: 'Engagement Rate', value: 5.0, industryAverage: 4.2, percentDifference: 19.0 },
{ metric: 'CPC', value: 1.50, industryAverage: 1.75, percentDifference: -14.3 }];


const recommendations = [
{
  id: 'rec-001',
  title: 'Increase Social Media spend by 10%',
  description: 'Based on current performance and diminishing returns analysis, increasing social media budget by 10% could yield significant ROI improvements.',
  impact: '+15% ROI, +12% Conversions',
  confidence: 0.87,
  priority: 'high'
},
{
  id: 'rec-002',
  title: 'Expand influencer marketing budget by 10%',
  description: 'Influencer campaigns are showing strong brand awareness lift. Increasing spend here could improve overall brand metrics.',
  impact: '+20% Brand Awareness, +15% Consideration',
  confidence: 0.82,
  priority: 'medium'
}];


// Channel synergies heat map placeholder
const SynergiesPlaceholder = () =>
<div className="bg-[var(--background-color)] rounded-lg p-6 min-h-[300px] border border-[var(--divider-color)] font-work-sans">
    <h3 className="text-xl font-semibold mb-4 text-[var(--primary-color)] font-sora">Channel Synergies</h3>
    <div className="grid grid-cols-5 gap-1 mb-4 font-work-sans">
      <div className="bg-transparent font-work-sans"></div>
      {['Social', 'TV', 'Print', 'Search', 'OOH'].map((channel) =>
    <div key={channel} className="bg-[var(--divider-color)] p-2 text-center text-sm font-medium font-work-sans">{channel}</div>
    )}
      
      {['Social', 'TV', 'Print', 'Search', 'OOH'].map((row) =>
    <React.Fragment key={`row-${row}`}>
          <div className="bg-[var(--divider-color)] p-2 text-center text-sm font-medium font-work-sans">{row}</div>
          {['Social', 'TV', 'Print', 'Search', 'OOH'].map((col) =>
      <div
        key={`${row}-${col}`}
        className={`${row === col ? 'bg-[var(--divider-color)]' : 'bg-[#e6f7ff]'} p-2 text-center text-sm ${row !== col && 'hover:bg-[var(--accent-color)] hover:bg-opacity-20 cursor-pointer'} font-work-sans`}>

              {row !== col && `+${Math.floor(Math.random() * 20)}%`}
            </div>
      )}
        </React.Fragment>
    )}
    </div>
    <p className="text-sm text-[var(--secondary-color)] font-work-sans">Values show lift percentage when channels are used together vs. alone</p>
  </div>;


// Dashboard header with filters
const DashboardHeader = () => {
  return (
    <div className="mb-8 font-work-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 font-work-sans">
        <div className="font-work-sans">
          <h1 className="text-3xl font-bold text-[var(--primary-color)] font-sora">Mixed Media Models</h1>
          <p className="text-[var(--secondary-color)] mt-1 font-work-sans">
            Analyze performance across media channels and optimize your media mix
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 font-work-sans">
          <select className="border border-[var(--divider-color)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-work-sans">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 6 months</option>
            <option>Last year</option>
            <option>Custom range</option>
          </select>
          <button className="bg-[var(--accent-color)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-work-sans">
            Export
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-work-sans">
        <div className="bg-[var(--background-color)] p-4 rounded-lg border border-[var(--divider-color)] shadow-sm font-work-sans">
          <div className="flex items-center justify-between font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-[var(--secondary-color)] font-work-sans">Total Media Spend</p>
              <p className="text-2xl font-bold font-work-sans">$510,000</p>
            </div>
            <div className="w-12 h-12 bg-[var(--accent-color)] bg-opacity-10 rounded-full flex items-center justify-center font-work-sans">
              <span className="text-[var(--accent-color)] text-xl font-work-sans">$</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--background-color)] p-4 rounded-lg border border-[var(--divider-color)] shadow-sm font-work-sans">
          <div className="flex items-center justify-between font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-[var(--secondary-color)] font-work-sans">Overall ROI</p>
              <p className="text-2xl font-bold font-work-sans">2.5x</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-work-sans">
              <span className="text-green-600 text-xl font-work-sans">↑</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--background-color)] p-4 rounded-lg border border-[var(--divider-color)] shadow-sm font-work-sans">
          <div className="flex items-center justify-between font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-[var(--secondary-color)] font-work-sans">Conversions</p>
              <p className="text-2xl font-bold font-work-sans">18,245</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-work-sans">
              <span className="text-purple-600 text-xl font-work-sans">★</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--background-color)] p-4 rounded-lg border border-[var(--divider-color)] shadow-sm font-work-sans">
          <div className="flex items-center justify-between font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-[var(--secondary-color)] font-work-sans">Avg. CPA</p>
              <p className="text-2xl font-bold font-work-sans">$27.95</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center font-work-sans">
              <span className="text-yellow-600 text-xl font-work-sans">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

// Channel contribution bar chart
const ChannelContribution = () => {
  return (
    <div className="bg-[var(--background-color)] rounded-lg p-6 border border-[var(--divider-color)] shadow-sm mb-6 font-work-sans">
      <h3 className="text-xl font-semibold mb-4 text-[var(--primary-color)] font-sora">Media Channels Overview</h3>
      <div className="h-80 font-work-sans">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={channelData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <YAxis type="category" dataKey="channel" width={90} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="contribution" name="Contribution to Conversions" fill="var(--accent-color)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 overflow-x-auto font-work-sans">
        <table className="min-w-full divide-y divide-[var(--divider-color)]">
          <thead>
            <tr>
              <th className="py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">Channel</th>
              <th className="py-3 text-right text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">Contribution</th>
              <th className="py-3 text-right text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">Spend</th>
              <th className="py-3 text-right text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">CPA</th>
              <th className="py-3 text-right text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">ROI</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--background-color)] divide-y divide-[var(--divider-color)]">
            {channelData.map((item, index) =>
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-[var(--background-color)]'}>
                <td className="py-4 text-sm font-medium text-[var(--primary-color)] font-work-sans">{item.channel}</td>
                <td className="py-4 text-sm text-right text-[var(--secondary-color)] font-work-sans">{item.contribution}%</td>
                <td className="py-4 text-sm text-right text-[var(--secondary-color)] font-work-sans">${item.spend.toLocaleString()}</td>
                <td className="py-4 text-sm text-right text-[var(--secondary-color)] font-work-sans">${item.cpa.toFixed(2)}</td>
                <td className="py-4 text-sm text-right text-[var(--secondary-color)] font-work-sans">{item.roi.toFixed(1)}x</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

};

// Performance over time chart
const PerformanceOverTime = () => {
  return (
    <div className="bg-[var(--background-color)] rounded-lg p-6 border border-[var(--divider-color)] shadow-sm mb-6 font-work-sans">
      <h3 className="text-xl font-semibold mb-4 text-[var(--primary-color)] font-sora">Performance Trends</h3>
      <div className="h-80 font-work-sans">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timeSeriesData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short' })} />
            <YAxis />
            <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
            <Legend />
            <Line type="monotone" dataKey="social" name="Social Media" stroke="var(--accent-color)" strokeWidth={2} />
            <Line type="monotone" dataKey="tv" name="TV" stroke="#7E22CE" strokeWidth={2} />
            <Line type="monotone" dataKey="print" name="Print" stroke="#C2410C" strokeWidth={2} />
            <Line type="monotone" dataKey="search" name="Paid Search" stroke="#047857" strokeWidth={2} />
            <Line type="monotone" dataKey="ooh" name="OOH" stroke="#CA8A04" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>);

};

// Industry benchmarks comparison
const BenchmarksComparison = () => {
  return (
    <div className="bg-[var(--background-color)] rounded-lg p-6 border border-[var(--divider-color)] shadow-sm mb-6 font-work-sans">
      <h3 className="text-xl font-semibold mb-4 text-[var(--primary-color)] font-sora">Industry Benchmarks</h3>
      <div className="overflow-x-auto font-work-sans">
        <table className="min-w-full divide-y divide-[var(--divider-color)]">
          <thead>
            <tr>
              <th className="py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">Metric</th>
              <th className="py-3 text-right text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">Your Value</th>
              <th className="py-3 text-right text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">Industry Avg</th>
              <th className="py-3 text-right text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">Difference</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--background-color)] divide-y divide-[var(--divider-color)]">
            {benchmarkData.map((item, index) =>
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-[var(--background-color)]'}>
                <td className="py-4 text-sm font-medium text-[var(--primary-color)] font-work-sans">{item.metric}</td>
                <td className="py-4 text-sm text-right text-[var(--primary-color)] font-work-sans">{item.value}</td>
                <td className="py-4 text-sm text-right text-[var(--secondary-color)] font-work-sans">{item.industryAverage}</td>
                <td className={`py-4 text-sm text-right font-medium ${item.percentDifference >= 0 ? 'text-green-600' : 'text-red-600'} font-work-sans`}>
                  {item.percentDifference >= 0 ? '+' : ''}{item.percentDifference.toFixed(1)}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

};

// AI recommendations component
const Recommendations = () => {
  return (
    <div className="bg-[var(--background-color)] rounded-lg p-6 border border-[var(--divider-color)] shadow-sm mb-6 font-work-sans">
      <h3 className="text-xl font-semibold mb-4 text-[var(--primary-color)] font-sora">AI-Powered Recommendations</h3>
      <div className="space-y-4 font-work-sans">
        {recommendations.map((rec) =>
        <div key={rec.id} className="border border-[var(--divider-color)] rounded-lg p-4 hover:shadow-md transition-shadow font-work-sans">
            <div className="flex items-start font-work-sans">
              <div className={`mr-4 mt-1 w-10 h-10 rounded-full flex items-center justify-center ${
            rec.priority === 'high' ? 'bg-red-100 text-red-600' :
            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
            'bg-blue-100 text-blue-600'} font-work-sans`
            }>
                <span className="text-xl font-work-sans">!</span>
              </div>
              <div className="flex-1 font-work-sans">
                <h4 className="font-semibold text-[var(--primary-color)] font-sora">{rec.title}</h4>
                <p className="text-sm text-[var(--secondary-color)] mt-1 font-work-sans">{rec.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 font-work-sans">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-work-sans">
                    Expected Impact: {rec.impact}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-work-sans">
                    Confidence: {Math.round(rec.confidence * 100)}%
                  </span>
                </div>
              </div>
              <button className="ml-2 px-3 py-1 text-sm bg-[var(--accent-color)] text-white rounded hover:bg-opacity-90 font-work-sans">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

};

// What-If Scenario Planning Tool
const ScenarioPlanning = () => {
  return (
    <div className="bg-[var(--background-color)] rounded-lg p-6 border border-[var(--divider-color)] shadow-sm mb-6 font-work-sans">
      <h3 className="text-xl font-semibold mb-4 text-[var(--primary-color)] font-sora">What-If Scenario Planning</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
        <div className="font-work-sans">
          <h4 className="font-medium text-[var(--primary-color)] mb-3 font-sora">Budget Allocation</h4>
          {channelData.map((item, index) =>
          <div key={index} className="mb-3 font-work-sans">
              <div className="flex justify-between items-center mb-1 font-work-sans">
                <label htmlFor={`channel-${index}`} className="text-sm text-[var(--secondary-color)] font-work-sans">{item.channel}</label>
                <span className="text-sm font-medium text-[var(--primary-color)] font-work-sans">${(item.spend / 1000).toFixed(1)}K</span>
              </div>
              <input
              id={`channel-${index}`}
              type="range"
              min="0"
              max={item.spend * 2}
              defaultValue={item.spend}
              step={1000}
              className="w-full h-2 bg-[var(--divider-color)] rounded-lg appearance-none cursor-pointer font-work-sans" />

            </div>
          )}
          <div className="mt-4 font-work-sans">
            <button className="w-full px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-opacity-90 font-work-sans">
              Run Simulation
            </button>
          </div>
        </div>
        
        <div className="font-work-sans">
          <h4 className="font-medium text-[var(--primary-color)] mb-3 font-sora">Projected Outcomes</h4>
          <div className="h-64 font-work-sans">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                { value: 'Current', roi: 2.5, conversions: 18245, revenue: 1275000 },
                { value: 'Projected', roi: 2.9, conversions: 21500, revenue: 1505000 }]
                }
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="value" />
                <YAxis yAxisId="left" orientation="left" stroke="var(--accent-color)" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="conversions" stroke="var(--accent-color)" fill="var(--accent-color)" fillOpacity={0.3} />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center font-work-sans">
            <div className="bg-[var(--accent-color)] bg-opacity-10 p-2 rounded font-work-sans">
              <p className="text-xs text-[var(--secondary-color)] font-work-sans">ROI Change</p>
              <p className="text-lg font-semibold text-green-600 font-work-sans">+16%</p>
            </div>
            <div className="bg-[var(--accent-color)] bg-opacity-10 p-2 rounded font-work-sans">
              <p className="text-xs text-[var(--secondary-color)] font-work-sans">Conversion Increase</p>
              <p className="text-lg font-semibold text-green-600 font-work-sans">+3,255</p>
            </div>
            <div className="bg-[var(--accent-color)] bg-opacity-10 p-2 rounded font-work-sans">
              <p className="text-xs text-[var(--secondary-color)] font-work-sans">Revenue Impact</p>
              <p className="text-lg font-semibold text-green-600 font-work-sans">+$230K</p>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default function MMM() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl font-work-sans">
      <DashboardHeader />
      
      <div className="mb-6 border-b border-[var(--divider-color)] font-work-sans">
        <nav className="-mb-px flex space-x-8 font-work-sans">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'overview' ?
            'border-[var(--accent-color)] text-[var(--accent-color)]' :
            'border-transparent text-[var(--secondary-color)] hover:text-[var(--primary-color)] hover:border-[var(--divider-color)]'} font-work-sans`
            }>

            Overview
          </button>
          <button
            onClick={() => setActiveTab('journey')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'journey' ?
            'border-[var(--accent-color)] text-[var(--accent-color)]' :
            'border-transparent text-[var(--secondary-color)] hover:text-[var(--primary-color)] hover:border-[var(--divider-color)]'} font-work-sans`
            }>

            Customer Journey
          </button>
          <button
            onClick={() => setActiveTab('synergies')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'synergies' ?
            'border-[var(--accent-color)] text-[var(--accent-color)]' :
            'border-transparent text-[var(--secondary-color)] hover:text-[var(--primary-color)] hover:border-[var(--divider-color)]'} font-work-sans`
            }>

            Channel Synergies
          </button>
          <button
            onClick={() => setActiveTab('planning')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'planning' ?
            'border-[var(--accent-color)] text-[var(--accent-color)]' :
            'border-transparent text-[var(--secondary-color)] hover:text-[var(--primary-color)] hover:border-[var(--divider-color)]'} font-work-sans`
            }>

            What-If Planning
          </button>
        </nav>
      </div>
      
      {activeTab === 'overview' &&
      <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-work-sans">
            <div className="lg:col-span-2 font-work-sans">
              <ChannelContribution />
              <PerformanceOverTime />
            </div>
            <div className="lg:col-span-1 font-work-sans">
              <BenchmarksComparison />
              <Recommendations />
            </div>
          </div>
        </>
      }
      
      {activeTab === 'journey' &&
      <div className="bg-[var(--background-color)] rounded-lg shadow-sm p-6 mb-6 font-work-sans">
          <SankeyDiagram
          data={sampleSankeyData}
          height={600}
          width={1200}
          onNodeClick={handleNodeClick} />

        </div>
      }
      
      {activeTab === 'synergies' &&
      <div className="mb-6 font-work-sans">
          <SynergiesPlaceholder />
        </div>
      }
      
      {activeTab === 'planning' &&
      <div className="mb-6 font-work-sans">
          <ScenarioPlanning />
        </div>
      }
    </div>);

}