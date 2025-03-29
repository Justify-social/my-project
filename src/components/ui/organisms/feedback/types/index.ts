/**
 * Alert Component Types
 */

import React from 'react';

/**
 * Status types for alerts
 */
export type AlertStatus = 'success' | 'info' | 'warning' | 'error';

/**
 * Visual variants for alerts
 */
export type AlertVariant = 'default' | 'bordered';

/**
 * Alert component props
 */
export interface AlertProps {
  /**
   * The status determines the color and icon of the alert
   * @default "info"
   */
  status?: AlertStatus;
  
  /**
   * The message to display in the alert
   */
  message: string;
  
  /**
   * Additional CSS classes to apply to the alert
   */
  className?: string;
  
  /**
   * Whether the alert can be dismissed
   * @default false
   */
  dismissible?: boolean;
  
  /**
   * Callback function when alert is dismissed
   */
  onDismiss?: () => void;
  
  /**
   * Visual style variant of the alert
   * @default "default"
   */
  variant?: AlertVariant;
  
  /**
   * Additional content to display in the alert
   */
  children?: React.ReactNode;
}

export default AlertProps; 