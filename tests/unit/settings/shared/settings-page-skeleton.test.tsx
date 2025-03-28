import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPageSkeleton from '@/components/settings/shared/SettingsPageSkeleton';

describe('SettingsPageSkeleton', () => {
  test('renders correctly', () => {
    const { container } = render(<SettingsPageSkeleton />);
    
    // Should render a main container with flex and center alignment
    const mainContainer = container.querySelector('.flex');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('flex-col');
    expect(mainContainer).toHaveClass('justify-center');
    expect(mainContainer).toHaveClass('items-center');
  });
  
  test('contains multiple skeleton elements', () => {
    const { container } = render(<SettingsPageSkeleton />);
    
    // Should render multiple skeleton elements
    const skeletonElements = container.querySelectorAll('.bg-gray-200');
    expect(skeletonElements.length).toBeGreaterThan(1);
    
    // All skeleton elements should have animation
    skeletonElements.forEach(element => {
      expect(element).toHaveClass('animate-pulse');
    });
  });
  
  test('renders elements with appropriate sizes', () => {
    const { container } = render(<SettingsPageSkeleton />);
    
    // Should have a large title element
    const titleElement = container.querySelector('.h-8.w-64');
    expect(titleElement).toBeInTheDocument();
    
    // Should have a smaller subtitle element
    const subtitleElement = container.querySelector('.h-4.w-48');
    expect(subtitleElement).toBeInTheDocument();
    
    // Should have a button-like element
    const buttonElement = container.querySelector('.h-10.w-32');
    expect(buttonElement).toBeInTheDocument();
  });
  
  test('has proper spacing between elements', () => {
    const { container } = render(<SettingsPageSkeleton />);
    
    // Should have spacing between elements
    const mainContainer = container.querySelector('.space-y-4');
    expect(mainContainer).toBeInTheDocument();
    
    // Should have extra margin around the button area
    const buttonWrapper = container.querySelector('.mt-4');
    expect(buttonWrapper).toBeInTheDocument();
  });
}); 