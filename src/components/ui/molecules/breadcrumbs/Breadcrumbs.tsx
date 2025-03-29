import React from 'react';
import { cn } from '@/utils/string/utils';
import { BreadcrumbsProps, BreadcrumbItem } from './types';
import { Icon } from '@/components/ui/atoms/icons';

/**
 * Breadcrumbs component for navigation hierarchy
 * 
 * Features:
 * - Responsive design with optional truncation for long paths
 * - Home icon/link support
 * - Customizable separators
 * - Active/current page highlighting
 * - Icon support for individual items
 */
export function Breadcrumbs({
  items = [],
  maxItems,
  homeText = 'Home',
  homeIcon = 'fa-home',
  homeHref = '/',
  separator = '/',
  className,
  itemClassName,
  activeClassName,
  separatorClassName
}: BreadcrumbsProps) {
  // If items is undefined or empty, use a default home item
  if (!items || items.length === 0) {
    items = [{ id: 'home', label: homeText, href: homeHref, icon: homeIcon }];
  }

  // Home breadcrumb is prepended to items if not already present
  const breadcrumbItems: BreadcrumbItem[] = 
    items[0]?.href === homeHref 
      ? items 
      : [{ id: 'home', label: homeText, href: homeHref, icon: homeIcon }, ...items];
  
  // Truncate items if maxItems is specified and there are more items than maxItems
  let displayItems = breadcrumbItems;
  if (maxItems && breadcrumbItems.length > maxItems) {
    const firstCount = Math.ceil(maxItems / 2);
    const lastCount = Math.floor(maxItems / 2);
    
    const firstItems = breadcrumbItems.slice(0, firstCount);
    const lastItems = breadcrumbItems.slice(-lastCount);
    
    // Create a truncation item
    const truncationItem: BreadcrumbItem = {
      id: 'truncation',
      label: '...',
      href: '#',
      isCurrent: false
    };
    
    displayItems = [...firstItems, truncationItem, ...lastItems];
  }
  
  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)}>
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          
          return (
            <li key={item.id} className="inline-flex items-center">
              {index > 0 && (
                <span 
                  className={cn(
                    'mx-1 md:mx-2 text-gray-400 select-none', 
                    separatorClassName
                  )}
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
              
              {item.isCurrent || isLast ? (
                <span 
                  className={cn(
                    'text-[var(--accent-color)] font-medium',
                    'text-sm',
                    activeClassName,
                    itemClassName
                  )}
                  aria-current="page"
                >
                  {item.icon && (
                    <Icon 
                      name={item.icon} 
                      className="mr-1 inline-block"
                      size="sm"
                    />
                  )}
                  {item.label}
                </span>
              ) : item.id === 'truncation' ? (
                <span className={cn('text-gray-500 text-sm', itemClassName)}>
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className={cn(
                    'text-gray-600 hover:text-[var(--accent-color)] text-sm',
                    'transition-colors duration-200',
                    itemClassName
                  )}
                >
                  {item.icon && (
                    <Icon 
                      name={item.icon} 
                      className="mr-1 inline-block"
                      size="sm"
                    />
                  )}
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs; 