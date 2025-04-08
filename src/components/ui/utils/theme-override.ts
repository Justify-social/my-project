/**
 * Theme Override Utility
 * 
 * This utility provides functions for overriding default Shadcn UI component styles
 * to match the application's brand guidelines.
 */

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button style overrides
 * 
 * Customizes the button component to match brand guidelines
 */
export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Brand-specific variants
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        interactive: "bg-interactive text-interactive-foreground hover:bg-interactive/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Brand-specific sizes
        xs: "h-8 text-xs px-2.5 py-1.5 rounded",
        xl: "h-12 text-base px-10 py-3 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Badge style overrides
 */
export const badgeStyles = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // Brand-specific variants
        accent: "border-transparent bg-accent text-accent-foreground",
        interactive: "border-transparent bg-interactive text-interactive-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Card styles
 */
export const cardStyles = () => ({
  base: "rounded-lg border bg-card text-card-foreground shadow-sm",
  header: "flex flex-col space-y-1.5 p-6", 
  title: "text-2xl font-semibold leading-none tracking-tight",
  description: "text-sm text-muted-foreground",
  content: "p-6 pt-0",
  footer: "flex items-center p-6 pt-0"
});

/**
 * Alert style overrides
 */
export const alertStyles = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-success/50 text-success dark:border-success [&>svg]:text-success",
        warning:
          "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
        info:
          "border-accent/50 text-accent dark:border-accent [&>svg]:text-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Apply custom styles to a component
 * 
 * @param baseClassName The base class name from shadcn
 * @param customStyles Custom style overrides
 * @returns Merged class names
 */
export function applyCustomStyles(baseClassName: string, customStyles: string): string {
  return cn(baseClassName, customStyles);
}

/**
 * Get color styles for a specific theme color
 * 
 * @param colorName The name of the color (e.g., 'primary', 'accent')
 * @param type The type of styles to get ('bg', 'text', 'border', 'hover')
 * @returns CSS classes for the specified color
 */
export function getColorStyles(
  colorName: 'primary' | 'secondary' | 'accent' | 'destructive' | 'success' | 'warning' | 'interactive' | 'muted', 
  type: 'bg' | 'text' | 'border' | 'hover' | 'all'
): string {
  const styles: Record<string, Record<string, string>> = {
    bg: {
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      accent: 'bg-accent text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      interactive: 'bg-interactive text-interactive-foreground',
      muted: 'bg-muted text-muted-foreground',
    },
    text: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      accent: 'text-accent',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning',
      interactive: 'text-interactive',
      muted: 'text-muted-foreground',
    },
    border: {
      primary: 'border-primary',
      secondary: 'border-secondary',
      accent: 'border-accent',
      destructive: 'border-destructive',
      success: 'border-success',
      warning: 'border-warning',
      interactive: 'border-interactive',
      muted: 'border-muted',
    },
    hover: {
      primary: 'hover:bg-primary hover:text-primary-foreground',
      secondary: 'hover:bg-secondary hover:text-secondary-foreground',
      accent: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'hover:bg-destructive hover:text-destructive-foreground',
      success: 'hover:bg-success hover:text-success-foreground',
      warning: 'hover:bg-warning hover:text-warning-foreground',
      interactive: 'hover:bg-interactive hover:text-interactive-foreground',
      muted: 'hover:bg-muted hover:text-muted-foreground',
    },
  };
  
  if (type === 'all') {
    return `${styles.bg[colorName]} ${styles.border[colorName]} ${styles.hover[colorName]}`;
  }
  
  return styles[type][colorName] || '';
} 