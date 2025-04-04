'use client';

/**
 * COMPATIBILITY LAYER 
 * 
 * This file exists only for backward compatibility.
 * All icon adapter functionality has moved to:
 * src/components/ui/atoms/icon/adapters/
 * 
 * New code should import directly from:
 * @/components/ui/atoms/icon/adapters
 */

export {
  IconAdapter,
  FontAwesomeIcon,
  ShadcnIcon
} from '@/components/ui/atoms/icon/adapters';

// This file will be deprecated in a future release
// Any existing imports from this path will continue to work
// but new code should use the new location 