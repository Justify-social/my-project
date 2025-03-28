/**
 * Toast Component Styles
 * 
 * This file contains style utility functions for the Toast component.
 */

import { cn } from '@/utils/string/utils';
import { ToastType, ToastStyle, ToastPosition } from '../types';

/**
 * Get classes for toast container based on position
 */
export function getToastContainerClasses(position: ToastPosition): string {
  const positionClasses: Record<ToastPosition, string> = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2'
  };

  return cn(
    'fixed z-50 flex flex-col p-4 max-w-[420px] max-h-screen overflow-y-auto',
    positionClasses[position]
  );
}

/**
 * Get toast content base classes
 */
export function getToastBaseClasses(
  type: ToastType,
  style: ToastStyle
): string {
  // Base classes
  const baseClasses = 'flex shadow-lg rounded overflow-hidden';
  
  // Style-specific classes
  const styleClasses = {
    banner: 'w-full',
    compact: 'max-w-[420px]'
  };

  return cn(
    baseClasses,
    styleClasses[style]
  );
}

/**
 * Get toast type-specific classes (colors, icon, etc.)
 */
export function getToastTypeClasses(type: ToastType): {
  containerClasses: string;
  iconName: string;
  iconClasses: string;
} {
  const typeConfig: Record<ToastType, {
    containerClasses: string;
    iconName: string;
    iconClasses: string;
  }> = {
    success: {
      containerClasses: 'bg-green-50 border-l-4 border-green-500',
      iconName: 'faCheckCircle',
      iconClasses: 'text-green-500'
    },
    error: {
      containerClasses: 'bg-red-50 border-l-4 border-red-500',
      iconName: 'faExclamationCircle',
      iconClasses: 'text-red-500'
    },
    warning: {
      containerClasses: 'bg-amber-50 border-l-4 border-amber-500',
      iconName: 'faExclamationTriangle',
      iconClasses: 'text-amber-500'
    },
    info: {
      containerClasses: 'bg-blue-50 border-l-4 border-blue-500',
      iconName: 'faInfoCircle',
      iconClasses: 'text-blue-500'
    }
  };

  return typeConfig[type];
}

/**
 * Get classes for toast animation with Framer Motion
 */
export function getToastAnimationProps(position: ToastPosition): {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit: Record<string, any>;
  transition: Record<string, any>;
} {
  const isTop = position.startsWith('top');
  const isCenter = position.endsWith('center');

  const xValue = isCenter ? 0 : position.endsWith('left') ? -100 : 100;
  const yValue = isTop ? -100 : 100;

  return {
    initial: { 
      opacity: 0, 
      x: isCenter ? 0 : xValue, 
      y: isCenter ? yValue : 0,
      scale: 0.9
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      scale: 1
    },
    exit: { 
      opacity: 0, 
      x: isCenter ? 0 : xValue / 2, 
      y: isCenter ? yValue / 2 : 0,
      scale: 0.95
    },
    transition: { 
      duration: 0.2, 
      ease: "easeOut" 
    }
  };
} 