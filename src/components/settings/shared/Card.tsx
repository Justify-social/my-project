'use client';

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card component with a consistent style for settings sections
 */
const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card; 