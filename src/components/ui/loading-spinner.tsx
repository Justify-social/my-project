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
import Image from 'next/image';

interface LoadingSpinnerProps {
  /**
   * @deprecated Size prop is no longer used as component uses a fixed GIF.
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * @deprecated Color prop is no longer used as component uses a fixed GIF.
   */
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

  /**
   * Text label to display with the spinner
   */
  label?: string;

  /**
   * @deprecated className prop is no longer applied to the spinner itself.
   */
  className?: string;
}

/**
 * LoadingSpinner component - Renders a loading GIF.
 */
export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src="/loading-justify.gif"
        alt="Loading animation"
        width={64}
        height={64}
        priority
        className="mb-2"
        unoptimized
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}
