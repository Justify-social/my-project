'use client';

import { useState, useEffect } from 'react';
import { Button as ServerButton, ButtonProps } from '@/components/ui';
import { getIconClasses } from '@/components/ui/utils/icon-integration';

/**
 * @component ButtonClient
 * @category atom
 * @renderType client
 * @description Client-side interactive version of the Button component with enhanced functionality
 * @author Frontend Team
 * @status stable
 * @since 2023-04-06
 * 
 * @example
 * <Button>Click me</Button>
 * 
 * @example
 * <Button variant="outline" onClick={() => alert('Clicked')}>
 *   Interactive Button
 * </Button>
 */
export function Button({ 
  children, 
  leftIcon,
  rightIcon,
  isLoading,
  isDisabled,
  onClick,
  ...props 
}: ButtonProps & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}) {
  const [isClicked, setIsClicked] = useState(false);
  
  // Handle button click with visual feedback
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    onClick?.(e);
    
    // Reset clicked state after animation
    setTimeout(() => {
      setIsClicked(false);
    }, 200);
  };
  
  return (
    <ServerButton 
      {...props} 
      disabled={isDisabled || isLoading}
      leftIcon={isLoading ? 'spinner' : leftIcon}
      rightIcon={rightIcon}
      onClick={handleClick}
      className={`${props.className || ''} ${isClicked ? 'scale-95' : ''} transition-transform duration-100`}
    >
      {children}
    </ServerButton>
  );
} 