"use client";

import React, { useState, useEffect } from 'react';
import HTMLInputElement from '../../ui/radio/types/index';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icons';

interface ColorPickerFieldProps {
  /**
   * Label for the color picker
   */
  label: string;
  
  /**
   * Help text/description
   */
  description?: string;
  
  /**
   * Current color value in hex format
   */
  value: string;
  
  /**
   * Callback for color change
   */
  onChange: (color: string) => void;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
}

/**
 * ColorPickerField component for branding settings
 * Allows selecting colors with a color picker and hex input
 */
const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  description,
  value,
  onChange,
  error,
  disabled = false
}) => {
  // Internal state for the hex input
  const [hexValue, setHexValue] = useState(value);
  
  // Validate hex color
  const isValidHex = (hex: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  };
  
  // Update internal state when value prop changes
  useEffect(() => {
    setHexValue(value);
  }, [value]);
  
  // Handle direct color picker change
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setHexValue(newColor);
    onChange(newColor);
  };
  
  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHexValue(newValue);
    
    // Only update the parent if it's a valid hex color
    if (isValidHex(newValue)) {
      onChange(newValue);
    }
  };
  
  // Handle blur event to format the hex value
  const handleBlur = () => {
    // If empty, set a default color
    if (!hexValue) {
      const defaultColor = '#000000';
      setHexValue(defaultColor);
      onChange(defaultColor);
      return;
    }
    
    // If it's a valid hex but missing #, add it
    if (/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
      const formattedColor = `#${hexValue}`;
      setHexValue(formattedColor);
      onChange(formattedColor);
      return;
    }
    
    // If it's not a valid hex, revert to the last valid value
    if (!isValidHex(hexValue)) {
      setHexValue(value);
    }
  };
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#333333] mb-1">
        {label}
      </label>
      
      <div className="flex space-x-4 items-center">
        {/* Color preview */}
        <div 
          className={`w-12 h-12 rounded-lg border ${
            error ? 'border-red-500' : 'border-[#D1D5DB]'
          } flex-shrink-0 relative overflow-hidden`}
        >
          {/* Checkerboard background for transparency */}
          <div className="absolute inset-0 bg-white"/>
          
          {/* Actual color display */}
          <div 
            className="absolute inset-0" 
            style={{ 
              backgroundColor: isValidHex(hexValue) ? hexValue : '#FFFFFF',
              opacity: disabled ? 0.5 : 1
            }}
          />
        </div>
        
        <div className="flex-grow space-y-2">
          {/* Color picker */}
          <div className="relative">
            <input
              type="color"
              value={isValidHex(hexValue) ? hexValue : '#FFFFFF'}
              onChange={handleColorPickerChange}
              className={`w-full h-10 p-1 rounded border ${
                error ? 'border-red-500' : 'border-[#D1D5DB]'
              } cursor-pointer`}
              disabled={disabled}
              aria-label={`Color picker for ${label}`}
            />
          </div>
          
          {/* Hex value input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="faHashtag" className="text-[#4A5568]" />
            </div>
            <input
              type="text"
              value={hexValue.replace('#', '')}
              onChange={handleHexChange}
              onBlur={handleBlur}
              className={`pl-10 pr-4 py-2 w-full border ${
                error ? 'border-red-500' : 'border-[#D1D5DB]'
              } rounded-lg focus:ring-[#00BFFF] focus:border-[#00BFFF]`}
              placeholder="FFFFFF"
              maxLength={6}
              disabled={disabled}
              aria-label={`Hex value for ${label}`}
            />
          </div>
          
          {/* Description or error */}
          {error ? (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 flex items-center"
            >
              <Icon name="faCircleExclamation" className="mr-1" />
              {error}
            </motion.p>
          ) : description ? (
            <p className="text-sm text-[#4A5568]">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ColorPickerField; 