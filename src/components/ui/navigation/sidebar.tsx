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
import { HoverIcon } from '@/components/ui/icon/hover-icon';
import { UI_ICON_MAP, hasSemanticIcon } from '@/components/ui/icon/icon-semantic-map';
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
  // Determine the correct icon ID based on semantic mapping or direct reference
  const getIconId = useCallback((iconName: string, isItemActive: boolean) => {
    // If icon is a semantic name in our map, use it
    if (hasSemanticIcon(iconName)) {
      return isItemActive 
        ? UI_ICON_MAP[iconName].replace('Light', 'Solid') 
        : UI_ICON_MAP[iconName];
    }

    // For direct icon references, ensure proper suffix for the variant
    if (iconName) {
      // If icon already has a proper suffix, use as is
      if (iconName.endsWith('Light') || iconName.endsWith('Solid')) {
        return isItemActive 
          ? iconName.replace('Light', 'Solid') 
          : iconName;
      }
      
      // Add the appropriate suffix
      return `${iconName}${isItemActive ? 'Solid' : 'Light'}`;
    }
    
    // Fallback for missing icons
    return isItemActive ? 'faCircleSolid' : 'faCircleLight';
  }, []);

  // Verify if the icon exists before rendering
  const iconId = icon ? getIconId(icon, isActive || false) : '';
  const iconAvailable = icon && iconExists(iconId);

  return (
    <li>
      <Link 
        href={href}
        className={cn(
          "flex items-center py-2 px-3 text-sm rounded-md transition-colors duration-150",
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
          !isExpanded && "justify-center"
        )}
        onClick={onClick}
      >
        {iconAvailable ? (
          <HoverIcon 
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
          <HoverIcon 
            iconId={isExpanded ? UI_ICON_MAP.chevronLeft : UI_ICON_MAP.chevronRight}
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
                      hasActiveChild(item)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                      !isExpanded && "justify-center"
                    )}
                  >
                    {item.icon && iconExists(item.icon) && (
                      <HoverIcon 
                        iconId={hasActiveChild(item) 
                          ? item.icon.replace('Light', 'Solid')
                          : item.icon
                        }
                        className={cn(
                          "w-5 h-5",
                          isExpanded ? "mr-2" : "mx-auto"
                        )}
                      />
                    )}
                    {isExpanded && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <HoverIcon 
                          iconId={UI_ICON_MAP.chevronDown}
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
