/**
 * @component Sidebar
 * @category organisms
 * @subcategory navigation
 * @description Main application sidebar navigation with expandable/collapsible structure
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Interface for sidebar navigation items
interface SidebarNavItemDef {
  label: string;
  href: string;
}

// Define navigation items specifically for the debug tools sidebar
const debugNavItems: SidebarNavItemDef[] = [
  { label: 'UI Components', href: '/debug-tools/ui-components' },
  { label: 'Icon Library', href: '/debug-tools/ui-components?tab=icons' },
];

// Component for the Debug Tools Sidebar
function SidebarUIComponentsInternal() {
  // Add fallback for potentially null pathname
  const pathname = usePathname() ?? '';

  return (
    <aside className="w-full h-full bg-[#f5f5f5] border-r border-gray-200 flex flex-col">
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {debugNavItems.map((item) => {
          // Determine if the current link is active
          const isActive = pathname === item.href ||
            (item.href === '/debug-tools/ui-components' && pathname.startsWith('/debug-tools/ui-components'));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
                isActive
                  ? 'text-[#00BFFF] bg-[#fafafa] font-medium'
                  : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
              )}
            >
              <span className="text-sm font-sora font-medium truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 mt-auto border-t border-[#D1D5DB] space-y-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Back to App Link */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
            'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
          )}
        >
          <Icon iconId="faArrowLeftLight" className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-sora font-medium truncate">
            Back to App
          </span>
        </Link>
      </div>
    </aside>
  );
}

// Ensure default export matches the import in client-layout.tsx
export default SidebarUIComponentsInternal;
