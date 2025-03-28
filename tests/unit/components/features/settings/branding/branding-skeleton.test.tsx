import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrandingSkeleton from '@/src/components/features/settings/branding/BrandingSkeleton';

describe('BrandingSkeleton', () => {
  test('renders skeleton sections correctly', () => {
    const { container } = render(<BrandingSkeleton />);
    
    // Check for main wrapper with spacing
    const mainWrapper = container.querySelector('.space-y-8');
    expect(mainWrapper).toBeInTheDocument();
    
    // Check for Card components
    const cards = container.querySelectorAll('.card');
    expect(cards.length).toBe(3); // Colors, Typography, Brand Logo sections
  });
  
  test('renders colors section skeleton', () => {
    const { container } = render(<BrandingSkeleton />);
    
    // The first card should be the colors section
    const cards = container.querySelectorAll('.card');
    const colorsSection = cards[0];
    
    // Check for grid layout
    const gridLayout = colorsSection.querySelector('.grid');
    expect(gridLayout).toBeInTheDocument();
    
    // Check for color picker placeholders
    const colorPickerFields = colorsSection.querySelectorAll('.flex.items-center.space-x-4');
    expect(colorPickerFields.length).toBeGreaterThan(0);
    
    // Check for color swatches
    const colorSwatches = colorsSection.querySelectorAll('.h-10.w-20');
    expect(colorSwatches.length).toBeGreaterThan(0);
  });
  
  test('renders typography section skeleton', () => {
    const { container } = render(<BrandingSkeleton />);
    
    // The second card should be the typography section
    const cards = container.querySelectorAll('.card');
    const typographySection = cards[1];
    
    // Check for grid layout
    const gridLayout = typographySection.querySelector('.grid');
    expect(gridLayout).toBeInTheDocument();
    
    // Check for font selector placeholders
    const fontSelectors = typographySection.querySelectorAll('.h-10');
    expect(fontSelectors.length).toBeGreaterThan(3); // Multiple font selectors
    
    // Check for typography preview
    const preview = typographySection.querySelector('.border.border-gray-200.rounded-lg');
    expect(preview).toBeInTheDocument();
  });
  
  test('renders brand logo section skeleton', () => {
    const { container } = render(<BrandingSkeleton />);
    
    // The third card should be the brand logo section
    const cards = container.querySelectorAll('.card');
    const logoSection = cards[2];
    
    // Check for upload area with dashed border
    const uploadArea = logoSection.querySelector('.border-dashed');
    expect(uploadArea).toBeInTheDocument();
    
    // Check for circular logo placeholder
    const logoPlaceholder = logoSection.querySelector('.rounded-full');
    expect(logoPlaceholder).toBeInTheDocument();
    
    // Check for upload button placeholder
    const buttonPlaceholder = logoSection.querySelector('.h-10.w-40');
    expect(buttonPlaceholder).toBeInTheDocument();
  });
  
  test('renders action button skeleton', () => {
    const { container } = render(<BrandingSkeleton />);
    
    // Check for action button at the bottom with right alignment
    const actionButtonWrapper = container.querySelector('.flex.justify-end');
    expect(actionButtonWrapper).toBeInTheDocument();
    
    const actionButton = actionButtonWrapper.querySelector('.h-10');
    expect(actionButton).toBeInTheDocument();
  });
}); 