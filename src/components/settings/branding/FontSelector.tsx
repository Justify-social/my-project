"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FontOption {
  name: string;
  value: string;
}

interface FontSizeOption {
  name: string;
  value: string;
}

interface FontSelectorProps {
  /**
   * Label for the font selector
   */
  label: string;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Available font options
   */
  fonts: FontOption[];
  
  /**
   * Available font size options
   */
  fontSizes: FontSizeOption[];
  
  /**
   * Selected font
   */
  selectedFont: string;
  
  /**
   * Selected font size
   */
  selectedFontSize: string;
  
  /**
   * Callback when font changes
   */
  onFontChange: (font: string) => void;
  
  /**
   * Callback when font size changes
   */
  onFontSizeChange: (fontSize: string) => void;
  
  /**
   * Error message for font
   */
  fontError?: string;
  
  /**
   * Error message for font size
   */
  fontSizeError?: string;
  
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  
  /**
   * Sample text to preview the font
   */
  sampleText?: string;
}

/**
 * FontSelector component for branding settings
 * Allows selecting fonts and font sizes with a live preview
 */
const FontSelector: React.FC<FontSelectorProps> = ({
  label,
  description,
  fonts,
  fontSizes,
  selectedFont,
  selectedFontSize,
  onFontChange,
  onFontSizeChange,
  fontError,
  fontSizeError,
  disabled = false,
  sampleText = 'The quick brown fox jumps over the lazy dog'
}) => {
  // Handle font selection change
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFontChange(e.target.value);
  };
  
  // Handle font size selection change
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFontSizeChange(e.target.value);
  };
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-[#333333] mb-1">
        {label}
      </label>
      
      {description && (
        <p className="text-sm text-[#4A5568] mb-3">
          {description}
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Font selection */}
        <div>
          <label htmlFor="font-family" className="block text-sm text-[#4A5568] mb-1">
            Font Family
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-light fa-font text-[#4A5568]"></i>
            </div>
            <select
              id="font-family"
              value={selectedFont}
              onChange={handleFontChange}
              className={`pl-10 pr-4 py-2 w-full border ${
                fontError ? 'border-red-500' : 'border-[#D1D5DB]'
              } rounded-lg focus:ring-[#00BFFF] focus:border-[#00BFFF] appearance-none bg-white`}
              disabled={disabled}
            >
              {fonts.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="fa-light fa-chevron-down text-[#4A5568]"></i>
            </div>
          </div>
          {fontError && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-500 flex items-center"
            >
              <i className="fa-light fa-exclamation-circle mr-1"></i>
              {fontError}
            </motion.p>
          )}
        </div>
        
        {/* Font size selection */}
        <div>
          <label htmlFor="font-size" className="block text-sm text-[#4A5568] mb-1">
            Font Size
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-light fa-text-size text-[#4A5568]"></i>
            </div>
            <select
              id="font-size"
              value={selectedFontSize}
              onChange={handleFontSizeChange}
              className={`pl-10 pr-4 py-2 w-full border ${
                fontSizeError ? 'border-red-500' : 'border-[#D1D5DB]'
              } rounded-lg focus:ring-[#00BFFF] focus:border-[#00BFFF] appearance-none bg-white`}
              disabled={disabled}
            >
              {fontSizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="fa-light fa-chevron-down text-[#4A5568]"></i>
            </div>
          </div>
          {fontSizeError && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-500 flex items-center"
            >
              <i className="fa-light fa-exclamation-circle mr-1"></i>
              {fontSizeError}
            </motion.p>
          )}
        </div>
      </div>
      
      {/* Font preview */}
      <div className="mt-4 p-4 border border-[#D1D5DB] rounded-lg bg-white">
        <p className="mb-2 text-sm text-[#4A5568]">Preview:</p>
        <div 
          className="p-3 bg-gray-50 rounded"
          style={{ 
            fontFamily: selectedFont, 
            fontSize: selectedFontSize,
            opacity: disabled ? 0.6 : 1
          }}
        >
          {sampleText}
        </div>
      </div>
    </div>
  );
};

export default FontSelector; 