/**
 * UI Component Library Layout
 * 
 * This layout provides the structure for the UI Component Library.
 * It includes a dynamic sidebar component and the main content area.
 */
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DynamicStyledSidebar from './components/DynamicStyledSidebar';

export default function UIComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const isUIComponentsPath = pathname === '/debug-tools/ui-components' || pathname.startsWith('/debug-tools/ui-components/');
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Use our custom sidebar for UI components pages */}
      {isUIComponentsPath && <DynamicStyledSidebar />}
      
      {/* Main content with proper margin for sidebar */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 