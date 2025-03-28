/**
 * Icon Component Tests
 * 
 * This file contains tests for the Icon component in the new structure.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Icon, StaticIcon, ButtonIcon } from '../index';

describe('Icon Component', () => {
  it('renders with basic props', () => {
    const { getByTestId } = render(<Icon name="faUser" data-testid="icon" />);
    const iconElement = getByTestId('icon');
    expect(iconElement).toBeDefined();
  });

  it('renders with size prop', () => {
    const { getByTestId } = render(<Icon name="faUser" size="lg" data-testid="icon" />);
    const iconElement = getByTestId('icon');
    // Check that classes are applied (implementation may vary)
    expect(iconElement.className).toContain('w-6');
    expect(iconElement.className).toContain('h-6');
  });

  it('renders with solid prop', () => {
    const { getByTestId } = render(<Icon name="faUser" solid data-testid="icon" />);
    const iconElement = getByTestId('icon');
    // Check data attribute is set
    expect(iconElement.getAttribute('data-icon-style')).toBe('solid');
  });

  it('renders with custom className', () => {
    const { getByTestId } = render(<Icon name="faUser" className="custom-class" data-testid="icon" />);
    const iconElement = getByTestId('icon');
    expect(iconElement.className).toContain('custom-class');
  });
});

describe('Icon Variants', () => {
  it('renders StaticIcon', () => {
    const { getByTestId } = render(<StaticIcon name="faUser" data-testid="static-icon" />);
    const iconElement = getByTestId('static-icon');
    expect(iconElement).toBeDefined();
    expect(iconElement.getAttribute('data-icon-type')).toBe('static');
  });

  it('renders ButtonIcon', () => {
    const { getByTestId } = render(<ButtonIcon name="faUser" data-testid="button-icon" />);
    const iconElement = getByTestId('button-icon');
    expect(iconElement).toBeDefined();
    expect(iconElement.getAttribute('data-icon-type')).toBe('button');
  });
});

describe('Icon Factory', () => {
  it('creates icon component with factory function', () => {
    const UserIcon = (props: React.ComponentProps<typeof Icon>) => (
      <Icon name="faUser" {...props} />
    );
    
    const { getByTestId } = render(<UserIcon data-testid="factory-icon" />);
    const iconElement = getByTestId('factory-icon');
    expect(iconElement).toBeDefined();
  });
}); 