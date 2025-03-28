import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamManagementSkeleton from '@/src/components/features/settings/team/TeamManagementSkeleton';

describe('TeamManagementSkeleton', () => {
  test('renders skeleton sections correctly', () => {
    const { container } = render(<TeamManagementSkeleton />);
    
    // Check for Card components
    const cards = container.querySelectorAll('.card');
    expect(cards.length).toBeGreaterThan(1);
    
    // Check for title skeleton elements
    const titleSkeletons = container.querySelectorAll('.w-1\\/3');
    expect(titleSkeletons.length).toBeGreaterThan(1);
  });
  
  test('renders members list table skeleton', () => {
    const { container } = render(<TeamManagementSkeleton />);
    
    // Check for table skeleton
    const tableSkeleton = container.querySelector('table');
    expect(tableSkeleton).toBeInTheDocument();
    
    // Check for rows in the table
    const tableRows = container.querySelectorAll('tr');
    expect(tableRows.length).toBeGreaterThan(0);
    
    // Check for filter component
    const filterElement = container.querySelector('[data-testid="filter-skeleton"]');
    expect(filterElement).toBeInTheDocument();
  });
  
  test('renders role cards skeleton', () => {
    const { container } = render(<TeamManagementSkeleton />);
    
    // Check for grid layout for role cards
    const gridLayout = container.querySelector('.grid-cols-1.md\\:grid-cols-3');
    expect(gridLayout).toBeInTheDocument();
    
    // Check for three role cards
    const roleCards = container.querySelectorAll('.border.border-gray-200.rounded-lg.p-4');
    expect(roleCards.length).toBe(3);
    
    // Each role card should have avatar and text elements
    roleCards.forEach(card => {
      const avatar = card.querySelector('.rounded-full');
      expect(avatar).toBeInTheDocument();
      
      // Check for permission list items
      const permissionItems = card.querySelectorAll('.flex.items-center');
      expect(permissionItems.length).toBeGreaterThan(0);
    });
  });
  
  test('renders action button skeleton', () => {
    const { container } = render(<TeamManagementSkeleton />);
    
    // Check for action button at the bottom
    const actionButton = container.querySelector('.flex.justify-end .h-10');
    expect(actionButton).toBeInTheDocument();
  });
}); 