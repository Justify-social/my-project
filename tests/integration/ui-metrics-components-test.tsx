import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KpiCard, MetricsDashboard, MetricComparison } from '@/components/ui';

// Define TrendDirection type since we can't access it directly
type TrendDirection = 'up' | 'down' | 'neutral';

describe('KPI and Metrics Components Integration', () => {
  // Sample data for testing
  const kpiData = {
    title: 'Revenue',
    value: '$12,345',
    change: 12.3,
    trend: 'up' as TrendDirection,
    changeLabel: 'vs last month',
    icon: 'chart-line'
  };

  const metricsData = [
    {
      title: 'Revenue',
      value: '$52,345',
      change: 12.3,
      trend: 'up' as TrendDirection,
      changeLabel: 'vs last quarter',
      icon: 'dollar-sign'
    },
    {
      title: 'Customers',
      value: '1,234',
      change: 8.4,
      trend: 'up' as TrendDirection,
      changeLabel: 'vs last quarter',
      icon: 'users'
    },
    {
      title: 'Conversion',
      value: '3.2%',
      change: 0.5,
      trend: 'up' as TrendDirection,
      changeLabel: 'vs last quarter',
      icon: 'percent'
    },
    {
      title: 'Expenses',
      value: '$23,456',
      change: -2.8,
      trend: 'down' as TrendDirection,
      changeLabel: 'vs last quarter',
      icon: 'credit-card'
    }
  ];

  const comparisonChartData = [
    { date: 'Week 1', current: 12.5, previous: 10.2 },
    { date: 'Week 2', current: 13.1, previous: 10.8 },
    { date: 'Week 3', current: 12.8, previous: 11.2 },
    { date: 'Week 4', current: 14.2, previous: 11.5 },
  ];

  // Mock icon integration to avoid issues with FontAwesome
  jest.mock('@/components/ui/utils/icon-integration', () => ({
    getIconClasses: jest.fn().mockReturnValue('mock-icon-class'),
  }));

  // Extended the global namespace to include jest-dom matchers
  declare global {
    namespace jest {
      interface Matchers<R> {
        toBeInTheDocument(): R;
        toHaveClass(...classNames: string[]): R;
      }
    }
  }

  test('KpiCard renders with correct data', () => {
    render(<KpiCard {...kpiData} />);
    
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,345')).toBeInTheDocument();
    expect(screen.getByText(/12.3%/)).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  test('MetricsDashboard renders multiple KpiCards correctly', () => {
    render(
      <MetricsDashboard 
        title="Business Overview" 
        metrics={metricsData} 
      />
    );
    
    // Check dashboard title
    expect(screen.getByText('Business Overview')).toBeInTheDocument();
    
    // Check all metrics are rendered
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Conversion')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    
    // Check values are rendered
    expect(screen.getByText('$52,345')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('3.2%')).toBeInTheDocument();
    expect(screen.getByText('$23,456')).toBeInTheDocument();
    
    // Check trends are correctly displayed
    const positiveChanges = screen.getAllByText(/\+/);
    expect(positiveChanges.length).toBe(3); // Three positive trends
    
    const negativeChange = screen.getByText(/-2.8%/);
    expect(negativeChange).toBeInTheDocument();
  });

  test('MetricComparison integrates with comparison data', () => {
    render(
      <MetricComparison
        title="Revenue vs. Expenses"
        metric1={{
          label: 'Revenue',
          value: '$12,345',
          color: '#3182CE'
        }}
        metric2={{
          label: 'Expenses',
          value: '$8,765',
          color: '#A0AEC0'
        }}
        change={14.2}
        changeLabel="Last Month"
        chartData={comparisonChartData}
        icon="chart-line-up"
      />
    );
    
    // Check title and labels
    expect(screen.getByText('Revenue vs. Expenses')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    
    // Check values
    expect(screen.getByText('$12,345')).toBeInTheDocument();
    expect(screen.getByText('$8,765')).toBeInTheDocument();
    
    // Check change percentage
    expect(screen.getByText(/14.2%/)).toBeInTheDocument();
    expect(screen.getByText('Last Month')).toBeInTheDocument();
  });

  test('KpiCards within MetricsDashboard display consistent formatting', () => {
    render(
      <MetricsDashboard 
        title="Business Overview" 
        metrics={metricsData} 
      />
    );
    
    // Get all KPI cards within the dashboard
    const kpiValues = screen.getAllByText(/\$/); // Get all currency values
    
    // Check that currency values maintain consistent formatting
    kpiValues.forEach(value => {
      expect(value.className).toContain('text-2xl'); // Check consistent styling
    });
    
    // Check that all change labels have consistent text
    const changeLabels = screen.getAllByText('vs last quarter');
    expect(changeLabels.length).toBe(4);
    changeLabels.forEach(label => {
      expect(label).toHaveClass('text-xs', 'text-gray-500'); // Check consistent styling
    });
  });

  test('Complex dashboard with multiple metric types renders correctly', () => {
    render(
      <div data-testid="dashboard-container" className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <KpiCard {...kpiData} />
        </div>
        <div className="col-span-3">
          <MetricComparison
            title="Revenue vs. Expenses"
            metric1={{
              label: 'Revenue',
              value: '$12,345',
              color: '#3182CE'
            }}
            metric2={{
              label: 'Expenses',
              value: '$8,765',
              color: '#A0AEC0'
            }}
            change={14.2}
            changeLabel="Last Month"
            chartData={comparisonChartData}
          />
        </div>
        <div className="col-span-4">
          <MetricsDashboard 
            title="Business Overview" 
            metrics={metricsData.slice(0, 2)} 
          />
        </div>
      </div>
    );
    
    const dashboard = screen.getByTestId('dashboard-container');
    
    // Verify KpiCard renders in the dashboard
    const kpiCard = within(dashboard).getByText('Revenue');
    expect(kpiCard).toBeInTheDocument();
    
    // Verify MetricComparison renders in the dashboard
    const comparison = within(dashboard).getByText('Revenue vs. Expenses');
    expect(comparison).toBeInTheDocument();
    
    // Verify MetricsDashboard renders in the dashboard
    const metricsDashboard = within(dashboard).getByText('Business Overview');
    expect(metricsDashboard).toBeInTheDocument();
    
    // Verify dashboard contains all components
    expect(within(dashboard).getAllByText('Revenue').length).toBe(3); // 3 occurrences across components
  });
}); 