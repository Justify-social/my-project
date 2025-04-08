/**
 * @component CategoryTabs
 * @description Category filter tabs for the UI component browser
 */
'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';

interface CategoryTab {
  id: string;
  label: string;
  count: number;
}

interface CategoryTabsProps {
  categories: CategoryTab[];
  activeCategory: string;
}

export function CategoryTabs({ categories, activeCategory = 'all' }: CategoryTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    // Update category param
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    // Preserve search query if present
    const query = searchParams?.get('query');
    if (query) {
      params.set('query', query);
    }
    
    // Preserve view mode if present
    const view = searchParams?.get('view');
    if (view) {
      params.set('view', view);
    }
    
    // Update URL
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
      <TabsList className="mb-4 flex flex-wrap gap-1">
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="flex items-center gap-2"
          >
            <span className="capitalize">{category.label}</span>
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-gray-600 bg-gray-100 rounded-full">
              {category.count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default CategoryTabs; 