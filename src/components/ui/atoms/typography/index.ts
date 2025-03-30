/**
 * Typography Component Library
 * 
 * This file exports all typography-related components, types, and utilities.
 * 
 * Usage:
 * import { Heading, Text, Paragraph, Blockquote, Code } from '@/components/ui/atoms/typography';
 */

// Export type definitions
export * from './types';

// Export main components
export { default as Heading } from './Heading';
export { default as Text } from './Text';
export { default as Paragraph } from './Paragraph';
export { default as Blockquote } from './Blockquote';
export { default as Code } from './Code';

// Export for backwards compatibility
export * from './Typography';

import Typography from './Typography';

export default Typography;
