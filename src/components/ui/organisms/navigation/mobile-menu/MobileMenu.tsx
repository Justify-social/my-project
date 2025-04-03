import { Icon } from '@/components/ui/atoms/icon';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { UserProfile } from '@auth0/nextjs-auth0/client';
import { IconAdapter } from "@/components/ui/utils/font-awesome-adapter";
import Image from 'next/image';

// Define sidebar item types
interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface BaseMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onItemClick?: (item: SidebarItem) => void;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  settingsNavItem: NavItem;
  remainingCredits: number;
  notificationsCount: number;
  companyName: string;
  user?: UserProfile;
}

/**
 * BaseMobileMenu component for responsive navigation on mobile devices.
 * 
 * Features:
 * - Full-screen overlay menu
 * - Animated transitions
 * - Support for nested navigation
 * - Keyboard accessibility
 * - Touch-friendly interactions
 */
export function BaseMobileMenu({
  isOpen,
  onClose,
  items,
  header,
  footer,
  className,
  onItemClick
}: BaseMobileMenuProps) {
  // Track which sections are expanded in the menu
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Close menu when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
  
  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Toggle a section's expanded state
  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Render a single navigation item
  const renderItem = (item: SidebarItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.id];
    
    return (
      <li key={item.id} className="w-full">
        <a
          href={item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleSection(item.id);
            } else if (onItemClick) {
              onItemClick(item);
              onClose();
            } else {
              onClose();
            }
          }}
          className={cn(
            'flex items-center py-3 px-4 text-base font-medium w-full',
            'border-b border-gray-100',
            'hover:bg-[var(--accent-color)]/10',
            item.isActive && 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]',
            item.isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            depth > 0 && 'py-2 pl-8 border-b-0'
          )}
        >
          {item.icon && (
            <span className="flex-shrink-0 mr-3">
              <Icon iconId="faQuestionLight" name={item.icon} className="w-5 h-5"/>
            </span>
          )}
          <span className="flex-grow">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 ml-2 text-xs font-medium rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)]">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <Icon iconId="faQuestionLight" name={isExpanded ? "faChevronDown" : "faChevronRight"} className="ml-2 w-4 h-4"/>
          )}
        </a>
        
        {hasChildren && isExpanded && (
          <ul className="bg-gray-50">
            {item.children?.map((child: SidebarItem) => renderItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };
  
  return (
    <>
      {/* Mobile menu overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black z-50 transition-opacity duration-300',
          isOpen ? 'opacity-50 visible' : 'opacity-0 invisible'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Mobile menu container */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
        aria-modal="true"
        role="dialog"
        aria-label="Mobile navigation menu"
      >
        {/* Header area */}
        {header && (
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {header}
            <button
              type="button"
              className="p-2 -mr-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close menu"
            >
              <Icon iconId="faXmarkLight" className="w-5 h-5"/>
            </button>
          </div>
        )}
        
        {/* Close button (if no header) */}
        {!header && (
          <div className="flex justify-end p-4">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close menu"
            >
              <Icon iconId="faXmarkLight" className="w-5 h-5"/>
            </button>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="overflow-y-auto h-[calc(100%-4rem)]">
          <ul className="py-2">
            {items.map(item => renderItem(item))}
          </ul>
        </nav>
        
        {/* Footer area */}
        {footer && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * MobileMenu component with application-specific functionality
 */
export function MobileMenu({
  isOpen,
  onClose,
  navItems,
  settingsNavItem,
  remainingCredits,
  notificationsCount,
  companyName,
  user
}: MobileMenuProps) {
  // Convert NavItems to SidebarItems
  const sidebarItems: SidebarItem[] = navItems.map(item => ({
    id: item.href,
    label: item.label,
    href: item.href,
    icon: item.icon,
    isActive: false // Would need to be determined based on current path
  }));

  // Add settings item
  sidebarItems.push({
    id: settingsNavItem.href,
    label: settingsNavItem.label,
    href: settingsNavItem.href,
    icon: settingsNavItem.icon,
    isActive: false
  });

  // Header content
  const headerContent = (
    <div className="flex items-center space-x-2">
      <Image src="/logo.png" alt={companyName} width={32} height={32} />
      <span className="font-bold text-lg">{companyName}</span>
    </div>
  );

  // Footer content
  const footerContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Icon iconId="faCoinsLight" className="w-5 h-5"/>
          <span className="text-sm font-medium">{remainingCredits} credits</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Icon iconId="faBellLight" className="w-5 h-5"/>
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                {notificationsCount}
              </span>
            )}
          </div>
          <span className="text-sm">Notifications</span>
        </div>
      </div>
      
      {user && (
        <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
          <Image 
            src={user.picture || "/icons/light/user.svg"} 
            alt="Profile" 
            width={32} 
            height={32}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <BaseMobileMenu
      isOpen={isOpen}
      onClose={onClose}
      items={sidebarItems}
      header={headerContent}
      footer={footerContent}
    />
  );
}

export default MobileMenu; 