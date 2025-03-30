import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from '../';
import { Icon } from '@/components/ui/atoms/icons'

/**
 * Examples of the Breadcrumbs component
 */
export default function BreadcrumbsExamples() {
  // Basic breadcrumbs example
  const basicItems: BreadcrumbItem[] = [
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'category', label: 'Electronics', href: '/products/electronics' },
    { id: 'current', label: 'Smartphones', href: '/products/electronics/smartphones', isCurrent: true }
  ];
  
  // Longer breadcrumbs path to demonstrate truncation
  const longPathItems: BreadcrumbItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'fa-dashboard' },
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'category', label: 'Electronics', href: '/products/electronics' },
    { id: 'subcategory', label: 'Computers', href: '/products/electronics/computers' },
    { id: 'type', label: 'Laptops', href: '/products/electronics/computers/laptops' },
    { id: 'brand', label: 'Apple', href: '/products/electronics/computers/laptops/apple' },
    { id: 'current', label: 'MacBook Pro', href: '/products/electronics/computers/laptops/apple/macbook-pro', isCurrent: true }
  ];
  
  // Custom icon breadcrumbs
  const customIconItems: BreadcrumbItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'fa-tachometer-alt' },
    { id: 'users', label: 'Users', href: '/users', icon: 'fa-users' },
    { id: 'current', label: 'User Profile', href: '/users/profile', icon: 'fa-user', isCurrent: true }
  ];
  
  return (
    <div className="space-y-8 p-4">
      <section>
        <h2 className="text-lg font-semibold mb-2">Basic Breadcrumbs</h2>
        <p className="text-sm text-gray-500 mb-4">Default configuration with home icon</p>
        <div className="p-4 border border-gray-200 rounded-md">
          <Breadcrumbs items={basicItems} />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-2">Truncated Breadcrumbs</h2>
        <p className="text-sm text-gray-500 mb-4">Long path truncated to show 5 items max</p>
        <div className="p-4 border border-gray-200 rounded-md">
          <Breadcrumbs
            items={longPathItems}
            maxItems={5}
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-2">Custom Icons</h2>
        <p className="text-sm text-gray-500 mb-4">Breadcrumbs with custom icons for each item</p>
        <div className="p-4 border border-gray-200 rounded-md">
          <Breadcrumbs items={customIconItems} />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-2">Custom Separator</h2>
        <p className="text-sm text-gray-500 mb-4">Using a custom separator icon</p>
        <div className="p-4 border border-gray-200 rounded-md">
          <Breadcrumbs
            items={basicItems}
            separator={<Icon name="fa-chevron-right" size="xs" className="text-gray-400" />}
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-2">Custom Styling</h2>
        <p className="text-sm text-gray-500 mb-4">Custom styling applied to breadcrumbs</p>
        <div className="p-4 border border-gray-200 rounded-md bg-gray-100">
          <Breadcrumbs
            items={basicItems}
            className="font-semibold"
            itemClassName="rounded py-1 px-2 hover:bg-white"
            activeClassName="bg-[var(--accent-color)] text-white rounded py-1 px-2"
            separatorClassName="text-gray-500"
          />
        </div>
      </section>
    </div>
  );
} 