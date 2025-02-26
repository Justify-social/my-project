import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  PhotoIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export interface TabConfig {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
}

interface NavigationTabsProps {
  activeTab: string;
  isSuperAdmin: boolean;
  onTabChange: (tab: string) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = memo(({ activeTab, isSuperAdmin, onTabChange }) => {
  const tabs: TabConfig[] = [
    { 
      id: 'profile', 
      label: 'Profile Settings', 
      href: '/settings',
      icon: UserCircleIcon
    },
    { 
      id: 'team', 
      label: 'Team Management', 
      href: '/settings/team-management',
      icon: UserCircleIcon
    },
    { 
      id: 'branding', 
      label: 'Branding', 
      href: '/settings/branding',
      icon: PhotoIcon
    },
    {
      id: 'admin',
      label: 'Super Admin Console',
      href: '/admin',
      requiresAdmin: true,
      icon: KeyIcon
    },
  ];

  return (
    <div className="mb-8 border-b border-[var(--divider-color)]">
      <nav className="flex space-x-1" aria-label="Settings navigation">
        {tabs.map((tab) => {
          if (tab.requiresAdmin && !isSuperAdmin) return null;
          
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative py-4 px-6 flex items-center transition-all duration-200
                ${isActive 
                  ? 'text-[var(--accent-color)] bg-[var(--background-color)] bg-opacity-50' 
                  : 'text-[var(--secondary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--background-color)]'}
                rounded-t-lg
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {IconComponent && <IconComponent className="w-5 h-5 mr-2" />}
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)]"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
});

NavigationTabs.displayName = 'NavigationTabs';

export default NavigationTabs; 