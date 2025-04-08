import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /Click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex');
  });
  
  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="destructive">Destructive</Button>);
    
    let button = screen.getByRole('button', { name: /Destructive/i });
    expect(button).toHaveClass('bg-destructive');
    
    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /Outline/i });
    expect(button).toHaveClass('border');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /Secondary/i });
    expect(button).toHaveClass('bg-secondary');
    
    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: /Ghost/i });
    expect(button).toHaveClass('hover:bg-accent');
    
    rerender(<Button variant="link">Link</Button>);
    button = screen.getByRole('button', { name: /Link/i });
    expect(button).toHaveClass('text-primary');
  });
  
  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    
    let button = screen.getByRole('button', { name: /Default/i });
    expect(button).toHaveClass('h-10');
    
    rerender(<Button size="sm">Small</Button>);
    button = screen.getByRole('button', { name: /Small/i });
    expect(button).toHaveClass('h-9');
    
    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /Large/i });
    expect(button).toHaveClass('h-11');
    
    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button', { name: /Icon/i });
    expect(button).toHaveClass('h-10 w-10');
  });
  
  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: /Disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });
  
  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /Click me/i });
    
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /Disabled/i });
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
  
  it('applies custom className correctly', () => {
    render(<Button className="custom-class">Custom</Button>);
    
    const button = screen.getByRole('button', { name: /Custom/i });
    expect(button).toHaveClass('custom-class');
  });
}); 