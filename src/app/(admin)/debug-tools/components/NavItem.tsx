'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '../../../../../components/ui/atoms/icon/Icon';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  iconId?: string;
}

/**
 * Navigation item component for the admin sidebar
 */
export const NavItem: React.FC<NavItemProps> = ({
  href,
  children,
  active = false,
  iconId
}) => {
  const activeClasses = active
    ? 'bg-blue-50 text-blue-600'
    : 'text-gray-700 hover:bg-gray-100';

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeClasses}`}
    >
      {iconId && (
        <div className="mr-3 text-gray-500">
          <Icon name={iconId} size="sm" />
        </div>
      )}
      <span>{children}</span>
    </Link>
  );
};

export default NavItem; 