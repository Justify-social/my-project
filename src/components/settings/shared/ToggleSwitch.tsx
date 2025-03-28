'use client';

import React from 'react';

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * Toggle switch for boolean settings
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  description,
  isEnabled,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <div>
          <label
            htmlFor={id}
            className={`font-medium ${disabled ? 'text-gray-400' : 'text-[#333333]'}`}
          >
            {label}
          </label>
          {description && (
            <p className={`text-sm mt-1 ${disabled ? 'text-gray-400' : 'text-[#4A5568]'}`}>
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={isEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:ring-offset-2 ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          } ${isEnabled ? 'bg-[#00BFFF]' : 'bg-gray-200'}`}
          onClick={onToggle}
          disabled={disabled}
        >
          <span
            className={`${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </button>
      </div>
    </div>
  );
};

export default ToggleSwitch; 