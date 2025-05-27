/**
 * @component Tooltip
 * @category molecule
 * @subcategory overlay
 * @description A bulletproof popup that displays information related to an element when focused or hovered.
 * Features auto z-index detection, portal rendering, and consistent styling across the application.
 * @status Enhanced - 2025-01-27
 */
'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

// Hook to detect highest z-index in viewport
const useMaxZIndex = () => {
  const [maxZIndex, setMaxZIndex] = React.useState(9999);

  React.useEffect(() => {
    const detectMaxZIndex = () => {
      const allElements = document.querySelectorAll('*');
      let highestZIndex = 9999;

      Array.from(allElements).forEach(element => {
        const zIndex = window.getComputedStyle(element).zIndex;
        const numZIndex = parseInt(zIndex, 10);
        if (!isNaN(numZIndex) && numZIndex > highestZIndex) {
          highestZIndex = numZIndex;
        }
      });

      // Ensure we're always above everything else
      setMaxZIndex(Math.max(highestZIndex + 100, 9999));
    };

    // Initial detection
    detectMaxZIndex();

    // Re-detect on DOM changes (debounced)
    const observer = new MutationObserver(() => {
      clearTimeout(window.tooltipZIndexTimer);
      window.tooltipZIndexTimer = setTimeout(detectMaxZIndex, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      observer.disconnect();
      clearTimeout(window.tooltipZIndexTimer);
    };
  }, []);

  return maxZIndex;
};

// Enhanced TooltipProvider with portal management
const TooltipProvider: React.FC<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider> & {
    usePortal?: boolean;
  }
> = ({ usePortal = false, ...props }) => {
  if (usePortal && typeof document !== 'undefined') {
    return createPortal(<TooltipPrimitive.Provider {...props} />, document.body);
  }
  return <TooltipPrimitive.Provider {...props} />;
};

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    usePortal?: boolean;
    forceHighZ?: boolean;
  }
>(({ className, sideOffset = 8, usePortal = false, forceHighZ = true, ...props }, ref) => {
  const dynamicZIndex = useMaxZIndex();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const finalZIndex = forceHighZ ? dynamicZIndex : 9999;

  const tooltipContent = (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      avoidCollisions={true}
      collisionPadding={8}
      hideWhenDetached={true}
      className={cn(
        // Dynamic z-index to ensure tooltips appear above all components
        'z-[9999]',
        // Width constraints for optimal readability
        'min-w-64 max-w-lg',
        // Enhanced styling for maximum visibility and contrast
        'overflow-hidden rounded-lg border-2 shadow-2xl',
        'bg-gray-900 text-white border-gray-700',
        // Typography and spacing for optimal UX
        'px-4 py-3 text-sm font-medium leading-relaxed',
        // Smooth animations with hardware acceleration
        'animate-in fade-in-0 zoom-in-95 duration-200',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        'origin-[--radix-tooltip-content-transform-origin]',
        // Force new stacking context for maximum control
        'relative will-change-transform',
        // Prevent text selection and ensure readability
        'select-none break-words',
        className
      )}
      style={{
        // Inline styles for maximum specificity and control
        zIndex: finalZIndex,
        isolation: 'isolate',
        transform: 'translateZ(0)',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        // Ensure maximum contrast
        WebkitTextStroke: '0.1px transparent',
        ...props.style,
      }}
      {...props}
    />
  );

  // Use portal for complex layouts where z-index conflicts might occur
  if (usePortal && mounted && typeof document !== 'undefined') {
    return createPortal(tooltipContent, document.body);
  }

  return tooltipContent;
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Declare global for TypeScript
declare global {
  interface Window {
    tooltipZIndexTimer: NodeJS.Timeout;
  }
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
