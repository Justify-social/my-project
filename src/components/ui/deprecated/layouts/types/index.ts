/**
 * Card Component Types
 * 
 * This file contains type definitions for the Card component system.
 */

import React from 'react';

/**
 * Visual variants for cards
 */
export type CardVariant = 'default' | 'interactive' | 'outline' | 'raised';

/**
 * Props for the main Card component
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant style for the card
   * @default "default"
   */
  variant?: CardVariant;

  /**
   * Whether the card should have hover effects
   * @default false
   */
  hoverable?: boolean;

  /**
   * Content to render inside the card
   */
  children: React.ReactNode;
}

/**
 * Props for the CardHeader component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display in the header (component or ReactNode)
   */
  icon?: React.ReactNode;

  /**
   * Actions to display in the header (typically buttons)
   */
  actions?: React.ReactNode;

  /**
   * Content of the header
   */
  children: React.ReactNode;
}

/**
 * Props for the CardContent component
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to add padding to the content
   * @default true
   */
  withPadding?: boolean;

  /**
   * Content of the card body
   */
  children: React.ReactNode;
}

/**
 * Props for the CardFooter component
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls the alignment of items in the footer
   * @default "right"
   */
  align?: 'left' | 'center' | 'right' | 'between';

  /**
   * Whether to show a border at the top of the footer
   * @default true
   */
  withBorder?: boolean;

  /**
   * Content of the footer
   */
  children: React.ReactNode;
}

/**
 * Props for the MetricCard component
 */
export interface MetricCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Title of the metric
   */
  title: React.ReactNode;

  /**
   * Primary value to display
   */
  value: React.ReactNode;

  /**
   * Optional secondary/description text
   */
  description?: React.ReactNode;

  /**
   * Optional icon for the card
   */
  icon?: React.ReactNode;

  /**
   * Optional trend indicator (positive or negative)
   */
  trend?: number;
} 