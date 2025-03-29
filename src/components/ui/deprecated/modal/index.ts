/**
 * @deprecated This file is deprecated. Import from '@/components/ui/organisms/Modal' instead.
 * This file is maintained for backward compatibility.
 * 
 * This file re-exports components and types for the modal system.
 * Usage:
 * import { Modal, ModalProps } from '@/components/ui/modal';
 */

// Export type definitions
export * from './types';

// Export style utilities
export * from './styles/modal.styles';

// Re-export everything from new location
export * from '../organisms/Modal';
// Set the default export to the main Modal component
export { default } from '../organisms/Modal'; 