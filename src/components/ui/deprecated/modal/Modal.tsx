'use client';

import React, { useEffect, useRef } from 'react';
import Modal from '../Modal/index';
import HTMLDivElement from '../radio/types/index';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@/components/ui/atoms/icons';
import { ModalProps } from './types';
import {
  getOverlayClasses,
  getModalContentClasses,
  getModalHeaderClasses,
  getModalBodyClasses,
  getModalFooterClasses,
  getCloseButtonClasses,
  getModalAnimationProps
} from './styles/modal.styles';

/**
 * Modal component with smooth transitions and accessibility support
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Example Modal"
 * >
 *   <p>Modal content goes here</p>
 * </Modal>
 * 
 * // Different sizes
 * <Modal size="lg" isOpen={isOpen} onClose={onClose}>
 *   <p>Large modal content</p>
 * </Modal>
 * 
 * // Custom footer
 * <Modal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   footer={
 *     <div>
 *       <button onClick={onClose}>Cancel</button>
 *       <button onClick={handleSave}>Save</button>
 *     </div>
 *   }
 * >
 *   <p>Modal with custom footer</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = '',
  overlayClassName = '',
  showCloseButton = true,
  footer,
  isCentered = true,
  blockScroll = true,
  id,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const animations = getModalAnimationProps();

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isOpen && closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Handle body scroll lock
  useEffect(() => {
    if (blockScroll) {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    return () => {
      if (blockScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, blockScroll]);

  // Handle click outside modal content
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get CSS classes for each part of the modal
  const overlayClasses = getOverlayClasses(overlayClassName);
  const contentClasses = getModalContentClasses({
    size,
    isCentered,
    className,
  });
  const headerClasses = getModalHeaderClasses(!!title);
  const bodyClasses = getModalBodyClasses();
  const footerClasses = getModalFooterClasses();
  const closeButtonClasses = getCloseButtonClasses();

  // Modal dialog element
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${overlayClasses} font-work-sans`}
          onClick={handleOverlayClick}
          initial={animations.overlay.initial}
          animate={animations.overlay.animate}
          exit={animations.overlay.exit}
          transition={animations.overlay.transition}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? `modal-title-${id}` : undefined}
          aria-describedby={`modal-content-${id}`}
        >
          <motion.div
            className={`${contentClasses} font-work-sans`}
            ref={contentRef}
            initial={animations.content.initial}
            animate={animations.content.animate}
            exit={animations.content.exit}
            transition={animations.content.transition}
          >
            {/* Header */}
            <div className={`${headerClasses} font-work-sans`}>
              {title && (
                <h2
                  id={`modal-title-${id}`}
                  className="text-lg font-semibold text-gray-800 font-work-sans"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className={`${closeButtonClasses} font-work-sans`}
                >
                  <Icon name="xmark" className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div id={`modal-content-${id}`} className={`${bodyClasses} font-work-sans`}>
              {children}
            </div>

            {/* Footer (optional) */}
            {footer && (
              <div className={`${footerClasses} font-work-sans`}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal at the end of the document body
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

Modal.displayName = 'Modal';

export default Modal; 