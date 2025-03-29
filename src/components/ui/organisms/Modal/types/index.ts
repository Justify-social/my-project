/**
 * Modal Component Types
 * 
 * This file contains type definitions for the Modal component.
 */

import React from 'react';

/**
 * Available modal sizes
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal component props
 */
export interface ModalProps {
  /**
   * Whether the modal is open/visible
   */
  isOpen: boolean;
  
  /**
   * Function called when the modal is closed
   */
  onClose: () => void;
  
  /**
   * The content of the modal
   */
  children: React.ReactNode;
  
  /**
   * Title for the modal header
   */
  title?: React.ReactNode;
  
  /**
   * Size of the modal
   * @default "md"
   */
  size?: ModalSize;
  
  /**
   * Whether to close the modal when clicked outside
   * @default true
   */
  closeOnOverlayClick?: boolean;
  
  /**
   * Whether to close the modal when escape key is pressed
   * @default true
   */
  closeOnEsc?: boolean;
  
  /**
   * Additional class name for the modal content
   */
  className?: string;
  
  /**
   * Additional class name for the overlay
   */
  overlayClassName?: string;
  
  /**
   * Whether to show a close button in the header
   * @default true
   */
  showCloseButton?: boolean;
  
  /**
   * Custom footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Whether the modal is centered on the screen
   * @default true
   */
  isCentered?: boolean;
  
  /**
   * Whether the modal should prevent body scrolling when open
   * @default true
   */
  blockScroll?: boolean;
  
  /**
   * ID for the modal (for accessibility)
   */
  id?: string;
}

export default ModalProps; 