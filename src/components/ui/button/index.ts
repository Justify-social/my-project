/**
 * Button Component Library
 * 
 * This file re-exports all button components to provide a unified import experience.
 * Usage: 
 * import { Button, IconButton, ButtonProps } from '@/components/ui/button';
 */

// Export type definitions
export * from './types';

// Main Button Components
export * from './Button';
export { default as Button } from './Button';

// Icon Button Component
// export * from './IconButton'; // Removing this line to prevent duplicate exports
export { default as IconButton } from './IconButton';

// Specialized Action Buttons
export * from './ActionButtons'; export * from './ButtonWithIcon';
