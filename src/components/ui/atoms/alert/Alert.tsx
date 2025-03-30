import React from 'react';
import { cn } from "@/lib/utils";
import { Icon } from '../icons/Icon';

/**
 * Alert component props interface
 */
export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * The variant of the alert
   * @default "default"
   */
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  
  /**
   * Whether to show an icon based on the variant
   * @default true
   */
  showIcon?: boolean;
  
  /**
   * The title of the alert
   */
  title?: React.ReactNode;
  
  /**
   * Whether the alert can be dismissed
   * @default false
   */
  dismissible?: boolean;
  
  /**
   * Callback when the alert is dismissed
   */
  onDismiss?: () => void;
}

/**
 * Alert component for displaying important messages to users
 * 
 * The Alert component is used to display important messages to users
 * such as success messages, error messages, warnings, or general information.
 * It supports different visual variants and can optionally include an icon
 * and be dismissible.
 * 
 * @component
 * @param {AlertProps} props - The props for the Alert component
 * @returns {React.ReactElement} - The rendered Alert component
 * 
 * @example
 * // Basic alert
 * <Alert>Information message</Alert>
 * 
 * // Success alert with title
 * <Alert variant="success" title="Success">Your changes have been saved</Alert>
 * 
 * // Error alert with icon
 * <Alert variant="destructive" showIcon>Failed to fetch data</Alert>
 * 
 * // Dismissible warning alert
 * <Alert variant="warning" dismissible onDismiss={() => console.log('dismissed')}>
 *   This action cannot be undone
 * </Alert>
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = "default", 
    showIcon = true,
    dismissible = false,
    title,
    children,
    onDismiss,
    ...props 
  }, ref) => {
    // Define variant-specific styles and icons
    const variantStyles = {
      default: {
        container: "bg-background text-primary border-divider",
        icon: "info-circle",
        iconColor: "text-secondary"
      },
      destructive: {
        container: "bg-destructive/15 text-destructive border-destructive/50",
        icon: "circle-exclamation",
        iconColor: "text-destructive"
      },
      success: {
        container: "bg-success/15 text-success border-success/50",
        icon: "circle-check",
        iconColor: "text-success"
      },
      warning: {
        container: "bg-warning/15 text-warning border-warning/50",
        icon: "triangle-exclamation",
        iconColor: "text-warning"
      },
      info: {
        container: "bg-info/15 text-info border-info/50",
        icon: "circle-info",
        iconColor: "text-info"
      }
    };

    // Get styles for the current variant
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-md border p-4",
          styles.container,
          className
        )}
        {...props}
      >
        <div className="flex items-start">
          {showIcon && (
            <div className="mr-3 mt-0.5 flex-shrink-0">
              <Icon 
                name={styles.icon} 
                variant={variant === "default" ? "light" : "solid"}
                className={cn("h-5 w-5", styles.iconColor)}
                size="md"
                aria-hidden="true"
              />
            </div>
          )}
          
          <div className="flex-1">
            {title && (
              <div className="mb-1 font-medium leading-none tracking-tight">
                {title}
              </div>
            )}
            
            {children && (
              <div className={cn("text-sm [&_p]:leading-relaxed", !title && "mt-0")}>
                {children}
              </div>
            )}
          </div>
          
          {dismissible && (
            <button
              type="button"
              className={cn(
                "ml-3 inline-flex h-5 w-5 items-center justify-center rounded-full",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "text-secondary hover:text-primary"
              )}
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <Icon 
                name="xmark" 
                variant="light"
                size="sm"
                className="h-4 w-4" 
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    );
  }
);

// Display name for debugging
Alert.displayName = 'Alert';

export { Alert };
export default Alert; 