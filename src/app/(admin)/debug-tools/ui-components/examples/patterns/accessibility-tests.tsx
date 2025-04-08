'use client';

import React, { useState } from 'react';
import { Button, Card, Input, Select, Tabs, TabsList, TabsTrigger, ThemeToggle } from '@/components/ui';
import { KpiCard, MetricsDashboard } from '@/components/ui';

// Basic type for accessibility test result
type TestResult = {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
};

// For demonstration purposes only - in a real app, these would be actual test results
const A11yTests: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([
    {
      id: 'keyboard-nav',
      name: 'Keyboard Navigation',
      status: 'pass',
      details: 'All interactive elements are keyboard accessible'
    },
    {
      id: 'aria-labels',
      name: 'ARIA Labels',
      status: 'pass',
      details: 'All required elements have appropriate ARIA labels'
    },
    {
      id: 'color-contrast',
      name: 'Color Contrast',
      status: 'pass',
      details: 'All text meets WCAG AA contrast requirements'
    },
    {
      id: 'focus-indicators',
      name: 'Focus Indicators',
      status: 'pass',
      details: 'All focusable elements have visible focus indicators'
    },
    {
      id: 'semantic-html',
      name: 'Semantic HTML',
      status: 'pass',
      details: 'Appropriate HTML elements used for their semantic meaning'
    }
  ]);

  const [activeTab, setActiveTab] = useState<string>('test-components');
  const [country, setCountry] = useState<string>('us');

  // Sample data for KPI cards
  const metricsData = [
    {
      title: 'Revenue',
      value: '$52,345',
      change: 12.3,
      trend: 'up' as const,
      changeLabel: 'vs last quarter',
      icon: 'dollar-sign'
    },
    {
      title: 'Customers',
      value: '1,234',
      change: 8.4,
      trend: 'up' as const,
      changeLabel: 'vs last quarter',
      icon: 'users'
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Accessibility Testing</h1>
      
      <p className="mb-6 text-muted-foreground">
        This page demonstrates accessibility testing for UI components. In a real implementation, 
        automated tests would be run using tools like Axe, Pa11y, or Jest-Axe.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="test-components">Test Components</TabsTrigger>
          <TabsTrigger value="test-results">Test Results</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {activeTab === 'test-components' ? (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4 space-y-4">
                <h3 className="text-lg font-medium">Form Controls</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                    <Input id="name" placeholder="Enter your name" aria-describedby="name-desc" />
                    <p id="name-desc" className="text-xs text-muted-foreground mt-1">
                      This field has an accessible label and description
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="country-select" className="block text-sm font-medium mb-1">Country</label>
                    <select 
                      id="country-select" 
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      aria-label="Select country"
                    >
                      <option value="us">United States</option>
                      <option value="ca">Canada</option>
                      <option value="uk">United Kingdom</option>
                    </select>
                  </div>
                  
                  <div>
                    <Button>Submit Form</Button>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 space-y-4">
                <h3 className="text-lg font-medium">Theme & Layout</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Toggle Theme:</span>
                    <ThemeToggle />
                  </div>
                  
                  <div className="space-y-2">
                    <p>Tab focus order test:</p>
                    <div className="flex gap-2">
                      <Button variant="outline">Tab 1</Button>
                      <Button variant="outline">Tab 2</Button>
                      <Button variant="outline">Tab 3</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Domain Components</h2>
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Metrics Dashboard</h3>
              <MetricsDashboard
                title="Business Overview"
                metrics={metricsData}
              />
            </Card>
          </section>
        </div>
      ) : (
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-medium mb-4">Accessibility Test Results</h2>
            <div className="space-y-4">
              {results.map(result => (
                <div key={result.id} className="border rounded-md p-4">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`w-3 h-3 rounded-full ${
                        result.status === 'pass' 
                          ? 'bg-success' 
                          : result.status === 'warning' 
                            ? 'bg-warning' 
                            : 'bg-destructive'
                      }`}
                    />
                    <h3 className="font-medium">{result.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.details}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-md">
              <h3 className="font-medium mb-2">Summary</h3>
              <p className="text-sm">All components pass WCAG 2.1 AA requirements for:</p>
              <ul className="text-sm list-disc ml-5 mt-2">
                <li>Keyboard accessibility</li>
                <li>Screen reader compatibility</li>
                <li>Color contrast</li>
                <li>Focus management</li>
                <li>Form labeling</li>
              </ul>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default A11yTests; 