import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileSettingsSkeleton from '@/src/components/features/users/profile/ProfileSettingsSkeleton';

describe('ProfileSettingsSkeleton', () => {
  test('renders skeleton sections correctly', () => {
    render(<ProfileSettingsSkeleton />);
    
    // The skeleton should render multiple Card components
    const cards = document.querySelectorAll('.card');
    expect(cards.length).toBeGreaterThan(0);
    
    // Each card should contain skeleton elements
    cards.forEach(card => {
      expect(card.querySelectorAll('.bg-gray-200').length).toBeGreaterThan(0);
    });
  });
  
  test('contains appropriate sections for profile settings', () => {
    const { container } = render(<ProfileSettingsSkeleton />);
    
    // Check for profile picture section (typically has a round avatar)
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
    
    // Check for form sections (fields in grid layouts)
    expect(container.querySelector('.grid')).toBeInTheDocument();
    
    // Should have multiple skeleton input fields (height-10 is typically used for inputs)
    const inputSkeletons = container.querySelectorAll('.h-10');
    expect(inputSkeletons.length).toBeGreaterThan(4);
  });
}); 