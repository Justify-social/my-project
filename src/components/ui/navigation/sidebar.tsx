/**
 * @component Sidebar
 * @category oragnism
 * @subcategory sidebar
 * @description Main application sidebar navigation with expandable/collapsible structure
 */
'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

// Placeholder type for the icon registry data
type AppIconRegistry = Record<string, string>;

/**
 * SidebarItem Component
 * Renders a single navigation item in the sidebar
 */
interface SidebarItemProps {
  href: string;
  label: string;
  icon?: string; // Icon name (key in registry)
  isActive?: boolean;
  isChild?: boolean; // Add isChild prop to control text size
  onClick?: () => void;
  iconRegistry: AppIconRegistry; // Pass registry down
  isLoadingRegistry: boolean; // Added prop
}

function SidebarItem({
  href,
  label,
  icon,
  isActive,
  isChild = false, // Default to false (parent/standalone size)
  onClick,
  iconRegistry,
  isLoadingRegistry,
}: SidebarItemProps) {
  const [isHovered, setIsHovered] = useState(false); // Add hover state
  const [isHydrated, setIsHydrated] = useState(false); // Add hydration state

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const active = isActive || false; // Provide default for isActive
  const iconPath = icon && !isLoadingRegistry ? iconRegistry[icon] : undefined; // Get path from registry, prevent lookup while loading

  return (
    <li className="w-full">
      <Link
        href={href}
        onClick={onClick}
        onMouseEnter={() => isHydrated && setIsHovered(true)}
        onMouseLeave={() => isHydrated && setIsHovered(false)}
        data-cy={`nav-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
        className={cn(
          'flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
          active || (isHydrated && isHovered)
            ? 'text-accent bg-accent/10 font-medium'
            : 'text-foreground hover:text-accent hover:bg-accent/5'
        )}
      >
        {iconPath ? (
          <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0">
            <Image
              src={iconPath}
              alt={`${label} icon`}
              className="w-5 h-5"
              width={20}
              height={20}
              style={{
                filter:
                  active || (isHydrated && isHovered)
                    ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)'
                    : 'none', // Accent color filter on hover/active
                transition: 'filter 0.15s ease-in-out',
              }}
              unoptimized
            />
          </div>
        ) : icon ? (
          // Fallback if icon name provided but not in registry
          <div
            className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0"
            title={`Icon '${icon}' not found in registry`}
          >
            <span className="flex items-center justify-center w-5 h-5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
              {icon.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          // Placeholder if no icon is provided for alignment
          <div className="w-6 h-6 mr-2 flex-shrink-0"></div>
        )}

        {/* Use text-xs for child items and text-sm for parent/standalone items */}
        <span
          className={`flex-grow ${isChild ? 'text-xs' : 'text-sm'} font-medium truncate ${active || (isHydrated && isHovered) ? 'text-accent' : 'text-foreground'}`}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}

/**
 * Sidebar Component
 * Main navigation sidebar with configurable items and state
 */
interface SidebarProps {
  items: {
    href?: string; // Optional href for parent items acting as headers
    label: string;
    icon?: string; // Icon name (key in registry)
    children?: {
      href: string;
      label: string;
      icon?: string; // Icon name (key in registry)
    }[];
  }[];
  activePath?: string;
  className?: string;
  logoSrc?: string;
  logoAlt?: string;
  title?: string;
  onItemClick?: () => void; // Keep this for potential mobile overlay closing etc.
  settingsHref?: string; // Add prop for settings link href
  settingsLabel?: string; // Add prop for settings link label
  settingsIcon?: string; // Add prop for settings link icon
}

export function Sidebar({
  items = [],
  activePath = '',
  className,
  logoSrc,
  logoAlt = 'Logo',
  title = 'Dashboard',
  onItemClick,
  settingsHref, // Destructure new props
  settingsLabel,
  settingsIcon,
}: SidebarProps) {
  // --- Icon Registry Loading ---
  const [iconRegistry, setIconRegistry] = useState<AppIconRegistry>({});
  const [isRegistryLoading, setIsRegistryLoading] = useState(true); // Added loading state
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // --- Hydration State ---
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setIsRegistryLoading(true); // Set loading true at start
    // Fetch the icon registry from the public path
    fetch('/static/app-icon-registry.json') // Relative path from public folder
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { icons: { id: string; path: string }[] }) => {
        // Adjust type to match JSON structure
        // Map the icons array to the expected Record<string, string> format
        const registry = data.icons.reduce((acc, icon) => {
          acc[icon.id] = icon.path; // Map id to path
          return acc;
        }, {} as AppIconRegistry);
        setIconRegistry(registry);
        setLoadingError(null);
      })
      .catch(error => {
        console.error('Error loading icon registry:', error);
        setLoadingError('Could not load icon registry. Icons may not display.');
        setIconRegistry({}); // Set empty registry on error
      })
      .finally(() => {
        setIsRegistryLoading(false); // Set loading false when fetch completes (success or error)
      });
  }, []); // Load only once on mount
  // --- End Icon Registry Loading ---

  // --- Collapsible Section State ---
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Function to toggle section expansion with accordion behavior
  const toggleSection = (itemKey: string) => {
    if (!isHydrated) return; // Prevent state changes before hydration

    setExpandedSections(prev => {
      // If clicking on already expanded section, collapse it
      if (prev[itemKey]) {
        return { ...prev, [itemKey]: false };
      }

      // Otherwise, collapse all sections and expand only the clicked one
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false; // Collapse all sections
      });
      newState[itemKey] = true; // Expand only the clicked section

      return newState;
    });
  };
  // --- End Collapsible Section State ---

  // --- Hover State for Parent Items ---
  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({});
  const setHover = (id: string, isHovered: boolean) => {
    if (!isHydrated) return; // Prevent state changes before hydration
    setHoverStates(prev => ({ ...prev, [id]: isHovered }));
  };
  // --- End Hover State ---

  const isActive = useCallback(
    (path: string) => {
      if (!path) return false; // Handle cases where href might be missing

      // Exact match always takes priority
      if (activePath === path) return true;

      // ==========================================
      // SPECIAL CASE ROUTING RULES FOR CHILD NAVIGATION HIGHLIGHTING
      // ==========================================
      // IMPORTANT: When adding new routes with child navigation, ensure you add
      // corresponding special cases here to maintain proper highlighting behavior.
      // Follow the pattern below for consistent user experience.
      // ==========================================

      // Special case: Campaign Wizard - highlight "Wizard" child for all wizard steps + submission
      if (path === '/campaigns/wizard/step-1' && activePath.startsWith('/campaigns/wizard/')) {
        return true;
      }

      // Special case: Campaign List - highlight "List" child for campaign profiles but NOT wizard pages
      if (
        path === '/campaigns' &&
        activePath.startsWith('/campaigns/') &&
        !activePath.startsWith('/campaigns/wizard/')
      ) {
        return true;
      }

      // Special case: Influencer Marketplace - highlight "Marketplace" child for influencer profile pages
      // This ensures /influencer-marketplace/[username] pages (like /influencer-marketplace/leomessi)
      // keep the "Marketplace" child item highlighted, NOT the "List" child
      if (
        path === '/influencer-marketplace' &&
        activePath.startsWith('/influencer-marketplace/') &&
        !activePath.startsWith('/influencer-marketplace/list')
      ) {
        return true;
      }

      // Special case: Influencer List - highlight "List" child for the list page and its sub-routes
      if (
        path === '/influencer-marketplace/list' &&
        activePath.startsWith('/influencer-marketplace/list')
      ) {
        return true;
      }

      // Special case: Brand Lift Study - highlight "Study" child for all brand lift pages except reports
      if (
        path === '/brand-lift/campaign-selection' &&
        activePath.startsWith('/brand-lift/') &&
        !activePath.startsWith('/brand-lift/reports')
      ) {
        return true;
      }

      // Special case: Brand Lift Reports - highlight "Reports" child for brand lift reports
      if (path === '/brand-lift/reports' && activePath.startsWith('/brand-lift/reports')) {
        return true;
      }

      // ==========================================
      // ADD NEW SPECIAL CASES ABOVE THIS LINE
      // ==========================================
      // Pattern to follow:
      // if (
      //   path === '/parent-route/child-route' &&
      //   activePath.startsWith('/parent-route/child-route') &&
      //   !activePath.startsWith('/parent-route/other-child-route')
      // ) {
      //   return true;
      // }
      // ==========================================

      // For other child routes, only match if it's an exact match
      // This prevents both parent and child from being active simultaneously
      return false;
    },
    [activePath]
  );

  const hasActiveChild = useCallback(
    (item: { children?: { href: string }[] }) => {
      return item.children?.some(child => {
        // Use the same isActive logic for consistency
        return isActive(child.href);
      });
    },
    [isActive]
  );

  // New function to check if current path is related to parent but not matching any child
  const isParentRelated = useCallback(
    (item: { href?: string; children?: { href: string }[] }) => {
      if (!item.href || activePath === item.href) return false;

      // Check if current path starts with parent href
      if (activePath.startsWith(item.href + '/')) {
        // But ensure no child matches exactly or as prefix
        const hasMatchingChild = item.children?.some(child => {
          return (
            activePath === child.href ||
            (child.href !== '/' && activePath.startsWith(child.href + '/'))
          );
        });

        return !hasMatchingChild;
      }

      return false;
    },
    [activePath]
  );

  // Handle auto-expansion with accordion behavior
  useEffect(() => {
    if (!isHydrated) return;

    // Find the item that should be auto-expanded (has an active child or is related to current path)
    const autoExpandItem = items.find((item, _index) => {
      const hasActiveChildItem = hasActiveChild(item);
      const isRelatedToParent = isParentRelated(item);
      return hasActiveChildItem || isRelatedToParent;
    });

    // Reset all sections - collapse everything first
    const newState: Record<string, boolean> = {};

    // If we found an item that should be expanded, expand only that one
    if (autoExpandItem) {
      const itemKey = autoExpandItem.label + items.indexOf(autoExpandItem);
      items.forEach((item, index) => {
        const key = item.label + index;
        newState[key] = key === itemKey; // Only expand the one with active child
      });
    } else {
      // No active children anywhere - collapse all sections
      items.forEach((item, index) => {
        const key = item.label + index;
        newState[key] = false;
      });
    }

    setExpandedSections(newState);
  }, [activePath, isHydrated, items, hasActiveChild, isParentRelated]);

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full z-40 flex flex-col bg-muted transition-all w-64 md:translate-x-0', // Fixed width, no reference to isCollapsed
        className
      )}
      data-testid="sidebar"
      data-cy="main-sidebar"
    >
      {/* Sidebar header */}
      <div className={cn('h-14 flex items-center px-4 border-b border')} data-cy="sidebar-header">
        <div className="flex items-center" data-cy="sidebar-logo">
          {/* Replaced img with Image */}
          {logoSrc && (
            <Image
              src={logoSrc}
              alt={logoAlt}
              className="h-6 w-auto mr-2" // Keep className, w-auto might allow flexibility
              width={24} // Provide width (6 * 4px)
              height={24} // Provide height (6 * 4px)
              data-cy="sidebar-logo-image"
              // Add unoptimized if logoSrc can be external/dynamic
              // unoptimized
            />
          )}
          <span className="font-medium text-foreground" data-cy="sidebar-title">
            {title}
          </span>
        </div>
      </div>
      {loadingError && <div className="p-4 text-xs text-red-600 bg-red-100">{loadingError}</div>}
      {/* Navigation items - Make this flexible and scrollable, remove bottom padding */}
      <nav
        className="flex-1 overflow-y-auto p-2 pb-[var(--footer-height)]"
        data-cy="main-navigation"
      >
        {isRegistryLoading && (
          <div className="p-4 text-xs text-muted-foreground">Loading icons...</div>
        )}
        <ul className="list-none space-y-0.5">
          {items.map((item, index) => {
            const itemKey = item.label + index; // Create a key for hover state and expansion

            // Enhanced logic: parent is active if:
            // 1. Its own href is active AND no child is active, OR
            // 2. Current path is related to parent but doesn't match any child (like profile pages)
            const isParentDirectlyActive = item.href ? isActive(item.href) : false;
            const hasActiveChildItem = hasActiveChild(item);
            const isRelatedToParent = isParentRelated(item);

            // Parent is highlighted if:
            // 1. Its direct href is active AND no child is active, OR
            // 2. Current path is related to parent but no child matches
            const isActiveParent =
              (isParentDirectlyActive && !hasActiveChildItem) || isRelatedToParent;

            const isHoveredParent = (isHydrated && hoverStates[itemKey]) || false;

            // Only expand if explicitly set in expandedSections (controlled by useEffect above)
            const isExpanded = (isHydrated && expandedSections[itemKey]) || false;
            const parentIconName = item.icon; // ONLY use explicitly provided icon for parents
            const parentIconPath = parentIconName ? iconRegistry[parentIconName] : undefined;

            return (
              <React.Fragment key={itemKey}>
                {item.children ? (
                  // Render parent item similar to sidebar-ui-components categories
                  <li className="w-full">
                    {item.href ? (
                      // If parent has href, render as Link but also make it expandable
                      <Link
                        href={item.href}
                        onClick={() => {
                          toggleSection(itemKey);
                          onItemClick?.();
                        }}
                        onMouseEnter={() => setHover(itemKey, true)}
                        onMouseLeave={() => setHover(itemKey, false)}
                        data-cy={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        className={cn(
                          'flex items-center justify-between py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group',
                          isActiveParent || isHoveredParent
                            ? 'text-accent bg-accent/10 font-medium' // THEMED
                            : 'text-foreground hover:text-accent hover:bg-accent/5' // THEMED
                        )}
                      >
                        <div className="flex items-center">
                          {parentIconPath ? (
                            <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0">
                              <Image
                                src={parentIconPath}
                                alt={`${item.label} icon`}
                                className="w-5 h-5"
                                width={20}
                                height={20}
                                style={{
                                  filter:
                                    isActiveParent || isHoveredParent
                                      ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)'
                                      : 'none',
                                  transition: 'filter 0.15s ease-in-out',
                                }}
                                unoptimized
                              />
                            </div>
                          ) : parentIconName ? (
                            <div
                              className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0"
                              title={`Icon '${parentIconName}' not found in registry`}
                            >
                              <span className="flex items-center justify-center w-5 h-5 text-xs bg-gray-200 rounded-full">
                                {parentIconName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 mr-2 flex-shrink-0"></div> // Placeholder
                          )}
                          {/* Parent item label: text-sm */}
                          <span
                            className={`text-sm font-medium truncate ${isActiveParent || isHoveredParent ? 'text-accent' : 'text-foreground'}`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    ) : (
                      // If parent has no href, render as non-navigable div
                      <div
                        onClick={() => toggleSection(itemKey)} // Toggle expansion on click
                        onMouseEnter={() => setHover(itemKey, true)}
                        onMouseLeave={() => setHover(itemKey, false)}
                        data-cy={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        className={cn(
                          'flex items-center justify-between py-2 pl-4 pr-2 rounded-md transition-all duration-150 w-full group cursor-pointer', // Added cursor-pointer
                          isActiveParent || isHoveredParent
                            ? 'text-accent bg-accent/10 font-medium' // THEMED
                            : 'text-foreground hover:text-accent hover:bg-accent/5' // THEMED
                        )}
                      >
                        <div className="flex items-center">
                          {parentIconPath ? (
                            <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0">
                              <Image
                                src={parentIconPath}
                                alt={`${item.label} icon`}
                                className="w-5 h-5"
                                width={20}
                                height={20}
                                style={{
                                  filter:
                                    isActiveParent || isHoveredParent
                                      ? 'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)'
                                      : 'none',
                                  transition: 'filter 0.15s ease-in-out',
                                }}
                                unoptimized
                              />
                            </div>
                          ) : parentIconName ? (
                            <div
                              className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0"
                              title={`Icon '${parentIconName}' not found in registry`}
                            >
                              <span className="flex items-center justify-center w-5 h-5 text-xs bg-gray-200 rounded-full">
                                {parentIconName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 mr-2 flex-shrink-0"></div> // Placeholder
                          )}
                          {/* Parent item label: text-sm */}
                          <span
                            className={`text-sm font-medium truncate ${isActiveParent || isHoveredParent ? 'text-accent' : 'text-foreground'}`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Render children conditionally based on isExpanded */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <ul className="pl-6 mt-0.5 space-y-0">
                        {item.children.map((child, childIndex) => (
                          <SidebarItem
                            key={`${itemKey}-${childIndex}`}
                            href={child.href}
                            label={child.label}
                            icon={child.icon}
                            isActive={isActive(child.href)}
                            isChild={true} // Mark as child item for text-xs size
                            onClick={onItemClick}
                            iconRegistry={isRegistryLoading ? {} : iconRegistry}
                            isLoadingRegistry={isRegistryLoading}
                          />
                        ))}
                      </ul>
                    </div>
                  </li>
                ) : (
                  // Render regular item
                  <SidebarItem
                    href={item.href || '#'} // Provide fallback href
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive(item.href || '#')}
                    isChild={false} // Standalone items use text-sm like parents
                    onClick={onItemClick}
                    iconRegistry={isRegistryLoading ? {} : iconRegistry}
                    isLoadingRegistry={isRegistryLoading}
                  />
                )}
              </React.Fragment>
            );
          })}
        </ul>
      </nav>
      {/* Settings Footer Area - Apply ONLY border-t */}
      <div className="p-2 border-t h-[var(--footer-height)] flex flex-col justify-center">
        <ul className="list-none space-y-0.5">
          {/* Settings Item - Use props if available, otherwise hide/fallback */}
          {settingsHref && settingsLabel && (
            <SidebarItem
              href={settingsHref} // Use prop
              label={settingsLabel} // Use prop
              icon={settingsIcon} // Use prop
              isActive={isActive(settingsHref)} // Check active state against the correct href from prop
              isChild={false}
              onClick={onItemClick}
              iconRegistry={isRegistryLoading ? {} : iconRegistry}
              isLoadingRegistry={isRegistryLoading}
            />
          )}
        </ul>
      </div>
    </aside>
  );
}

// Add default export that references the named export
export default Sidebar;
