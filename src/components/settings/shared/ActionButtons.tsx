"use client";

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Icon, SuccessIcon, ButtonIcon } from '@/components/ui/icons';

interface ActionButtonsProps {
  isEditing?: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit?: () => void;
  saveText?: string;
}

/**
 * ActionButtons component for settings forms
 * Provides Save and Cancel buttons with proper states
 */
const ActionButtons: React.FC<ActionButtonsProps> = memo(({
  isEditing = true,
  hasChanges,
  isSaving,
  onSave,
  onCancel,
  onEdit,
  saveText = "Save Changes"
}) => {
  if (!isEditing && onEdit) {
    return (
      <div className="flex justify-end mt-6">
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
          className="px-4 py-2 bg-white text-[#00BFFF] border border-[#00BFFF] rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center" 
        >
          <ButtonIcon name="penToSquare" size="md" className="mr-2" />
          Edit
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end space-x-3 mt-6">
      {/* Cancel button */}
      <motion.button 
        whileHover={{ scale: 1.02 }} 
        whileTap={{ scale: 0.98 }}
        onClick={onCancel} 
        disabled={isSaving} 
        className="px-4 py-2 text-[#333333] bg-[#FFFFFF] border border-[#D1D5DB] rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium flex items-center"
      >
        <Icon name="xmark" size="md" className="mr-2" />
        Cancel
      </motion.button>
      
      {/* Save button */}
      <motion.button 
        whileHover={{ scale: !hasChanges || isSaving ? 1 : 1.02 }} 
        whileTap={{ scale: !hasChanges || isSaving ? 1 : 0.98 }}
        onClick={onSave} 
        disabled={!hasChanges || isSaving} 
        className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center ${
          !hasChanges || isSaving 
            ? 'bg-blue-300 cursor-not-allowed text-white' 
            : 'bg-[#00BFFF] hover:bg-opacity-90 text-white'
        }`}
      >
        {isSaving ? (
          <>
            <Icon name="spinner" spin size="md" className="mr-2" />
            Saving...
          </>
        ) : (
          <>
            <SuccessIcon name="circleCheck" size="md" className="mr-2" />
            {saveText}
          </>
        )}
      </motion.button>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';
export default ActionButtons; 