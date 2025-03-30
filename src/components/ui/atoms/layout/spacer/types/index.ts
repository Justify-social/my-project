import { HTMLAttributes } from 'react';

/**
 * Predefined spacing sizes based on the design system
 */
export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

/**
 * Custom spacing size in pixels or any valid CSS size value
 */
export type SpacerCustomSize = number | string;

/**
 * Props for the Spacer component
 */
export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spacer in the horizontal direction
   * Either use a predefined size or a custom value
   */
  x?: SpacerSize | SpacerCustomSize;
  
  /**
   * Size of the spacer in the vertical direction
   * Either use a predefined size or a custom value
   */
  y?: SpacerSize | SpacerCustomSize;
  
  /**
   * Whether the spacer should be displayed as inline or block
   * @default false
   */
  inline?: boolean;
} 
// Default export added by auto-fix script
export default {
  // All exports from this file
};
