'use client';

import React from 'react';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  AreaChart, 
  RadarChart, 
  ScatterChart,
  FunnelChart
} from '@/components/ui';

// Import KPI components
import { KpiCard, MetricsDashboard, MetricComparison } from '@/components/ui';

// Sample data for charts
const lineData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
];

const barData = [
  { name: 'Product A', value: 400 },
  { name: 'Product B', value: 300 },
  { name: 'Product C', value: 200 },
  { name: 'Product D', value: 500 },
];

const pieData = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const areaData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
];

const radarData = [
  { subject: 'Math', A: 120, B: 110, fullMark: 150 },
  { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
  { subject: 'English', A: 86, B: 130, fullMark: 150 },
  { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
  { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
  { subject: 'History', A: 65, B: 85, fullMark: 150 },
];

const scatterData = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
];

const funnelData = [
  { name: 'Visitors', value: 5000 },
  { name: 'Subscribers', value: 3000 },
  { name: 'Leads', value: 2000 },
  { name: 'Opportunities', value: 1000 },
  { name: 'Customers', value: 500 },
];

// Sample data for metric components
const kpiData = {
  title: 'Revenue',
  value: '$12,345',
  change: 12.3,
  trend: 'up' as const,
  changeLabel: 'vs last month'
};

// Sample chart data for MetricComparison
const comparisonChartData = [
  { date: 'Week 1', current: 12.5, previous: 10.2 },
  { date: 'Week 2', current: 13.1, previous: 10.8 },
  { date: 'Week 3', current: 12.8, previous: 11.2 },
  { date: 'Week 4', current: 14.2, previous: 11.5 },
];

export default function DomainComponentsExample() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-3">KPI Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Total Revenue"
            value="$54,238"
            change={12.3}
            changeLabel="vs last month"
            trend="up"
          />
          <KpiCard
            title="New Customers"
            value="1,423"
            change={-3.2}
            changeLabel="vs last month"
            trend="down"
          />
          <KpiCard
            title="Conversion Rate"
            value="4.3%"
            change={0.8}
            changeLabel="vs last month"
            trend="up"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Metrics Dashboard</h2>
        <MetricsDashboard 
          title="Performance Overview"
          metrics={[
            { title: "Revenue", value: "$54,238", change: 12.3 },
            { title: "New Customers", value: "1,423", change: -3.2 },
            { title: "Conversion Rate", value: "4.3%", change: 0.8 },
            { title: "Avg. Order Value", value: "$88.12", change: 5.1 }
          ]}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Metric Comparison</h2>
        <MetricComparison
          title="Revenue by Channel"
          metric1={{
            label: "This Month",
            value: "$54,238",
            color: "#3182CE"
          }}
          metric2={{
            label: "Last Month",
            value: "$48,293",
            color: "#A0AEC0"
          }}
          change={12.3}
          changeLabel="Month over Month"
          chartData={[
            { date: "Direct", current: 54238, previous: 48293 },
            { date: "Organic", current: 24801, previous: 21932 },
            { date: "Referral", current: 12382, previous: 15624 },
            { date: "Social", current: 9342, previous: 7234 }
          ]}
        />
      </section>
    </div>
  );
} 