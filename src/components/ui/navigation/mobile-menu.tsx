/**
 * @component MobileMenu
 * @category organism
 * @subcategory menu
 * @description Mobile navigation menu using Shadcn Sheet component.
 * @status 10th April
 */
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserResource } from '@clerk/types';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { iconExists } from '@/components/ui/icon/icons';
import { NotificationCenter } from '@/components/ui/notifications/NotificationCenter';
import { NAVIGATION_CONSTANTS } from './navigation-constants';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet';

// --- Single Source of Truth for Menu Item Structure ---
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  iconId?: string; // Keep optional for potential custom non-app icons, but prioritize internal mapping
  isDisabled?: boolean;
  badge?: string | number;
  children?: MenuItem[];
}

// --- Component Props ---
export interface MobileMenuProps {
  isOpen: boolean; // Controls the Sheet's open state
  onOpenChange: (open: boolean) => void; // Callback for Sheet state changes
  menuItems: MenuItem[]; // Navigation items using the unified type
  remainingCredits: number; // Data for the footer
  notificationsCount: number; // Data for the footer
  companyName: string; // Data for the header
  user?: UserResource | null | undefined; // Use Clerk UserResource type
  authControls?: React.ReactNode; // Auth controls (same as header)
  className?: string; // Optional additional class names for SheetContent
  onItemClick?: (item: MenuItem) => void; // Optional click handler
}

// --- App Icon Mapping (Updated) ---
const appIconMap: Record<string, string> = {
  dashboard: 'appHome',
  home: 'appHome',
  campaigns: 'appCampaigns',
  'brand lift': 'appBrandLift',
  'creative testing': 'appCreativeAssetTesting',
  'brand health': 'appBrandHealth',
  influencers: 'appInfluencers',
  mmm: 'appMmm',
  reports: 'appReports',
  settings: 'appSettings',
  'account settings': 'appSettings',
  help: 'appHelp',
  billing: 'appBilling',
};

const getAppIconIdForLabel = (label: string): string | null => {
  return appIconMap[label.toLowerCase()] || null;
};

// --- Helper Icons (Update to use app icons where applicable) ---
const ICONS = {
  CLOSE: 'faXmarkLight',
  CHEVRON_DOWN: 'faChevronDownSolid',
  CHEVRON_RIGHT: 'faChevronRightLight',
  COINS: 'faCoinsLight', // Keep FA light or find app equivalent?
  BELL: 'faBellLight', // Keep FA light or find app equivalent?
  USER_FALLBACK: '/icons/light/faUserLight.svg', // Use explicit FA path
  LOGO_FALLBACK: '/logo.png',
};

/**
 * Renders a single menu item or a collapsible section.
 */
const RenderMenuItem: React.FC<{
  item: MenuItem;
  depth?: number;
  onItemClick?: (item: MenuItem) => void;
  onClose: () => void; // Pass onClose to close sheet on item click
  itemKey: string; // Unique key for this item
  isExpanded: boolean; // Controlled expansion state
  onToggleExpansion: (itemKey: string) => void; // Function to toggle expansion
}> = ({ item, depth = 0, onItemClick, onClose, itemKey, isExpanded, onToggleExpansion }) => {
  const hasChildren = item.children && item.children.length > 0;

  const mappedAppIconId = getAppIconIdForLabel(item.label);
  const displayIconId = mappedAppIconId || item.iconId;
  const iconAvailable = displayIconId ? iconExists(displayIconId) : false;
  const fallbackIcon = 'faCircleLight';
  const finalIconId = iconAvailable ? displayIconId : fallbackIcon;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasChildren) {
      e.preventDefault();
      onToggleExpansion(itemKey); // Use controlled expansion
    } else {
      onItemClick?.(item);
      onClose(); // Close the sheet when a non-parent item is clicked
    }
  };

  return (
    <li className="w-full" data-testid={`mobile-menu-item-${item.id}`}>
      {!hasChildren ? (
        <SheetClose asChild>
          <a
            href={item.href}
            onClick={handleClick}
            className={cn(
              'flex items-center py-3 px-4 text-base font-medium w-full',
              'border-b border-gray-100 dark:border-gray-800', // Added dark mode border
              'hover:bg-accent hover:text-accent-foreground', // Use theme variables
              item.isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              depth > 0 && 'py-2 pl-8 border-b-0'
            )}
          >
            {!NAVIGATION_CONSTANTS.showChildIcons && depth > 0 ? null : (
              <span className="flex-shrink-0 mr-3">
                <Icon iconId={finalIconId!} className="w-5 h-5" />
              </span>
            )}
            <span
              className={cn(
                'flex-grow',
                depth > 0 && !NAVIGATION_CONSTANTS.showChildIcons && 'ml-0'
              )}
            >
              {item.label}
            </span>
            {item.badge && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 ml-2 text-xs font-medium rounded-full bg-accent text-accent-foreground">
                {item.badge}
              </span>
            )}
          </a>
        </SheetClose>
      ) : (
        <a
          href={item.href} // Keep href for potential right-click/open in new tab
          onClick={handleClick}
          className={cn(
            'flex items-center py-3 px-4 text-base font-medium w-full',
            'border-b border-gray-100 dark:border-gray-800',
            'hover:bg-accent hover:text-accent-foreground',
            item.isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            depth > 0 && 'py-2 pl-8 border-b-0'
          )}
        >
          {!NAVIGATION_CONSTANTS.showChildIcons && depth > 0 ? null : (
            <span className="flex-shrink-0 mr-3">
              <Icon iconId={finalIconId!} className="w-5 h-5" />
            </span>
          )}
          <span
            className={cn('flex-grow', depth > 0 && !NAVIGATION_CONSTANTS.showChildIcons && 'ml-0')}
          >
            {item.label}
          </span>
          {item.badge && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 ml-2 text-xs font-medium rounded-full bg-accent text-accent-foreground">
              {item.badge}
            </span>
          )}
          {/* Chevron for parent items */}
          <Icon
            iconId={isExpanded ? ICONS.CHEVRON_DOWN : ICONS.CHEVRON_RIGHT}
            className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=expanded]:rotate-180"
          />
        </a>
      )}

      {/* Nested Items */}
      {hasChildren && isExpanded && (
        <ul className="bg-muted/50 dark:bg-muted/20">
          {item.children?.map((child: MenuItem, childIndex) => {
            const childKey = `${itemKey}-child-${childIndex}`;
            return (
              <RenderMenuItem
                key={child.id}
                item={child}
                depth={depth + 1}
                onItemClick={onItemClick}
                onClose={onClose} // Pass down onClose
                itemKey={childKey}
                isExpanded={false} // Children don't expand in mobile menu
                onToggleExpansion={onToggleExpansion}
              />
            );
          })}
        </ul>
      )}
    </li>
  );
};

/**
 * MobileMenu component implemented using Shadcn's Sheet.
 * Provides responsive navigation for mobile devices.
 */
export function MobileMenu({
  isOpen,
  onOpenChange,
  menuItems,
  remainingCredits: _remainingCredits,
  notificationsCount: _notificationsCount,
  companyName,
  user: _user,
  authControls,
  className,
  onItemClick,
}: MobileMenuProps) {
  const handleClose = () => onOpenChange(false); // Helper to close sheet

  // --- Centralized Expansion State (same as sidebar) ---
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});

  // Function to toggle section expansion with accordion behavior (same as sidebar)
  const toggleSection = (itemKey: string) => {
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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn('w-full max-w-xs p-0 flex flex-col', className)}
        data-testid="mobile-menu-sheet-content"
      >
        {/* Header - Remove custom SheetClose */}
        <SheetHeader className="flex flex-row items-center justify-between h-16 px-4 border-b">
          <SheetTitle className="sr-only">Main Menu</SheetTitle>
          <div className="flex items-center space-x-2">
            <Image
              src={ICONS.LOGO_FALLBACK}
              alt={companyName}
              width={32}
              height={32}
              onError={e => {
                e.currentTarget.style.display = 'none';
                console.warn('Logo image failed to load');
              }}
            />
            <span className="font-semibold text-lg">{companyName}</span>
          </div>
        </SheetHeader>

        {/* Navigation List - Takes remaining space and scrolls */}
        <nav className="flex-grow overflow-y-auto">
          <ul className="py-2">
            {menuItems.map((item, index) => {
              const itemKey = item.label + index; // Create unique key same as sidebar
              const isExpanded = expandedSections[itemKey] || false;
              return (
                <RenderMenuItem
                  key={item.id}
                  item={item}
                  onItemClick={onItemClick}
                  onClose={handleClose}
                  itemKey={itemKey}
                  isExpanded={isExpanded}
                  onToggleExpansion={toggleSection}
                />
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <SheetFooter className="border-t p-4 mt-auto">
          <div className="w-full">
            {/* Icons mirroring header order: coins, bell, profile with 5px spacing */}
            <div
              className="flex items-center justify-center"
              style={{ gap: NAVIGATION_CONSTANTS.iconGap }}
            >
              {/* Credits - exact same as header */}
              <Link
                href="/account/billing"
                className="flex items-center space-x-1"
                data-cy="credits-button"
              >
                <IconButtonAction
                  iconBaseName="faCoins"
                  hoverColorClass={NAVIGATION_CONSTANTS.hoverColor}
                  ariaLabel="Go to billing"
                  defaultColorClass={NAVIGATION_CONSTANTS.defaultColor}
                  staysSolid={true}
                  className={`${NAVIGATION_CONSTANTS.coinsSize} ${NAVIGATION_CONSTANTS.forceCoinsSize}`}
                />
              </Link>

              {/* Notifications - exact same as header */}
              <NotificationCenter data-cy="notifications-button" />

              {/* Profile - exact same as header */}
              {authControls && <div data-cy="auth-controls">{authControls}</div>}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Remove old aliases and base component
// export { MobileMenuBaseProps, MenuMobileProps, MobileMenuBase, MenuMobile }; // Removed

export default MobileMenu;
