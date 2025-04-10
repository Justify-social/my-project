'use client';

import React, { useState } from 'react';
import { Button as ServerButton, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon'; // Import Icon component

/**
 * @component ButtonClient
 * @category atom
 * @renderType client
 * @description Client-side interactive version of the Button component with enhanced functionality
 * @author Frontend Team
 * @status 10th April
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

// Define specific props for the client button, extending the base ButtonProps
// Remove leftIcon and rightIcon as they are not supported by the base Button
interface ClientButtonProps extends ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function Button({
  children,
  isLoading,
  isDisabled,
  onClick,
  ...props // props are the remaining ButtonProps from the base interface
}: ClientButtonProps) {
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
      {...props} // Pass the base ButtonProps
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      className={cn(props.className, isClicked ? 'scale-95' : '', 'transition-transform duration-100')}
    >
      {isLoading ? (
        <>
          <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" />
          Processing...
        </>
      ) : (
        children
      )}
    </ServerButton>
  );
} 