import React from 'react';
import { cn } from '@/utils/string/utils';

/* ---------------------------------- Heading --------------------------------- */
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type HeadingWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
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

/**
 * Heading component for h1-h6 elements
 * 
 * @example
 * ```tsx
 * <Heading level={1}>Page Title</Heading>
 * <Heading level={2} size="xl">Section Title</Heading>
 * <Heading level={3} weight="medium">Subsection Title</Heading>
 * ```
 */
export const Heading = ({
  level = 2,
  size,
  weight = 'semibold',
  truncate = false,
  className,
  children,
  ...props
}: HeadingProps) => {
  // Default size based on heading level
  const defaultSizes: Record<HeadingLevel, HeadingSize> = {
    1: '3xl',
    2: '2xl',
    3: 'xl',
    4: 'lg',
    5: 'md',
    6: 'sm'
  };

  // Size class mapping
  const sizeClasses: Record<HeadingSize, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  // Weight class mapping
  const weightClasses: Record<HeadingWeight, string> = {
    'light': 'font-light',
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold',
    'extrabold': 'font-extrabold'
  };

  const headingSize = size || defaultSizes[level];

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <HeadingTag
      className={cn(
        sizeClasses[headingSize],
        weightClasses[weight],
        truncate && 'truncate',
        className
      )}
      {...props}>

      {children}
    </HeadingTag>);

};

/* ----------------------------------- Text ----------------------------------- */
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
type TextColor = 'default' | 'muted' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
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

/**
 * Text component for displaying text with various styles
 * 
 * @example
 * ```tsx
 * <Text>Default text</Text>
 * <Text size="sm" color="muted">Small muted text</Text>
 * <Text weight="bold" color="primary">Bold primary text</Text>
 * ```
 */
export const Text = ({
  as: Component = 'span',
  size = 'base',
  weight = 'normal',
  color = 'default',
  truncate = false,
  className,
  children,
  ...props
}: TextProps) => {
  // Size class mapping
  const sizeClasses: Record<TextSize, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl'
  };

  // Weight class mapping
  const weightClasses: Record<TextWeight, string> = {
    'light': 'font-light',
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold'
  };

  // Color class mapping
  const colorClasses: Record<TextColor, string> = {
    'default': 'text-gray-900',
    'muted': 'text-gray-500',
    'primary': 'text-primary-color',
    'secondary': 'text-secondary-color',
    'accent': 'text-accent-color',
    'success': 'text-green-600',
    'warning': 'text-yellow-600',
    'danger': 'text-red-600'
  };

  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        truncate && 'truncate',
        className
      )}
      {...props}>

      {children}
    </Component>);

};

/* --------------------------------- Paragraph -------------------------------- */
type ParagraphSize = 'sm' | 'base' | 'lg';
type ParagraphColor = 'default' | 'muted' | 'primary' | 'secondary';

interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
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

/**
 * Paragraph component for block text
 * 
 * @example
 * ```tsx
 * <Paragraph>Default paragraph text</Paragraph>
 * <Paragraph size="sm" color="muted">Small muted paragraph</Paragraph>
 * <Paragraph spaced={false}>Paragraph without bottom margin</Paragraph>
 * ```
 */
export const Paragraph = ({
  size = 'base',
  color = 'default',
  spaced = true,
  className,
  children,
  ...props
}: ParagraphProps) => {
  // Size class mapping
  const sizeClasses: Record<ParagraphSize, string> = {
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg'
  };

  // Color class mapping
  const colorClasses: Record<ParagraphColor, string> = {
    'default': 'text-gray-700',
    'muted': 'text-gray-500',
    'primary': 'text-primary-color',
    'secondary': 'text-secondary-color'
  };

  return (
    <p
      className={`${cn(
        sizeClasses[size],
        colorClasses[color],
        spaced && 'mb-4',
        className
      )} font-work-sans`}
      {...props}>

      {children}
    </p>);

};