'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UiComponentsSidebar } from '@/components/ui/organisms/navigation/sidebar/Sidebar-ui-components';
import { Heading } from '@/components/ui/atoms/typography';
import { Icon } from '@/components/ui/atoms/icons';
import Image from 'next/image';
import { getIconPath } from '@/components/ui/atoms/icons';
import Link from 'next/link';
import clsx from 'clsx';

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
  // Create refs for icons
  const headerGithubIconRef = useRef<HTMLImageElement>(null);
  const footerGithubIconRef = useRef<HTMLImageElement>(null);
  const backArrowIconRef = useRef<HTMLImageElement>(null);

  // Helper function for icon filter
  const applyIconFilter = (ref: React.RefObject<HTMLImageElement>, apply: boolean) => {
    if (ref.current) {
      ref.current.style.filter = apply ? 
        'invert(50%) sepia(98%) saturate(3316%) hue-rotate(180deg) brightness(102%) contrast(101%)' : 
        'none';
    }
  };

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
            href="https://github.com/Justify-social/my-project" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center py-2 pl-4 pr-2 text-base font-sora font-medium hover:text-[#00BFFF] space-x-1 group transition-all duration-150"
            onMouseEnter={() => {
              applyIconFilter(headerGithubIconRef, true);
            }}
            onMouseLeave={() => {
              applyIconFilter(headerGithubIconRef, false);
            }}
          >
            <div className="h-6 w-6 flex items-center justify-center">
              <Image 
                src="/icons/brands/github.svg"
                alt="GitHub icon"
                width={20}
                height={20}
                className="w-5 h-5 header-github-icon"
                ref={headerGithubIconRef}
                style={{ 
                  filter: 'none',
                  transition: 'filter 0.15s ease-in-out'
                }}
                unoptimized
              />
            </div>
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
          <>
            {/* Footer items */}
            <div className="mt-auto">
              <div className="py-2">
                <a
                  href="https://github.com/Justify-social/my-project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 text-base font-sora font-medium text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]"
                  onMouseEnter={() => {
                    applyIconFilter(footerGithubIconRef, true);
                  }}
                  onMouseLeave={() => {
                    applyIconFilter(footerGithubIconRef, false);
                  }}
                >
                  <div className="mr-3 h-6 w-6 flex items-center justify-center">
                    <Image 
                      src="/icons/brands/github.svg"
                      alt="GitHub icon"
                      width={20}
                      height={20}
                      className="w-5 h-5 footer-github-icon"
                      ref={footerGithubIconRef}
                      style={{ 
                        filter: 'none',
                        transition: 'filter 0.15s ease-in-out'
                      }}
                      unoptimized
                    />
                  </div>
                  <span className="flex-grow truncate whitespace-nowrap overflow-hidden text-ellipsis">View Source</span>
                </a>

                <a
                  href="/admin/debug-tools"
                  className="flex items-center py-2 pl-4 pr-2 rounded-md transition-all duration-150 text-base font-sora font-medium text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]"
                  onMouseEnter={() => {
                    applyIconFilter(backArrowIconRef, true);
                  }}
                  onMouseLeave={() => {
                    applyIconFilter(backArrowIconRef, false);
                  }}
                >
                  <div className="mr-3 h-6 w-6 flex items-center justify-center relative">
                    <Image 
                      src="/icons/light/arrow-left.svg"
                      alt="Back arrow icon"
                      width={20}
                      height={20}
                      className="w-5 h-5 back-arrow-icon"
                      ref={backArrowIconRef}
                      style={{ 
                        filter: 'none',
                        transition: 'filter 0.15s ease-in-out'
                      }}
                      unoptimized
                    />
                  </div>
                  <span className="flex-grow truncate whitespace-nowrap overflow-hidden text-ellipsis">Back to Debug Tools</span>
                </a>
              </div>
            </div>
          </>
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