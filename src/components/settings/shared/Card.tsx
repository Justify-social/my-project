"use client";

import React, { ReactNode, memo } from 'react';
import CardProps from '../../ui/card/types/index';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card component for settings sections
 * Provides consistent styling with animations
 */
const Card: React.FC<CardProps> = memo(({ children, className = '' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 mb-6 ${className}`}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';
export default Card; 