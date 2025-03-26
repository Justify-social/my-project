"use client";

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icons';

// Tab configuration type definition
export interface TabConfig {
  id: string;
  label: string;
  href: string;
  icon: string;
  requiresAdmin?: boolean;
}

// Component props definition
interface NavigationTabsProps {
  isSuperAdmin?: boolean;
}

/**
 * NavigationTabs component for the settings pages
 * Displays tabs for navigating between different settings sections
 */
const NavigationTabs: React.FC<NavigationTabsProps> = memo(({
  isSuperAdmin = false
}) => {
  const pathname = usePathname();

  // Define settings tabs
  const tabs: TabConfig[] = [
    {
      id: 'profile',
      label: 'Profile Settings',
      href: '/settings/profile-settings',
      icon: 'circleUser',
      requiresAdmin: false
    }, 
    {
      id: 'team',
      label: 'Team Management',
      href: '/settings/team-management',
      icon: 'users',
      requiresAdmin: false
    }, 
    {
      id: 'branding',
      label: 'Branding',
      href: '/settings/branding',
      icon: 'palette',
      requiresAdmin: false
    }
  ];

  return (
    <div className="mb-8 border-b border-[#D1D5DB]">
      <nav className="flex space-x-1" aria-label="Settings navigation">
        {tabs.map((tab) => {
          // Skip tabs that require admin if user is not an admin
          if (tab.requiresAdmin && !isSuperAdmin) return null;
          
          // Check if current path matches this tab
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link 
              key={tab.id} 
              href={tab.href}
              className={`
                relative py-4 px-6 flex items-center transition-all duration-200
                ${isActive 
                  ? 'text-[#00BFFF] bg-[#FFFFFF] bg-opacity-50' 
                  : 'text-[#4A5568] hover:text-[#333333] hover:bg-[#FFFFFF]'}
                rounded-t-lg
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                name={tab.icon} 
                size="md"
                className="mr-2"
                solid={isActive}
              />
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00BFFF]" 
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
});

NavigationTabs.displayName = 'NavigationTabs';
export default NavigationTabs; 