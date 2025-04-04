/**
 * Utils Index
 * 
 * This file exports utilities and provides backwards compatibility.
 */

export * from './Providers';

// Re-export IconAdapter and FontAwesomeIcon from their new location
// for backward compatibility with existing components
export { 
  IconAdapter, 
  FontAwesomeIcon,
  ShadcnIcon 
} from '@/components/ui/atoms/icon/adapters';

// Legacy comment - kept for tracking purposes
// FontAwesome adapter moved to src/components/ui/atoms/icon/adapters/ 