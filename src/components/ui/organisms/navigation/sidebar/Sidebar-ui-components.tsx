'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/string/utils';
import Link from 'next/link';
import { Icon } from '@/components/ui/atoms/icons';

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
 * Sidebar component specifically for UI Components page
 * Uses Font Awesome icons directly via the Icon component
 */
export function UiComponentsSidebar({
  items,
  header,
  footer,
  isMobileOpen = false,
  onMobileClose,
  className,
  width = '240px',
  onItemClick
}: SidebarProps) {
  // Function to get initially expanded sections based on URL
  const getInitialExpandedSections = () => {
    if (typeof window === 'undefined') return {};

    // Get hash from URL (e.g., #atoms)
    const hash = window.location.hash;
    if (!hash) return {};

    // Initialize with the section from hash expanded
    const initialExpanded: Record<string, boolean> = {};
    
    // Remove # from hash to get section id
    const sectionId = hash.substring(1).split('-')[0]; // Handle both #atoms and #atoms-button
    if (sectionId) {
      initialExpanded[sectionId] = true;
    }
    
    return initialExpanded;
  };

  // Track which sections are expanded in the sidebar with initial value
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    getInitialExpandedSections()
  );
  
  // Track which item is currently selected
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    typeof window !== 'undefined' && window.location.hash ? 
      window.location.hash.substring(1).split('-')[0] : 
      null
  );
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Toggle a section's expanded state
  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to check if an item is active based on various conditions
  const isItemActive = (item: SidebarItem) => {
    // Selected by user click
    if (item.id === selectedItemId) {
      return true;
    }
    
    // If section is expanded, consider it active
    if (expandedSections[item.id]) {
      return true;
    }
    
    // If the item has its own isActive property, use that
    if (typeof item.isActive === 'boolean') {
      return item.isActive;
    }
    
    // If any children are active, the parent should be considered active
    if (item.children?.some(child => isItemActive(child) || child.id === selectedChildId)) {
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

  // Child item component to manage its own hover state
  const ChildItem = ({ child, onItemClick }: { child: SidebarItem, onItemClick?: (item: SidebarItem) => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isActive = child.isActive || child.id === selectedChildId;
    
    return (
      <li className="w-full">
        <Link
          href={child.href}
          onClick={() => {
            // Set this as the selected child item
            setSelectedChildId(child.id);
            setSelectedItemId(null);
            
            if (onItemClick) {
              onItemClick(child);
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'flex items-center py-1.5 pl-4 pr-2 rounded-md transition-colors w-full group',
            isActive
              ? 'text-[#00BFFF] bg-[#fafafa] font-medium' 
              : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]',
            child.isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
        >
          {child.icon && (
            <div className="w-5 h-5 mr-2 flex items-center justify-center flex-shrink-0">
              {renderIcon(child.icon, isActive, isHovered)}
            </div>
          )}
          <span className={`flex-grow text-xs font-sora font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis ${(isActive || isHovered) ? 'text-[#00BFFF]' : 'text-[#333333]'}`}>
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
  };

  // Function to determine the correct variant based on icon name and state
  const getIconVariant = (iconName: string | undefined, isActive: boolean, isHovered: boolean): 'solid' | 'light' | 'brand' => {
    if (!iconName) return 'light';
    if (iconName === 'faGithub') {
      return 'brand';
    }
    return (isActive || isHovered) ? 'solid' : 'light';
  };

  const renderIcon = (name: string | undefined, isActive: boolean, isHovered: boolean) => {
    if (!name) return null;
    
    // Special handling for brand icons
    if (name === 'faGithub') {
      return (
        <Icon 
          name={name}
          className={(isActive || isHovered) ? "text-[#00BFFF]" : "text-[#333333]"}
          variant="brand"
          style={{ transition: 'color 0.15s ease-in-out' }}
        />
      );
    }
    
    // For regular icons, use CSS filter approach matching Sidebar.tsx
    return (
      <Icon 
        name={name}
        variant={(isActive || isHovered) ? "solid" : "light"}
        className="w-5 h-5"
        style={{ 
          filter: (isActive || isHovered) ? 
            'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 
            'none',
          transition: 'filter 0.15s ease-in-out'
        }}
      />
    );
  };

  // Render a single navigation item
  const renderItem = (item: SidebarItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.id];
    const active = isItemActive(item);
    const showChildren = shouldShowChildren(item);
    
    // Handle hover state for icons
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <li key={item.id} className="w-full">
        <Link
          href={hasChildren ? '#' : item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleSection(item.id);
              // Also set this as selected when toggling
              setSelectedItemId(item.id);
              
              // Update URL hash without scroll
              if (window && window.history) {
                window.history.replaceState(null, '', `#${item.id}`);
              }
            } else {
              // Set this as the selected item
              setSelectedItemId(item.id);
              setSelectedChildId(null);
              
              // Let the link handle the hash update
            }
            
            if (onItemClick) {
              onItemClick(item);
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'flex items-center py-2 pl-4 pr-2 rounded-md transition-colors w-full group',
            active ? 'text-[#00BFFF] font-medium' : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]',
            item.isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
        >
          {item.icon && (
            <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0 relative">
              {renderIcon(item.icon, active, isHovered)}
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
              {item.children?.map(child => (
                <ChildItem key={child.id} child={child} onItemClick={onItemClick} />
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  // Effect to handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) return;
      
      const sectionId = hash.substring(1).split('-')[0];
      if (sectionId) {
        // Expand the section
        setExpandedSections(prev => ({
          ...prev,
          [sectionId]: true
        }));
        
        // Set the section as selected
        setSelectedItemId(sectionId);
      }
    };
    
    // Set initial state on mount
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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

export default UiComponentsSidebar; 