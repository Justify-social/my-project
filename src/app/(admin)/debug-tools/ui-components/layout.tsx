'use client';

import React, { useState } from 'react';
import { UiComponentsSidebar } from '@/components/ui/organisms/navigation/sidebar/Sidebar-ui-components';
import { Heading } from '@/components/ui/atoms/typography';
import { Icon } from '@/components/ui/atoms/icons';
import Link from 'next/link';

// Component categories with their subcategories
interface Category {
  id: string;
  label: string;
  icon: string;
  items: Item[];
}

interface Item {
  id: string;
  label: string;
}

export default function UIComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create sidebar items from component categories
  const sidebarItems = [
    {
      id: 'atoms',
      label: 'Atoms',
      href: '#atoms',
      icon: 'faAtom',
      children: [
        { id: 'button', label: 'Button', href: '#atoms-button' },
        { id: 'typography', label: 'Typography', href: '#atoms-typography' },
        { id: 'input', label: 'Input', href: '#atoms-input' },
        { id: 'checkbox', label: 'Checkbox', href: '#atoms-checkbox' },
        { id: 'radio', label: 'Radio', href: '#atoms-radio' },
        { id: 'select', label: 'Select', href: '#atoms-select' },
        { id: 'textarea', label: 'Textarea', href: '#atoms-textarea' },
        { id: 'toggle', label: 'Toggle', href: '#atoms-toggle' },
        { id: 'spinner', label: 'Spinner', href: '#atoms-spinner' },
        { id: 'icon', label: 'Icon', href: '#atoms-icon' },
        { id: 'image', label: 'Image', href: '#atoms-image' },
        { id: 'layout', label: 'Layout Components', href: '#atoms-layout' },
      ]
    },
    {
      id: 'molecules',
      label: 'Molecules',
      href: '#molecules',
      icon: 'faDna',
      children: [
        { id: 'form-field', label: 'Form Field', href: '#molecules-form-field' },
        { id: 'search-bar', label: 'Search Bar', href: '#molecules-search-bar' },
        { id: 'search-results', label: 'Search Results', href: '#molecules-search-results' },
        { id: 'pagination', label: 'Pagination', href: '#molecules-pagination' },
        { id: 'breadcrumbs', label: 'Breadcrumbs', href: '#molecules-breadcrumbs' },
        { id: 'command-menu', label: 'Command Menu', href: '#molecules-command-menu' },
        { id: 'feedback', label: 'Feedback Components', href: '#molecules-feedback' },
        { id: 'skeleton', label: 'Skeleton', href: '#molecules-skeleton' },
        { id: 'tabs', label: 'Tabs', href: '#molecules-tabs' },
      ]
    },
    {
      id: 'organisms',
      label: 'Organisms',
      href: '#organisms',
      icon: 'faBacterium',
      children: [
        { id: 'card', label: 'Card', href: '#organisms-card' },
        { id: 'asset-card', label: 'Asset Card', href: '#organisms-asset-card' },
        { id: 'modal', label: 'Modal', href: '#organisms-modal' },
        { id: 'navigation', label: 'Navigation', href: '#organisms-navigation' },
        { id: 'error-fallback', label: 'Error Fallback', href: '#organisms-error-fallback' },
        { id: 'feedback', label: 'Feedback', href: '#organisms-feedback' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-work-sans">
      {/* Header */}
      <div className="fixed z-10 top-16 right-0 left-0 h-14 border-b border-gray-200 bg-white shadow-sm flex items-center px-6 ml-[240px]">
        <Heading level={4} className="text-gray-800">UI Component Library</Heading>
        <div className="ml-auto flex items-center space-x-4">
          <a 
            href="https://github.com/your-org/your-repo/tree/main/src/components/ui" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <Icon name="faGithub" />
            <span>View Source</span>
          </a>
        </div>
      </div>

      {/* Sidebar */}
      <UiComponentsSidebar
        items={sidebarItems}
        isMobileOpen={false}
        width="240px"
        footer={
          <Link
            href="/debug-tools"
            className="flex items-center py-2 pl-4 pr-2 rounded-md no-underline text-[#333333] hover:bg-gray-100"
          >
            <div className="w-6 h-6 mr-2 flex items-center justify-center flex-shrink-0 relative">
              <Icon 
                name="faArrowLeft" 
                className="text-[#333333]"
              />
            </div>
            <span className="flex-grow text-base font-sora font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis">
              Back to Debug Tools
            </span>
          </Link>
        }
      />

      {/* Main Content */}
      <div className="ml-[240px] pt-16 pb-8 px-6 min-h-screen">
        <main className="max-w-6xl mx-auto py-8 mt-14">
          {children}
        </main>
      </div>
    </div>
  );
} 