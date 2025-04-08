/**
 * @component Sidebar
 * @category navigation
 * @subcategory sidebar
 * @description Main application sidebar navigation with expandable/collapsible structure
 */
'use client';

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon/icon';
import { iconExists } from '@/components/ui/icon/icons';

/**
 * SidebarItem Component
 * Renders a single navigation item in the sidebar
 */
interface SidebarItemProps {
  href: string;
  label: string;
  icon?: string;
  isActive?: boolean;
  isExpanded?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

function SidebarItem({
  href,
  label,
  icon,
  isActive,
  isExpanded,
  children,
  onClick
}: SidebarItemProps) {
  // Determine icon ID directly from prop and active state
  let iconId = '';
  const isAppIcon = icon?.startsWith('app');
  const active = isActive || false; // Provide default for isActive

  if (icon) {
    // Handle App Icons separately - they don't have variants
    if (isAppIcon) {
      iconId = icon;
    }
    // Handle regular icons
    else if (icon.endsWith('Light') || icon.endsWith('Solid')) {
      iconId = active ? icon.replace('Light', 'Solid') : icon.replace('Solid', 'Light');
    } else {
      // Assume it's a base name, add appropriate suffix
      iconId = `${icon}${active ? 'Solid' : 'Light'}`;
    }
  } else {
    // Fallback if no icon prop provided
    iconId = active ? 'faCircleSolid' : 'faCircleLight';
  }

  const iconAvailable = icon && iconExists(iconId);

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center py-2 px-3 text-sm rounded-md transition-colors duration-150",
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
          !isExpanded && "justify-center"
        )}
        onClick={onClick}
      >
        {iconAvailable ? (
          <Icon
            iconId={iconId}
            className={cn(
              "w-5 h-5",
              isExpanded ? "mr-2" : "mx-auto"
            )}
          />
        ) : icon ? (
          // Fallback for icons that don't exist
          <span
            className={cn(
              "flex items-center justify-center w-5 h-5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full",
              isExpanded ? "mr-2" : "mx-auto"
            )}
            title={`Icon '${icon}' not found`}
          >
            {icon.charAt(0).toUpperCase()}
          </span>
        ) : null}

        {isExpanded && <span>{label}</span>}
        {!isExpanded && !icon && <span className="truncate w-5">{label.charAt(0)}</span>}
      </Link>
      {isExpanded && children}
    </li>
  );
}

/**
 * Sidebar Component
 * Main navigation sidebar with configurable items and state
 */
interface SidebarProps {
  items: {
    href: string;
    label: string;
    icon?: string;
    children?: {
      href: string;
      label: string;
      icon?: string;
    }[];
  }[];
  activePath?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
  logoSrc?: string;
  logoAlt?: string;
  title?: string;
  onItemClick?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  items = [],
  activePath = '',
  isExpanded = true,
  onToggle,
  className,
  logoSrc,
  logoAlt = 'Logo',
  title = 'Dashboard',
  onItemClick
}: SidebarProps) {
  // Active path detection
  const isActive = useCallback((path: string) => {
    // Exact match or parent path match
    return activePath === path ||
      (path !== '/' && activePath.startsWith(path));
  }, [activePath]);

  // Active parent detection
  const hasActiveChild = useCallback((item: { children?: any[] }) => {
    return item.children?.some(child => isActive(child.href));
  }, [isActive]);

  // Helper to get icon ID for parent items (like folders)
  const getParentIconId = (itemIcon: string | undefined, isActiveParent: boolean | undefined) => {
    const active = isActiveParent || false; // Default to false
    if (!itemIcon) return 'faFolderLight';
    if (itemIcon.startsWith('app')) return itemIcon;

    if (itemIcon.endsWith('Light') || itemIcon.endsWith('Solid')) {
      return active ? itemIcon.replace('Light', 'Solid') : itemIcon.replace('Solid', 'Light');
    } else {
      return `${itemIcon}${active ? 'Solid' : 'Light'}`;
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
        isExpanded ? "w-56" : "w-16",
        className
      )}
      data-testid="sidebar" // Aid for testing
    >
      {/* Sidebar header */}
      <div className={cn(
        "h-14 flex items-center px-3 border-b border-gray-200 dark:border-gray-800",
        isExpanded ? "justify-between" : "justify-center"
      )}>
        {isExpanded && (
          <div className="flex items-center">
            {logoSrc && (
              <img src={logoSrc} alt={logoAlt} className="h-6 w-auto mr-2" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">{title}</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          data-testid="sidebar-toggle"
        >
          <Icon
            iconId={isExpanded ? "faChevronLeftLight" : "faChevronRightLight"}
            className="w-4 h-4"
          />
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.children ? (
                <li>
                  <div
                    className={cn(
                      "flex items-center py-2 px-3 text-sm rounded-md cursor-pointer",
                      (hasActiveChild(item) || false) // Default here too
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                      !isExpanded && "justify-center"
                    )}
                  >
                    {item.icon && (
                      <Icon
                        iconId={getParentIconId(item.icon, hasActiveChild(item))}
                        className={cn(
                          "w-5 h-5",
                          isExpanded ? "mr-2" : "mx-auto"
                        )}
                      />
                    )}
                    {isExpanded && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <Icon
                          iconId={"faChevronDownLight"}
                          className="w-3 h-3"
                        />
                      </>
                    )}
                    {!isExpanded && !item.icon && (
                      <span className="truncate w-5">{item.label.charAt(0)}</span>
                    )}
                  </div>

                  {isExpanded && (
                    <ul className="mt-1 ml-6 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <SidebarItem
                          key={childIndex}
                          href={child.href}
                          label={child.label}
                          icon={child.icon}
                          isActive={isActive(child.href)}
                          isExpanded={isExpanded}
                          onClick={onItemClick}
                        />
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <SidebarItem
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive(item.href)}
                  isExpanded={isExpanded}
                  onClick={onItemClick}
                />
              )}
            </React.Fragment>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

// Add default export that references the named export
export default Sidebar;
