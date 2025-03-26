"use client";

import React from 'react';
import NavigationTabs from '@/components/settings/shared/NavigationTabs';

export default function SettingsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // In a real application, this would be determined by auth context
  const isSuperAdmin = true;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#333333]">Settings</h1>
        </div>
        
        {/* Settings navigation tabs */}
        <NavigationTabs isSuperAdmin={isSuperAdmin} />
        
        {/* Main content area */}
        <main className="min-h-[200px] bg-white">
          {children || <div className="p-4">No content available</div>}
        </main>
      </div>
    </div>
  );
} 