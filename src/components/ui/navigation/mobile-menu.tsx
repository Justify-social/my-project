/**
 * @component MobileMenu
 * @category organism
 * @subcategory menu
 * @description Mobile navigation menu using Shadcn Sheet component.
 */
'use client';

import React from 'react';
import Image from 'next/image';
import { UserProfile } from '@auth0/nextjs-auth0/client';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';
import { iconExists } from '@/components/ui/icon/icons';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetClose, // Import SheetClose for the close button
} from '@/components/ui/sheet'; // Use Shadcn Sheet
import { Button } from '@/components/ui/button'; // For close button styling if needed

// --- Single Source of Truth for Menu Item Structure ---
export interface MenuItem {
  id: string;          // Unique identifier
  label: string;       // Display text
  href: string;        // Navigation link
  iconId: string;      // EXACT icon ID (e.g., "faHomeSolid", "faHomeLight")
  isDisabled?: boolean; // Optional: disable item
  badge?: string | number; // Optional: display a badge
  children?: MenuItem[];   // Optional: for nested menus
  // `isActive` is handled by the parent determining the correct iconId
}

// --- Component Props ---
export interface MobileMenuProps {
  isOpen: boolean;           // Controls the Sheet's open state
  onOpenChange: (open: boolean) => void; // Callback for Sheet state changes
  menuItems: MenuItem[];       // Navigation items using the unified type
  settingsItem?: MenuItem;     // Dedicated settings item - NOW OPTIONAL
  remainingCredits: number;   // Data for the footer
  notificationsCount: number; // Data for the footer
  companyName: string;        // Data for the header
  user?: UserProfile;        // Optional user data for the footer
  className?: string;        // Optional additional class names for SheetContent
  onItemClick?: (item: MenuItem) => void; // Optional click handler
}

// --- Helper Icons ---
const ICONS = {
  CLOSE: 'faXmarkLight',
  CHEVRON_DOWN: 'faChevronDownSolid',
  CHEVRON_RIGHT: 'faChevronRightLight',
  COINS: 'faCoinsLight',
  BELL: 'faBellLight',
  USER_FALLBACK: '/icons/light/user.svg', // Consider moving to constants
  LOGO_FALLBACK: '/logo.png', // Consider moving to constants
};

/**
 * Renders a single menu item or a collapsible section.
 */
const RenderMenuItem: React.FC<{
  item: MenuItem;
  depth?: number;
  onItemClick?: (item: MenuItem) => void;
  onClose: () => void; // Pass onClose to close sheet on item click
}> = ({ item, depth = 0, onItemClick, onClose }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const iconAvailable = iconExists(item.iconId);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else {
      onItemClick?.(item);
      onClose(); // Close the sheet when a non-parent item is clicked
    }
  };

  return (
    <li className="w-full" data-testid={`mobile-menu-item-${item.id}`}>
      {/* Use SheetClose for direct navigation items */}
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
            {/* Simplified Icon Rendering */}
            <span className="flex-shrink-0 mr-3">
              {iconAvailable ? (
                <Icon iconId={item.iconId} className="w-5 h-5" />
              ) : (
                <div className="flex items-center justify-center w-5 h-5 text-xs bg-muted text-muted-foreground rounded-full" title={`Icon '${item.iconId}' not found`}>
                  {item.label.charAt(0).toUpperCase()}
                </div>
              )}
            </span>
            <span className="flex-grow">{item.label}</span>
            {item.badge && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 ml-2 text-xs font-medium rounded-full bg-accent text-accent-foreground">
                {item.badge}
              </span>
            )}
          </a>
        </SheetClose>
      ) : (
        // Don't wrap parent items in SheetClose
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
          {/* Simplified Icon Rendering */}
          <span className="flex-shrink-0 mr-3">
            {iconAvailable ? (
              <Icon iconId={item.iconId} className="w-5 h-5" />
            ) : (
              <div className="flex items-center justify-center w-5 h-5 text-xs bg-muted text-muted-foreground rounded-full" title={`Icon '${item.iconId}' not found`}>
                {item.label.charAt(0).toUpperCase()}
              </div>
            )}
          </span>
          <span className="flex-grow">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 ml-2 text-xs font-medium rounded-full bg-accent text-accent-foreground">
              {item.badge}
            </span>
          )}
          {/* Chevron for parent items */}
          <Icon
            iconId={isExpanded ? ICONS.CHEVRON_DOWN : ICONS.CHEVRON_RIGHT}
            className="ml-2 w-4 h-4"
          />
        </a>
      )}

      {/* Nested Items */}
      {hasChildren && isExpanded && (
        <ul className="bg-muted/50 dark:bg-muted/20">
          {item.children?.map((child: MenuItem) => (
            <RenderMenuItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onItemClick={onItemClick}
              onClose={onClose} // Pass down onClose
            />
          ))}
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
  settingsItem,
  remainingCredits,
  notificationsCount,
  companyName,
  user,
  className,
  onItemClick,
}: MobileMenuProps) {

  const handleClose = () => onOpenChange(false); // Helper to close sheet

  // Combine regular items and settings item ONLY if settingsItem exists
  const allMenuItems = settingsItem ? [...menuItems, settingsItem] : menuItems;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("w-full max-w-xs p-0 flex flex-col", className)} data-testid="mobile-menu-sheet-content">

        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center space-x-2">
            <Image
              src={ICONS.LOGO_FALLBACK}
              alt={companyName}
              width={32}
              height={32}
              onError={(e) => { e.currentTarget.style.display = 'none'; console.warn("Logo image failed to load"); }}
            />
            <span className="font-semibold text-lg">{companyName}</span> {/* Adjusted font weight */}
          </div>
          {/* Use SheetClose for the button */}
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close menu" data-testid="mobile-menu-close">
              {iconExists(ICONS.CLOSE) ? (
                <Icon iconId={ICONS.CLOSE} className="w-5 h-5" />
              ) : (
                'X' // Simple fallback
              )}
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* Navigation List - Takes remaining space and scrolls */}
        <nav className="flex-grow overflow-y-auto">
          <ul className="py-2">
            {allMenuItems.map(item => (
              <RenderMenuItem
                key={item.id}
                item={item}
                onItemClick={onItemClick}
                onClose={handleClose} // Pass close handler
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <SheetFooter className="border-t p-4 mt-auto"> {/* Added mt-auto */}
          <div className="w-full space-y-4"> {/* Ensure full width */}
            {/* Credits & Notifications */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm">
                {iconExists(ICONS.COINS) ? (
                  <Icon iconId={ICONS.COINS} className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <span className="text-muted-foreground">$</span>
                )}
                <span>{remainingCredits} credits</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="relative">
                  {iconExists(ICONS.BELL) ? (
                    <Icon iconId={ICONS.BELL} className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <span className="text-muted-foreground">N</span>
                  )}
                  {notificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                      {notificationsCount}
                    </span>
                  )}
                </div>
                <span>Notifications</span>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-3 pt-4 border-t"> {/* Added pt-4 */}
                <Image
                  src={user.picture || ICONS.USER_FALLBACK}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                  onError={(e) => { e.currentTarget.src = ICONS.USER_FALLBACK; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Remove old aliases and base component
// export { MobileMenuBaseProps, MenuMobileProps, MobileMenuBase, MenuMobile }; // Removed

export default MobileMenu;
