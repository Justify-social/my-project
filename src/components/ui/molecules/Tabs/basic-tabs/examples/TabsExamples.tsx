// Updated import paths via tree-shake script - 2025-04-01T17:13:32.203Z
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '../';
import { Icon } from '@/components/ui/atoms/icon';
import { Card, CardContent } from '@/components/ui/organisms/card/Card';

/**
 * Examples of Tabs component usage
 * 
 * This file provides comprehensive examples of all Tabs components
 * with various configurations and use cases
 */
export const TabsExamples = () => {
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('overview');
  
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold mb-4">Basic Tabs (Underline variant)</h2>
        <Tabs defaultTab="tab1" className="w-full max-w-2xl">
          <TabsList>
            <TabsTrigger value="tab1">Account</TabsTrigger>
            <TabsTrigger value="tab2">Password</TabsTrigger>
            <TabsTrigger value="tab3">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div className="p-4 rounded border mt-4">
              <h3 className="font-medium text-lg mb-2">Account Information</h3>
              <p className="text-[#4A5568]">
                Manage your account settings and preferences. You can update your profile,
                contact information, and notification preferences here.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="tab2">
            <div className="p-4 rounded border mt-4">
              <h3 className="font-medium text-lg mb-2">Password Management</h3>
              <p className="text-[#4A5568]">
                Update your password, enable two-factor authentication, and manage security
                settings to keep your account secure.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="tab3">
            <div className="p-4 rounded border mt-4">
              <h3 className="font-medium text-lg mb-2">Application Settings</h3>
              <p className="text-[#4A5568]">
                Configure application behavior, themes, and global preferences to customize
                your experience.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Pills Variant</h2>
        <Tabs defaultTab="usage" variant="pills" className="w-full max-w-2xl">
          <TabsList className="bg-gray-100 p-1 rounded-md">
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          <TabsContent value="usage">
            <div className="p-4 rounded-md bg-gray-50 mt-4">
              <h3 className="font-medium text-lg mb-2">How to Use</h3>
              <p className="text-gray-600">
                Getting started is easy! Just sign up for an account, configure your preferences,
                and start using our powerful analytics tools immediately.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="features">
            <div className="p-4 rounded-md bg-gray-50 mt-4">
              <h3 className="font-medium text-lg mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Real-time analytics and reporting</li>
                <li>Advanced data visualization</li>
                <li>Custom dashboards and widgets</li>
                <li>AI-powered insights and recommendations</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="pricing">
            <div className="p-4 rounded-md bg-gray-50 mt-4">
              <h3 className="font-medium text-lg mb-2">Pricing Plans</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Basic:</strong> $9/month - Essential features for individuals</p>
                <p><strong>Pro:</strong> $29/month - Advanced features for professionals</p>
                <p><strong>Enterprise:</strong> Custom pricing - Full suite for organizations</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="faq">
            <div className="p-4 rounded-md bg-gray-50 mt-4">
              <h3 className="font-medium text-lg mb-2">Frequently Asked Questions</h3>
              <div className="space-y-3 text-gray-600">
                <div>
                  <p className="font-medium">How secure is my data?</p>
                  <p>We use industry-standard encryption and security practices to protect your data.</p>
                </div>
                <div>
                  <p className="font-medium">Can I cancel my subscription?</p>
                  <p>Yes, you can cancel your subscription at any time without penalties.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Enclosed Variant</h2>
        <Tabs defaultTab="overview" variant="enclosed" className="w-full max-w-2xl">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardContent>
                <h3 className="font-medium text-lg mb-2">Project Overview</h3>
                <p className="text-[#4A5568]">
                  This is the main dashboard view that provides a comprehensive overview
                  of your project. View key metrics, recent activities, and upcoming tasks.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardContent>
                <h3 className="font-medium text-lg mb-2">Performance Analytics</h3>
                <p className="text-[#4A5568]">
                  Dive deep into performance metrics and analyze trends over time.
                  Export data, create custom reports, and share insights with your team.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
            <Card>
              <CardContent>
                <h3 className="font-medium text-lg mb-2">Generated Reports</h3>
                <p className="text-[#4A5568]">
                  View and manage all your generated reports. Schedule automated reports,
                  customize templates, and deliver insights to stakeholders.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Button Variant with Icons</h2>
        <Tabs 
          defaultTab="day" 
          variant="button" 
          className="w-full max-w-2xl"
          onChange={setActiveAnalyticsTab}
        >
          <TabsList className="flex space-x-2 mb-6">
            <TabsTrigger value="overview" className="flex items-center">
              <Icon name="chart-pie" type="static" className="mr-2 h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="day" className="flex items-center">
              <Icon name="calendar-day" type="static" className="mr-2 h-4 w-4" />
              <span>Daily</span>
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center">
              <Icon name="calendar-week" type="static" className="mr-2 h-4 w-4" />
              <span>Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center">
              <Icon name="calendar" type="static" className="mr-2 h-4 w-4" />
              <span>Monthly</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Analytics: {activeAnalyticsTab.charAt(0).toUpperCase() + activeAnalyticsTab.slice(1)} View</h3>
              <div className="text-sm text-gray-500">Last Updated: Today, 2:30 PM</div>
            </div>
            
            <TabsContent value="overview">
              <p className="text-[#4A5568] mb-4">
                Comprehensive view of all analytics across different time periods.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Total Views</div>
                  <div className="text-2xl font-semibold">425,789</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Conversion Rate</div>
                  <div className="text-2xl font-semibold">3.2%</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Avg. Session</div>
                  <div className="text-2xl font-semibold">2m 45s</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="day">
              <p className="text-[#4A5568] mb-4">
                Detailed analytics for the current day with hourly breakdowns.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Today's Views</div>
                  <div className="text-2xl font-semibold">12,453</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Peak Hour</div>
                  <div className="text-2xl font-semibold">11:00 AM</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">New Users</div>
                  <div className="text-2xl font-semibold">347</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="week">
              <p className="text-[#4A5568] mb-4">
                Weekly trends showing day-by-day performance metrics.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">This Week</div>
                  <div className="text-2xl font-semibold">85,241</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Best Day</div>
                  <div className="text-2xl font-semibold">Tuesday</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Week-over-Week</div>
                  <div className="text-2xl font-semibold text-green-600">+5.2%</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="month">
              <p className="text-[#4A5568] mb-4">
                Monthly performance overview with comparison to previous periods.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">This Month</div>
                  <div className="text-2xl font-semibold">342,879</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Monthly Growth</div>
                  <div className="text-2xl font-semibold text-green-600">+12%</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Total Users</div>
                  <div className="text-2xl font-semibold">24,587</div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>
    </div>
  );
};

export default TabsExamples; 