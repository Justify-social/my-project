/**
 * Icon Component Tests
 * 
 * This file contains tests for the Icon component in the new structure.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Icon, SolidIcon, LightIcon } from '../../../../../src/components/ui/atoms/icon';

// Mock all of the icon module
jest.mock('../../../../../src/components/ui/atoms/icon', () => {
  const originalModule = jest.requireActual('../../../../../src/components/ui/atoms/icon');
  
  // Create a mock for getIconPath
  const getIconPathMock = jest.fn((name, variant) => `/mock/icons/${variant}/${name}.svg`);
  
  return {
    ...originalModule,
    getIconPath: getIconPathMock,
    Icon: jest.fn(props => {
      // Simple mock implementation that renders a span with attributes
      return <span data-testid={props['data-testid'] || 'icon'} className={props.className || ''} />;
    }),
    SolidIcon: jest.fn(props => <span data-testid={props['data-testid'] || 'solid-icon'} />),
    LightIcon: jest.fn(props => <span data-testid={props['data-testid'] || 'light-icon'} />),
  };
});

// Get the mocked function
const getIconPath = jest.requireMock('../../../../../src/components/ui/atoms/icon').getIconPath;

describe('Icon Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with basic props', () => {
    const { getByTestId } = render(<Icon name="faUser" />);
    expect(getByTestId('icon')).toBeDefined();
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