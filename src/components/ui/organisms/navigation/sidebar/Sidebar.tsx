'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { IconAdapter } from "@/components/ui/utils/font-awesome-adapter";

// Helper function to get icon path
const getIconPath = (icon: string, style: 'light' | 'solid' = 'light') => {
  return `/icons/${style}/${icon}.svg`;
};

// Define sidebar item types
export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}

// Define sidebar props
export interface SidebarProps {
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
  width?: string;
  onItemClick?: (item: SidebarItem) => void;
}

/**
 * Sidebar component that uses direct SVG imports
 * Instead of using the Icon component, it loads SVGs directly from the public directory
 */
export function Sidebar({
  items,
  header,
  footer,
  isMobileOpen = false,
  onMobileClose,
  className,
  width = '240px',
  onItemClick
}: SidebarProps) {
  // Track which sections are expanded in the sidebar
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // For tracking hovered items
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredChild, setHoveredChild] = useState<string | null>(null);

  // Toggle a section's expanded state
  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to check if an item is active based on various conditions
  const isItemActive = (item: SidebarItem) => {
    // If the item has its own isActive property, use that
    if (typeof item.isActive === 'boolean') {
      return item.isActive;
    }
    
    // If section is expanded, consider it active
    if (expandedSections[item.id]) {
      return true;
    }
    
    // If any children are active, the parent should be considered active
    if (item.children?.some(child => isItemActive(child))) {
      return true;
    }
    
    return false;
  };

  // Helper to determine if children should be expanded
  const shouldShowChildren = (item: SidebarItem) => {
    const isExpanded = expandedSections[item.id];
    const active = isItemActive(item);
    
    // Only show children if the section is expanded or the item is active
    return (isExpanded || active) && item.children && item.children.length > 0;
  };

  // Render a single navigation item
  const renderItem = (item: SidebarItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.id];
    const active = isItemActive(item);
    const showChildren = shouldShowChildren(item);
    const isHovered = hoveredItem === item.id;
    
    return (
      <li key={item.id} className="w-full">
        <Link
          href={hasChildren ? '#' : item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleSection(item.id);
            }
            
            if (onItemClick) {
              onItemClick(item);
            }
          }}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={cn(
            'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
            active ? 'text-[#00BFFF] font-medium' : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]',
            item.isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
        >
          {item.icon && (
            <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0 relative">
              <Image 
                src={getIconPath(item.icon, (active || isHovered) ? 'solid' : 'light')}
                alt={`${item.label} icon`}
                width={20}
                height={20}
                className="w-5 h-5"
                style={{ 
                  filter: (active || isHovered) ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 'none',
                  transition: 'filter 0.15s ease-in-out'
                }}
                unoptimized
              />
            </div>
          )}
          <span className={`flex-grow text-base font-sora font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis ${(active || isHovered) ? 'text-[#00BFFF]' : 'text-[#333333]'}`}>
            {item.label}
          </span>
          {item.badge && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 ml-2 text-xs font-medium rounded-full bg-[#00BFFF]/20 text-[#00BFFF]">
              {item.badge}
            </span>
          )}
        </Link>
        
        {hasChildren && (
          <div className={`overflow-hidden transition-all duration-200 ${showChildren ? 'max-h-96' : 'max-h-0'}`}>
            <ul className="pl-10 mt-0.5 space-y-0">
              {item.children?.map(child => {
                const childActive = child.isActive;
                const childHovered = hoveredChild === child.id;
                
                return (
                  <li key={child.id} className="w-full">
                    <Link
                      href={child.href}
                      onClick={() => {
                        if (onItemClick) {
                          onItemClick(child);
                        }
                      }}
                      onMouseEnter={() => setHoveredChild(child.id)}
                      onMouseLeave={() => setHoveredChild(null)}
                      className={cn(
                        'flex items-center py-1.5 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
                        childActive 
                          ? 'text-[#00BFFF] bg-[#fafafa] font-medium' 
                          : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]',
                        child.isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                      )}
                    >
                      {child.icon && (
                        <div className="w-5 h-5 mr-2 flex items-center justify-center flex-shrink-0">
                          <Image 
                            src={getIconPath(child.icon, (childActive || childHovered) ? 'solid' : 'light')}
                            alt={`${child.label} icon`}
                            width={16}
                            height={16}
                            className="w-4 h-4"
                            style={{ 
                              filter: (childActive || childHovered) ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 'none',
                              transition: 'filter 0.15s ease-in-out'
                            }}
                            unoptimized
                          />
                        </div>
                      )}
                      <span className={`flex-grow text-xs font-sora font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis ${(childActive || childHovered) ? 'text-[#00BFFF]' : 'text-[#333333]'}`}>
                        {child.label}
                      </span>
                      {child.badge && (
                        <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 ml-2 text-xs font-medium rounded-full bg-[#00BFFF]/20 text-[#00BFFF]">
                          {child.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
    
      {/* Sidebar - fixed width, no collapse */}
      <aside
        className={cn(
          'fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 flex flex-col bg-[#f5f5f5] transition-all',
          'md:translate-x-0',
          'lg:w-[--width]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
        style={{
          '--width': width
        } as React.CSSProperties}
      >
        {/* Header */}
        {header && (
          <div className="flex items-center h-14 px-3 border-b border-[#D1D5DB]">
            {header}
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="list-none space-y-0.5">
            {items.map(item => renderItem(item))}
          </ul>
        </nav>
        
        {/* Footer */}
        {footer && (
          <div className="px-2 py-2 border-t border-gray-300">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar; 