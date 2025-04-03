/**
 * Icon Component Tests
 * 
 * This file contains tests for the Icon component in the new structure.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Icon, LightIcon, SolidIcon } from '../../../../../src/components/ui/atoms/icon/Icon';

// Mock the getIconPath function
jest.mock('../../../../../src/components/ui/atoms/icon/icons', () => ({
  getIconPath: jest.fn((name, variant) => `/mock/icons/${variant}/${name}.svg`),
  iconExists: jest.fn(() => true)
}));

// Import the mocked function for assertions
import { getIconPath } from '../../../../../src/components/ui/atoms/icon/icons';

describe('Icon Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with basic props', () => {
    const { getByRole } = render(<Icon name="faUser" />);
    const imgElement = getByRole('img');
    expect(imgElement).toBeDefined();
    expect(imgElement.getAttribute('src')).toContain('faUser');
    expect(getIconPath).toHaveBeenCalledWith('faUser', 'light');
  });

  it('renders with size prop', () => {
    const { container } = render(<Icon name="faUser" size="lg" />);
    const spanElement = container.firstChild as HTMLElement;
    expect(spanElement).toBeDefined();
    expect(spanElement.className).toContain('w-6');
    expect(spanElement.className).toContain('h-6');
  });

  it('renders with variant prop', () => {
    const { getByRole } = render(<Icon name="faUser" variant="solid" />);
    expect(getIconPath).toHaveBeenCalledWith('faUser', 'solid');
  });

  it('renders with custom className', () => {
    const { container } = render(<Icon name="faUser" className="custom-class" />);
    const spanElement = container.firstChild as HTMLElement;
    expect(spanElement).toBeDefined();
    expect(spanElement.className).toContain('custom-class');
  });

  it('handles active state by using solid variant', () => {
    const { getByRole } = render(<Icon name="faUser" active={true} />);
    expect(getIconPath).toHaveBeenCalledWith('faUser', 'solid');
  });

  it('handles explicit Solid suffix in name', () => {
    const { getByRole } = render(<Icon name="faUserSolid" variant="light" />);
    expect(getIconPath).toHaveBeenCalledWith('faUserSolid', 'solid');
  });

  it('handles explicit Light suffix in name', () => {
    const { getByRole } = render(<Icon name="faUserLight" variant="solid" />);
    // The component should still pass the name with suffix, but the getIconPath function
    // will handle the suffix internally
    expect(getIconPath).toHaveBeenCalledWith('faUserLight', 'light');
  });
});

describe('Icon Variants', () => {
  it('renders SolidIcon with solid variant', () => {
    const { getByRole } = render(<SolidIcon name="faUser" />);
    expect(getIconPath).toHaveBeenCalledWith('faUser', 'solid');
  });

  it('renders LightIcon with light variant', () => {
    const { getByRole } = render(<LightIcon name="faUser" />);
    expect(getIconPath).toHaveBeenCalledWith('faUser', 'light');
  });
});

describe('Icon Factory', () => {
  it('creates icon component with factory function', () => {
    const UserIcon = (props: Omit<React.ComponentProps<typeof Icon>, 'name'>) => (
      <Icon name="faUser" {...props} />
    );
    
    const { getByRole } = render(<UserIcon />);
    const imgElement = getByRole('img');
    expect(imgElement).toBeDefined();
    expect(getIconPath).toHaveBeenCalledWith('faUser', 'light');
  });
}); 