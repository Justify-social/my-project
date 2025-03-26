"use client";

import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * ToggleSwitch component for settings
 * Provides a toggle switch with label and optional description
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = memo(({
  id,
  label,
  description,
  isEnabled,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="flex justify-between items-center py-3">
      <div>
        <label htmlFor={id} className="font-medium text-[#333333] cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-sm text-[#4A5568] mt-1">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:ring-offset-2`}
        role="switch"
        aria-checked={isEnabled}
        aria-labelledby={`${id}-label`}
        style={{ backgroundColor: isEnabled ? '#00BFFF' : '#D1D5DB' }}
      >
        <span className="sr-only">Toggle {label}</span>
        <motion.span 
          className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          animate={{ 
            x: isEnabled ? 20 : 1 
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';
export default ToggleSwitch; 