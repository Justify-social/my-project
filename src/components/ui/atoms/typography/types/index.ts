/**
 * Typography Types
 * 
 * This file contains all shared types for typography components.
 */

/* ---------------------------------- Heading Types --------------------------------- */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type HeadingWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The heading level (h1-h6)
   * @default 2
   */
  level?: HeadingLevel;

  /**
   * The size of the heading
   * @default Set based on level 
   */
  size?: HeadingSize;

  /**
   * The font weight of the heading
   * @default 'semibold'
   */
  weight?: HeadingWeight;

  /**
   * Whether to truncate the text with an ellipsis
   * @default false
   */
  truncate?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * The content of the heading
   */
  children: React.ReactNode;
}

/* ----------------------------------- Text Types ----------------------------------- */
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'default' | 'muted' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The HTML element to render
   * @default 'span'
   */
  as?: 'span' | 'div' | 'p' | 'label';

  /**
   * The size of the text
   * @default 'base'
   */
  size?: TextSize;

  /**
   * The font weight of the text
   * @default 'normal'
   */
  weight?: TextWeight;

  /**
   * The color variant of the text
   * @default 'default'
   */
  color?: TextColor;

  /**
   * Whether to truncate the text with an ellipsis
   * @default false
   */
  truncate?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * The content of the text
   */
  children: React.ReactNode;
}

/* --------------------------------- Paragraph Types -------------------------------- */
export type ParagraphSize = 'sm' | 'base' | 'lg';
export type ParagraphColor = 'default' | 'muted' | 'primary' | 'secondary';

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * The size of the paragraph
   * @default 'base'
   */
  size?: ParagraphSize;

  /**
   * The color variant of the paragraph
   * @default 'default'
   */
  color?: ParagraphColor;

  /**
   * The spacing between paragraphs
   * @default true
   */
  spaced?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * The content of the paragraph
   */
  children: React.ReactNode;
}

/* --------------------------------- Blockquote Types -------------------------------- */
export interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  /**
   * The size of the blockquote
   * @default 'base'
   */
  size?: ParagraphSize;

  /**
   * Whether to show a border
   * @default true
   */
  bordered?: boolean;

  /**
   * The citation or source of the quote
   */
  cite?: string;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * The content of the blockquote
   */
  children: React.ReactNode;
}

/* --------------------------------- Code Types -------------------------------- */
export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The size of the code text
   * @default 'sm'
   */
  size?: TextSize;

  /**
   * Whether to display as inline code or a code block
   * @default false
   */
  block?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * The content of the code element
   */
  children: React.ReactNode;
} 
// Default export added by auto-fix script
export default {
  // All exports from this file
};
