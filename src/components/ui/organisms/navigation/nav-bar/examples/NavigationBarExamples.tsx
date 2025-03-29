import React from 'react';
import { NavigationBar } from '../NavigationBar';
import { NavItem } from '../types';

/**
 * Examples of NavigationBar usage for documentation and testing
 */
export const NavigationBarExamples: React.FC = () => {
  // Example logo component
  const Logo = () => (
    <div className="flex items-center">
      <span className="text-primary-color font-bold text-xl">Brand</span>
    </div>
  );

  // Example user menu component
  const UserMenu = () => (
    <div className="flex items-center space-x-3">
      <button
        type="button"
        className="p-1 rounded-full text-gray-500 hover:text-primary-color focus:outline-none"
      >
        <span className="sr-only">View notifications</span>
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>
      <div className="flex items-center">
        <img
          className="h-8 w-8 rounded-full"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt="User avatar"
        />
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">John Doe</span>
      </div>
    </div>
  );

  // Example navigation items
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: 'faHome',
      isActive: true,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'faChartSimple',
    },
    {
      id: 'projects',
      label: 'Projects',
      href: '/projects',
      icon: 'faFolderOpen',
      children: [
        {
          id: 'active',
          label: 'Active Projects',
          href: '/projects/active',
        },
        {
          id: 'archived',
          label: 'Archived Projects',
          href: '/projects/archived',
        },
        {
          id: 'create',
          label: 'Create New',
          href: '/projects/create',
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: 'faGear',
    },
    {
      id: 'help',
      label: 'Help & Support',
      href: '/help',
      icon: 'faQuestionCircle',
      badge: 'New',
    },
    {
      id: 'disabled',
      label: 'Disabled Item',
      href: '/disabled',
      icon: 'faLock',
      isDisabled: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <h3 className="p-4 border-b border-gray-200 font-medium">Default Navigation Bar</h3>
        <div className="p-4">
          <NavigationBar 
            logo={<Logo />} 
            items={navItems}
            rightContent={<UserMenu />}
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <h3 className="p-4 border-b border-gray-200 font-medium">Transparent Navigation Bar</h3>
        <div className="p-4 bg-gray-800">
          <NavigationBar 
            logo={<Logo />} 
            items={navItems}
            rightContent={<UserMenu />}
            variant="transparent"
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <h3 className="p-4 border-b border-gray-200 font-medium">Subtle Navigation Bar</h3>
        <div className="p-4">
          <NavigationBar 
            logo={<Logo />} 
            items={navItems}
            rightContent={<UserMenu />}
            variant="subtle"
            withShadow={false}
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <h3 className="p-4 border-b border-gray-200 font-medium">Without Mobile Menu</h3>
        <div className="p-4">
          <NavigationBar 
            logo={<Logo />} 
            items={navItems}
            rightContent={<UserMenu />}
            mobileMenuEnabled={false}
          />
        </div>
      </div>
    </div>
  );
};

export default NavigationBarExamples; 