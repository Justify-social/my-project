import React, { useState } from 'react';
import { Pagination } from '../';
import { Icon } from '@/components/ui/atoms/icons';

/**
 * Examples of the Pagination component
 */
export default function PaginationExamples() {
  // State for the current page in each example
  const [basicPage, setBasicPage] = useState(1);
  const [largePage, setLargePage] = useState(1);
  const [customPage, setCustomPage] = useState(1);
  const [sizePage, setSizePage] = useState(3);
  const [minimalPage, setMinimalPage] = useState(5);
  
  return (
    <div className="space-y-10 p-4">
      <section>
        <h2 className="text-lg font-semibold mb-2">Basic Pagination</h2>
        <p className="text-sm text-gray-500 mb-4">Default configuration with 10 pages</p>
        <div className="p-4 border border-gray-200 rounded-md">
          <Pagination
            totalPages={10}
            currentPage={basicPage}
            onPageChange={setBasicPage}
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-2">Pagination with Many Pages</h2>
        <p className="text-sm text-gray-500 mb-4">Showing 100 total pages with truncation</p>
        <div className="p-4 border border-gray-200 rounded-md">
          <Pagination
            totalPages={100}
            currentPage={largePage}
            onPageChange={setLargePage}
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-2">Custom Styling</h2>
        <p className="text-sm text-gray-500 mb-4">Custom appearance with different active color</p>
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <Pagination
            totalPages={10}
            currentPage={customPage}
            onPageChange={setCustomPage}
            buttonClassName="font-medium"
            activeClassName="bg-green-600 text-white border-green-600"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-2">Different Sizes</h2>
        <p className="text-sm text-gray-500 mb-4">Small, medium, and large size variants</p>
        <div className="p-4 border border-gray-200 rounded-md space-y-4">
          <Pagination
            totalPages={10}
            currentPage={sizePage}
            onPageChange={setSizePage}
            size="sm"
          />
          <Pagination
            totalPages={10}
            currentPage={sizePage}
            onPageChange={setSizePage}
            size="md"
          />
          <Pagination
            totalPages={10}
            currentPage={sizePage}
            onPageChange={setSizePage}
            size="lg"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-2">Minimal Configuration</h2>
        <p className="text-sm text-gray-500 mb-4">Without first/last buttons and custom labels</p>
        <div className="p-4 border border-gray-200 rounded-md">
          <Pagination
            totalPages={10}
            currentPage={minimalPage}
            onPageChange={setMinimalPage}
            showFirstLast={false}
            previousLabel={<Icon name="faAngleLeft" size="sm" />}
            nextLabel={<Icon name="faAngleRight" size="sm" />}
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-2">Custom Rendering</h2>
        <p className="text-sm text-gray-500 mb-4">Custom page button rendering</p>
        <div className="p-4 border border-gray-200 rounded-md">
          <Pagination
            totalPages={10}
            currentPage={basicPage}
            onPageChange={setBasicPage}
            renderPageButton={(page, isActive) => (
              <div className={`rounded-full w-8 h-8 flex items-center justify-center ${
                isActive ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100'
              }`}>
                {page}
              </div>
            )}
            buttonClassName="border-none"
          />
        </div>
      </section>
    </div>
  );
} 