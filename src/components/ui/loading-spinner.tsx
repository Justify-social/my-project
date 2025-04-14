/**
 * @component LoadingSpinner
 * @category atom
 * @subcategory feedback
 * @description A customizable loading spinner component for indicating loading states
 * @status 10th April
 * @author Justify
 * @since 2023-05-15
 */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Color of the spinner
   * @default "primary"
   */
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

  /**
   * Text label to display with the spinner
   */
  label?: string;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * LoadingSpinner component for indicating loading states
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  label,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    primary: 'border-primary border-b-transparent',
    secondary: 'border-secondary border-b-transparent',
    success: 'border-success border-b-transparent',
    danger: 'border-destructive border-b-transparent',
    warning: 'border-warning border-b-transparent',
    info: 'border-accent border-b-transparent',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src="/loading-justify.gif"
        alt="Loading animation"
        width={64}
        height={64}
        priority
        className="mb-2"
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}
