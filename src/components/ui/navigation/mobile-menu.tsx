/**
 * @component MobileMenu
 * @category navigation
 * @subcategory menu
 * @description Mobile navigation menu components for responsive interfaces
 */
'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { UserProfile } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';
import { Icon } from '@/components/ui/icon/icon';
import { iconExists } from '@/components/ui/icon/icons';

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

interface MobileMenuBaseProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onItemClick?: (item: SidebarItem) => void;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  settingsNavItem: NavItem;
  remainingCredits: number;
  notificationsCount: number;
  companyName: string;
  user?: UserProfile;
}

// Aliases for backward compatibility
export type MenuMobileBaseProps = MobileMenuBaseProps;
export type MenuMobileProps = MobileMenuProps;

/**
 * MobileMenuBase component for responsive navigation on mobile devices.
 * 
 * Features:
 * - Full-screen overlay menu
 * - Animated transitions
 * - Support for nested navigation
 * - Keyboard accessibility
 * - Touch-friendly interactions
 */
export function MobileMenuBase({
  isOpen,
  onClose,
  items,
  header,
  footer,
  className,
  onItemClick
}: MobileMenuBaseProps) {
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

    // Determine icon ID directly from item.icon and item.isActive
    let itemIconId = '';
    const isAppIcon = item.icon?.startsWith('app');
    const active = item.isActive || false; // Provide default

    if (item.icon) {
      // Handle App Icons separately - they don't have variants
      if (isAppIcon) {
        itemIconId = item.icon;
      }
      // Handle regular icons
      else if (item.icon.endsWith('Light') || item.icon.endsWith('Solid')) {
        itemIconId = active ? item.icon.replace('Light', 'Solid') : item.icon.replace('Solid', 'Light');
      } else {
        itemIconId = `${item.icon}${active ? 'Solid' : 'Light'}`;
      }
    } else {
      itemIconId = active ? 'faCircleSolid' : 'faCircleLight'; // Fallback
    }
    const iconAvailable = item.icon && iconExists(itemIconId);

    return (
      <li key={item.id} className="w-full" data-testid={`mobile-menu-item-${item.id}`}>
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
            active && 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]',
            item.isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            depth > 0 && 'py-2 pl-8 border-b-0'
          )}
        >
          {item.icon && (
            <span className="flex-shrink-0 mr-3">
              {iconAvailable ? (
                <Icon
                  iconId={itemIconId}
                  className="w-5 h-5"
                />
              ) : (
                <div
                  className="flex items-center justify-center w-5 h-5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full"
                  title={`Icon '${item.icon}' not found`}
                >
                  {item.icon ? item.icon.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </span>
          )}
          <span className="flex-grow">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 ml-2 text-xs font-medium rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)]">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            // Use direct icon IDs
            <Icon
              iconId={isExpanded ? "faChevronDownSolid" : "faChevronRightLight"}
              className="ml-2 w-4 h-4"
            />
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

  // Get the close icon
  const closeIconId = "faXmarkLight"; // Use direct ID
  const hasCloseIcon = iconExists(closeIconId);

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
        data-testid="mobile-menu-overlay"
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
        data-testid="mobile-menu-container"
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
              data-testid="mobile-menu-close"
            >
              {hasCloseIcon ? (
                <Icon iconId={closeIconId} className="w-5 h-5" />
              ) : (
                // Fallback for missing close icon
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
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
              data-testid="mobile-menu-close-alt"
            >
              {hasCloseIcon ? (
                <Icon iconId={closeIconId} className="w-5 h-5" />
              ) : (
                // Fallback for missing close icon
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
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

// Aliases for backward compatibility - must come before MobileMenu uses MobileMenuBase
export const MenuMobileBase = MobileMenuBase;
export const MenuMobile = MobileMenu;

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
  // Convert NavItems to SidebarItems, providing fallback for navItems
  const sidebarItems: SidebarItem[] = (navItems || []).map(item => ({
    id: item.href, // Use href as a unique ID for simplicity here
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

  // Get coins and bell icon IDs directly
  const coinsIconId = "faCoinsLight";
  const bellIconId = "faBellLight";

  // Header content
  const headerContent = (
    <div className="flex items-center space-x-2">
      <Image
        src="/logo.png"
        alt={companyName}
        width={32}
        height={32}
        onError={(e) => {
          // Fallback for logo if it fails to load
          e.currentTarget.style.display = 'none';
          console.warn("Logo image failed to load");
        }}
      />
      <span className="font-bold text-lg">{companyName}</span>
    </div>
  );

  // Footer content
  const footerContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Use direct ID */}
          {iconExists(coinsIconId) ? (
            <Icon iconId={coinsIconId} className="w-5 h-5" />
          ) : (
            // Fallback for missing coins icon
            <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
              $
            </div>
          )}
          <span className="text-sm font-medium">{remainingCredits} credits</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            {/* Use direct ID */}
            {iconExists(bellIconId) ? (
              <Icon iconId={bellIconId} className="w-5 h-5" />
            ) : (
              // Fallback for missing bell icon
              <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                N
              </div>
            )}
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
            onError={(e) => {
              // Fallback for user image if it fails to load
              e.currentTarget.src = "/icons/light/user.svg";
            }}
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
    <MobileMenuBase
      isOpen={isOpen}
      onClose={onClose}
      items={sidebarItems}
      header={headerContent}
      footer={footerContent}
    />
  );
}

export default MobileMenu;
