/**
 * @component CategoryTabsExample
 * @description Example usage of category tab components
 */

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function CategoryTabsExample() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Category Tabs</h2>
        <p className="text-gray-500">
          Tab components for categorizing and organizing content into different sections.
        </p>
      </div>

      {/* Basic Tabs */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Basic Tabs</h3>
        <div className="border rounded-lg p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Overview Content</h4>
              <p>This is the overview tab content with general information.</p>
            </TabsContent>
            <TabsContent value="analytics" className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Analytics Content</h4>
              <p>This is the analytics tab with metrics and data visualization.</p>
            </TabsContent>
            <TabsContent value="reports" className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Reports Content</h4>
              <p>This is the reports tab with generated documents and exports.</p>
            </TabsContent>
            <TabsContent value="settings" className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Settings Content</h4>
              <p>This is the settings tab with configuration options.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Vertical Tabs */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Vertical Tabs</h3>
        <div className="border rounded-lg p-6">
          <Tabs defaultValue="personal" orientation="vertical" className="flex">
            <TabsList className="flex-shrink-0 flex-col border-r pr-2 space-y-2 w-48">
              <TabsTrigger value="personal" className="justify-start">
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="address" className="justify-start">
                Address Details
              </TabsTrigger>
              <TabsTrigger value="payment" className="justify-start">
                Payment Methods
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start">
                Notification Settings
              </TabsTrigger>
            </TabsList>
            <div className="flex-grow pl-6">
              <TabsContent value="personal" className="p-4 h-full">
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <p>Edit your name, email, and personal details here.</p>
              </TabsContent>
              <TabsContent value="address" className="p-4 h-full">
                <h4 className="font-semibold mb-2">Address Details</h4>
                <p>Manage your shipping and billing addresses.</p>
              </TabsContent>
              <TabsContent value="payment" className="p-4 h-full">
                <h4 className="font-semibold mb-2">Payment Methods</h4>
                <p>Add or remove payment methods and set defaults.</p>
              </TabsContent>
              <TabsContent value="notifications" className="p-4 h-full">
                <h4 className="font-semibold mb-2">Notification Settings</h4>
                <p>Configure your email and push notification preferences.</p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Tabs with Icons */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tabs with Icons</h3>
        <div className="border rounded-lg p-6">
          <Tabs defaultValue="dashboard">
            <TabsList>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Team
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                Projects
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="p-4 mt-2 border rounded-md">
              <h4 className="font-semibold mb-2">Dashboard</h4>
              <p>View your metrics and performance stats.</p>
            </TabsContent>
            <TabsContent value="team" className="p-4 mt-2 border rounded-md">
              <h4 className="font-semibold mb-2">Team Members</h4>
              <p>Manage your team roster and permissions.</p>
            </TabsContent>
            <TabsContent value="projects" className="p-4 mt-2 border rounded-md">
              <h4 className="font-semibold mb-2">Projects</h4>
              <p>Review ongoing and completed projects.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 