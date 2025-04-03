'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { NavItem } from './components/NavItem';

export default function DebugToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold mb-2">Debug Tools</h2>
        <nav className="mt-6 space-y-1">
          <NavItem 
            href="/admin/debug-tools" 
            active={pathname === '/admin/debug-tools'}
            iconId="faHomeLight"
          >
            Dashboard
          </NavItem>
          <NavItem 
            href="/admin/debug-tools/ui-components" 
            active={pathname?.startsWith('/admin/debug-tools/ui-components')}
            iconId="faPaletteLight"
          >
            UI Components
          </NavItem>
          <NavItem 
            href="/admin/debug-tools/icon-demo" 
            active={pathname?.startsWith('/admin/debug-tools/icon-demo')}
            iconId="faIconsLight"
          >
            Icon System Demo
          </NavItem>
          <NavItem 
            href="/admin/debug-tools/database" 
            active={pathname?.startsWith('/admin/debug-tools/database')}
            iconId="faDatabaseLight"
          >
            Database
          </NavItem>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 