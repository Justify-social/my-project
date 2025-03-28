'use client';

import React from 'react';
import { Icon } from '@/components/ui/icons';

interface ActionButtonsProps {
  isEditing: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * Action buttons for edit, cancel, and save operations
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  isEditing,
  isSaving,
  hasChanges,
  onEdit,
  onCancel,
  onSave,
}) => {
  return (
    <div className="flex justify-end space-x-3">
      {!isEditing ? (
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-2 bg-white text-[#00BFFF] border border-[#00BFFF] rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center"
        >
          <Icon name="pencil" size="sm" className="mr-1" />
          Edit
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 bg-white text-[#4A5568] border border-[#D1D5DB] rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
            disabled={isSaving}
          >
            <Icon name="xmark" size="sm" className="mr-1" />
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className={`px-3 py-2 bg-[#00BFFF] text-white rounded-lg font-medium flex items-center ${
              hasChanges ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'
            } transition-colors`}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Icon name="spinner" size="sm" className="mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="check" size="sm" className="mr-1" />
                Save
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons; 