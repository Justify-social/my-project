'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Switch component
export interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  // Add additional props here
}

export const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-switch', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Switch.displayName = 'Switch';

/**
 * SwitchComponents - Combined component exporting all subcomponents
 * 
 * This component is the default export to ensure compatibility with dynamic imports.
 */
const SwitchComponents = {
  Switch
};

export default Switch;
