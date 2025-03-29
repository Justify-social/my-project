/**
 * Modal Component Styles
 * 
 * This file contains style utility functions for the Modal component.
 */

import { cn } from '@/utils/string/utils';
import { ModalSize } from '../types';

/**
 * Get classes for the modal container based on size
 */
export function getModalSizeClasses(size: ModalSize): string {
  const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };
  
  return sizeClasses[size];
}

/**
 * Get classes for the modal overlay
 */
export function getOverlayClasses(overlayClassName?: string): string {
  return cn(
    'fixed inset-0 bg-black bg-opacity-50 z-50 flex',
    overlayClassName
  );
}

/**
 * Get classes for the modal content
 */
export function getModalContentClasses({
  size = 'md',
  isCentered = true,
  className = ''
}: {
  size: ModalSize;
  isCentered?: boolean;
  className?: string;
}): string {
  return cn(
    'bg-white rounded-lg shadow-xl overflow-hidden w-full relative',
    isCentered ? 'm-auto' : 'mt-16',
    getModalSizeClasses(size),
    className
  );
}

/**
 * Get classes for the modal header
 */
export function getModalHeaderClasses(hasTitle: boolean): string {
  return cn(
    'px-6 py-4 border-b border-gray-200 flex items-center',
    hasTitle ? 'justify-between' : 'justify-end'
  );
}

/**
 * Get classes for the modal body
 */
export function getModalBodyClasses(customClass?: string): string {
  return cn(
    'px-6 py-4 overflow-auto',
    customClass
  );
}

/**
 * Get classes for the modal footer
 */
export function getModalFooterClasses(): string {
  return cn(
    'px-6 py-4 border-t border-gray-200 flex justify-end space-x-2'
  );
}

/**
 * Get classes for the close button
 */
export function getCloseButtonClasses(): string {
  return cn(
    'text-gray-500 hover:text-gray-700 focus:outline-none transition-colors'
  );
}

/**
 * Get animation properties for the modal
 */
export function getModalAnimationProps() {
  return {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    },
    content: {
      initial: { opacity: 0, y: -20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
      transition: { type: 'spring', duration: 0.3, bounce: 0.25 }
    }
  };
} 