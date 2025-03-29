'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Component Library',
    href: '/debug-tools/ui-components',
  },
  {
    title: 'Performance Monitor',
    href: '/debug-tools/ui-components/performance',
  },
  {
    title: 'Version Tracker',
    href: '/debug-tools/ui-components/versions',
  },
  {
    title: 'Dependency Graph',
    href: '/debug-tools/ui-components/dependencies',
  },
];

const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-sm font-medium mb-2 text-gray-600">UI Components</h3>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 text-sm rounded-md ${
              isActive 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation; 