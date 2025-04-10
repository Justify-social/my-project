/**
 * @component Sidebar
 * @category organisms
 * @subcategory navigation
 * @description Main application sidebar navigation with expandable/collapsible structure
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Interface for sidebar navigation items
interface SidebarNavItemDef {
  id: string;
  label: string;
  href: string;
  iconId: string;
}

// Define navigation items specifically for the debug tools sidebar
// MOVED TO LAYOUT
// const debugNavItems: SidebarNavItemDef[] = [
//   { label: 'Atom', href: '/debug-tools/ui-components?tab=atoms', iconId: 'faAtomLight' },
//   { label: 'Molecule', href: '/debug-tools/ui-components?tab=molecules', iconId: 'faDnaLight' },
//   { label: 'Organism', href: '/debug-tools/ui-components?tab=organisms', iconId: 'faBacteriumLight' },
//   { label: 'Icons', href: '/debug-tools/ui-components?tab=icons', iconId: 'faStarLight' },
// ];

// Prop interface for the component
interface SidebarUIComponentsInternalProps {
  navItems: SidebarNavItemDef[];
}

// Component for the Debug Tools Sidebar
function SidebarUIComponentsInternal({ navItems }: SidebarUIComponentsInternalProps) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({});

  // Get current tab and category from URL
  const currentTab = searchParams.get('tab') || 'components';
  const currentCategory = searchParams.get('category');

  return (
    <aside className="w-full h-full bg-[#f5f5f5] border-r border-gray-200 flex flex-col">
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map((item) => {
          const itemKey = item.id;
          const isHovered = hoverStates[itemKey] || false;

          // Determine active state more accurately
          const itemParams = new URL(item.href, 'http://localhost').searchParams;
          const itemTab = itemParams.get('tab');
          const itemCategory = itemParams.get('category');
          let isActive = false;
          if (itemTab === 'icons' && currentTab === 'icons') {
            isActive = true;
          } else if (itemTab === 'components' && currentTab === 'components') {
            if (itemCategory && currentCategory === itemCategory) {
              isActive = true;
            } else if (!currentCategory && itemCategory === 'atom') {
              isActive = true;
            }
          }

          // Determine icon variant
          const baseIconName = item.iconId.endsWith('Light') ? item.iconId.slice(0, -5) : item.iconId;
          const iconIdToRender = (isActive || isHovered) ? `${baseIconName}Solid` : `${baseIconName}Light`;

          return (
            <Link
              key={item.id}
              href={item.href}
              onMouseEnter={() => setHoverStates(prev => ({ ...prev, [itemKey]: true }))}
              onMouseLeave={() => setHoverStates(prev => ({ ...prev, [itemKey]: false }))}
              className={cn(
                'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
                (isActive || isHovered)
                  ? 'text-[#00BFFF] bg-[#fafafa] font-medium'
                  : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
              )}
            >
              <Icon iconId={iconIdToRender} className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className={cn(
                "text-sm font-sora font-medium truncate",
                (isActive || isHovered) ? 'text-[#00BFFF]' : 'text-[#333333]'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-2 mt-auto border-t border-[#D1D5DB] space-y-0.5">
        {/* View Source Link - Apply standard styling */}
        <Link
          href="https://github.com/Justify-social/my-project"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
            // Use standard hover, no active state needed typically for external link
            'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
          )}
        >
          {/* Use consistent icon rendering - assuming brandsGithub exists */}
          <Icon iconId="brandsGithub" className="mr-3 h-5 w-5 flex-shrink-0 group-hover:text-[#00BFFF]" />
          <span className={cn(
            "text-sm font-sora font-medium truncate",
            'text-[#333333] group-hover:text-[#00BFFF]'
          )}>
            View Source
          </span>
        </Link>

        {/* Dark Mode Row - Container for the modified ThemeToggle */}
        <div
          className={cn(
            // Apply padding/margins to match other items
            // Remove internal hover effects as ThemeToggle handles them
            'flex items-center py-2 pl-4 pr-2 rounded-md w-full' // Simplified classes
          )}
        >
          {/* Render the modified ThemeToggle which now includes text */}
          <ThemeToggle />
        </div>

        {/* Back to App Link - Apply standard styling */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
            // Use standard hover, potentially check active state if needed later
            'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]'
          )}
        >
          {/* Use consistent icon rendering */}
          {/* Assume faArrowLeftLight exists, switch to Solid on hover */}
          <Icon iconId="faArrowLeftLight" className="mr-3 h-5 w-5 flex-shrink-0 group-hover:text-[#00BFFF]" />
          <span className={cn(
            "text-sm font-sora font-medium truncate",
            'text-[#333333] group-hover:text-[#00BFFF]'
          )}>
            Back to App
          </span>
        </Link>
      </div>
    </aside>
  );
}

// Ensure default export matches the import in client-layout.tsx
export default SidebarUIComponentsInternal;
