'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/';
import { Button } from '@/components/ui/button';

// A simplified UI component showcase
export default function DebugTools() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">UI Component Debug Tools</h1>
        <p className="text-gray-600">
          Use this page to review and test UI components in isolation.
        </p>
      </div>
      
      <div className="space-y-12">
        {/* Buttons Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="buttons">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Buttons</h2>
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-5 text-[var(--primary-color)]">Button Variants</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-start">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Primary (default)</p>
                  <Button>Primary Button</Button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Secondary</p>
                  <Button variant="secondary">Secondary Button</Button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Outline</p>
                  <Button variant="outline">Outline Button</Button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Ghost</p>
                  <Button variant="ghost">Ghost Button</Button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Link</p>
                  <Button variant="link">Link Button</Button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Danger</p>
                  <Button variant="danger">Danger Button</Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-5 text-[var(--primary-color)]">Button Sizes</h3>
              <div className="flex flex-wrap gap-6 items-end">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">XS</p>
                  <Button size="xs">Extra Small</Button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">SM</p>
                  <Button size="sm">Small</Button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">MD (default)</p>
                  <Button size="md">Medium</Button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">LG</p>
                  <Button size="lg">Large</Button>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">XL</p>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Cards Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm" id="cards">
          <h2 className="text-2xl font-bold mb-6 text-[#00BFFF] pb-2 border-b-2 border-[#D1D5DB] font-sora">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Basic Card</h3>
              </CardHeader>
              <CardContent>
                <p>This is a basic card component with header and content.</p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50">
                <h3 className="text-lg font-medium text-blue-700">Custom Styled Card</h3>
              </CardHeader>
              <CardContent>
                <p>This card has custom styling applied.</p>
              </CardContent>
            </Card>
            
            <Card className="border-gray-300">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-medium">Card with Actions</h3>
              </CardHeader>
              <CardContent>
                <p className="mb-4">This card has action buttons below the content.</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button size="sm">Save</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <p className="text-center text-gray-500">
          For access to full UI components, please check the component documentation in the codebase.
        </p>
      </div>
    </div>
  );
} 