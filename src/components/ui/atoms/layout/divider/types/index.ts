import { HTMLAttributes } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerThickness = 'thin' | 'medium' | 'thick';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;
  
  /**
   * The style of the divider line.
   * @default 'solid'
   */
  variant?: DividerVariant;
  
  /**
   * The thickness of the divider.
   * @default 'thin'
   */
  thickness?: DividerThickness;
  
  /**
   * The color of the divider, uses theme colors.
   * @default 'divider' (which maps to French Grey #D1D5DB)
   */
  color?: string;
} 
// Default export added by auto-fix script
export default {
  // All exports from this file
};
