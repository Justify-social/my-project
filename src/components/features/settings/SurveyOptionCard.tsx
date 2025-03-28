"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface SurveyOptionProps {
  id: string;
  text: string;
  image?: string | null;
  isSelected: boolean;
  onSelect: () => void;
  selectionType: 'single' | 'multiple';
}

export default function SurveyOptionCard({
  id,
  text,
  image,
  isSelected,
  onSelect,
  selectionType
}: SurveyOptionProps) {
  // Animation variants for the card
  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    selected: {
      scale: 1,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgb(239, 246, 255)'
    }
  };

  // Animation variants for the check indicator
  const checkVariants = {
    initial: { scale: 0, opacity: 0 },
    selected: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    }
  };

  return (
    <motion.div
      onClick={onSelect}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
      isSelected ?
      'border-blue-500 bg-blue-50' :
      'border-gray-200 hover:border-gray-300'}`
      }
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={isSelected ? "selected" : "initial"}
      transition={{ duration: 0.2 }}>

      <div className="flex items-center font-work-sans">
        <motion.div
          className={`w-5 h-5 rounded-${selectionType === 'multiple' ? 'sm' : 'full'} border flex items-center justify-center mr-3 ${
          isSelected ?
          'border-blue-500 bg-blue-500' :
          'border-gray-300'}`
          }
          variants={checkVariants}
          initial="initial"
          animate={isSelected ? "selected" : "initial"}>

          {isSelected &&
          <motion.span
            className="text-white text-xs font-work-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}>

              ✓
            </motion.span>
          }
        </motion.div>
        <span className="font-medium font-work-sans">{text}</span>
      </div>
      
      {image &&
      <div className="mt-3 h-32 relative rounded overflow-hidden font-work-sans">
          <Image
          src={image}
          alt={text}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-300 hover:scale-105" />

        </div>
      }
    </motion.div>);

}