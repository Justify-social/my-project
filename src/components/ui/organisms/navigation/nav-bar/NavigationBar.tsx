'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/atoms/icons';
import { NavigationBarProps, NavItem } from './types';
import { 
  navBarStyles, 
  navItemStyles, 
  mobileMenuButtonStyles,
  mobileMenuStyles
} from './styles';
import { cn } from '@/utils/string/utils';

/**
 * NavigationBar component for primary application navigation
 * 
 * @example
 * ```tsx
 * <NavigationBar 
 *   logo={<Logo />}
 *   items={[
 *     { id: 'home', label: 'Home', href: '/', icon: 'faHome', isActive: true },
 *     { id: 'about', label: 'About', href: '/about', icon: 'faInfoCircle' },
 *     { id: 'contact', label: 'Contact', href: '/contact', icon: 'faEnvelope' },
 *   ]}
 *   rightContent={<UserMenu />}
 * />
 * ```
 */
export const NavigationBar: React.FC<NavigationBarProps> = ({
  logo,
  items,
  rightContent,
  mobileMenuEnabled = true,
  className,
  variant = 'default',
  position = 'relative',
  withShadow = true,
  onItemClick,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleItemClick = (item: NavItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
    setIsMobileMenuOpen(false);
  };

  // Render a navigation item (desktop or mobile)
  const renderNavItem = (item: NavItem, isMobile: boolean = false) => {
    const itemClasses = navItemStyles({
      isActive: item.isActive,
      isDisabled: item.isDisabled,
      className: isMobile ? 'w-full' : '',
    });

    return (
      <a
        key={item.id}
        href={item.href}
        className={itemClasses}
        onClick={(e) => {
          if (item.isDisabled) {
            e.preventDefault();
            return;
          }
          handleItemClick(item);
        }}
        aria-current={item.isActive ? 'page' : undefined}
      >
        {item.icon && <Icon name={item.icon} size="sm" />}
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-color text-white">
            {item.badge}
          </span>
        )}
        {item.children && (
          <Icon name="faChevronDown" size="xs" className="ml-1" />
        )}
      </a>
    );
  };

  // Render dropdown menu for items with children
  const renderDropdown = (item: NavItem) => {
    if (!item.children || item.children.length === 0) return null;

    return (
      <div className="relative group">
        {renderNavItem({...item, href: item.href || '#'})}
        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-1">
            {item.children.map((childItem) => (
              <a
                key={childItem.id}
                href={childItem.href}
                className={navItemStyles({ 
                  isActive: childItem.isActive,
                  isDisabled: childItem.isDisabled,
                  className: 'block w-full'
                })}
                onClick={(e) => {
                  if (childItem.isDisabled) {
                    e.preventDefault();
                    return;
                  }
                  handleItemClick(childItem);
                }}
              >
                {childItem.icon && <Icon name={childItem.icon} size="sm" />}
                <span>{childItem.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className={navBarStyles({ variant, position, withShadow, className })}>
      {/* Logo section */}
      <div className="flex-shrink-0 flex items-center h-16">
        {logo}
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex md:items-center md:space-x-4">
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {item.children && item.children.length > 0
              ? renderDropdown(item)
              : renderNavItem(item)
            }
          </React.Fragment>
        ))}
      </div>

      {/* Right content section */}
      {rightContent && (
        <div className="hidden md:flex md:items-center">
          {rightContent}
        </div>
      )}

      {/* Mobile menu button */}
      {mobileMenuEnabled && (
        <button
          type="button"
          className={mobileMenuButtonStyles({ variant })}
          aria-expanded={isMobileMenuOpen}
          onClick={toggleMobileMenu}
        >
          <span className="sr-only">Open main menu</span>
          {!isMobileMenuOpen ? (
            <Icon name="faBars" aria-hidden="true" />
          ) : (
            <Icon name="faXmark" aria-hidden="true" />
          )}
        </button>
      )}

      {/* Mobile menu */}
      {mobileMenuEnabled && (
        <div
          className={mobileMenuStyles({
            isOpen: isMobileMenuOpen,
            variant
          })}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {items.map((item) => (
              <div key={item.id} className="w-full">
                {renderNavItem(item, true)}
                {item.children && item.children.length > 0 && (
                  <div className="pl-4 mt-1 space-y-1">
                    {item.children.map((childItem) => (
                      renderNavItem(childItem, true)
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {rightContent && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="px-2">
                {rightContent}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavigationBar; 