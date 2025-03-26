"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, ButtonIcon, StaticIcon, WarningIcon } from '@/components/ui/icons';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (email: string, role: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

/**
 * AddMemberModal component for the Team Management page
 * Modal form for inviting new team members
 */
const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isLoading = false,
  error
}) => {
  // Form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [emailError, setEmailError] = useState('');
  
  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setRole('MEMBER');
      setEmailError('');
    }
  }, [isOpen]);
  
  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }
    
    try {
      await onAdd(email, role);
      onClose();
    } catch (error) {
      console.error('Failed to add member:', error);
      // Error handling is done via the parent component
    }
  };
  
  // Modal animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };
  
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
        >
          {/* Modal backdrop - clicking it closes the modal */}
          <motion.div 
            className="absolute inset-0"
            onClick={onClose}
          />
          
          {/* Modal content */}
          <motion.div
            className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 z-10"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center border-b border-[#D1D5DB] px-6 py-4">
              <h3 className="text-lg font-bold text-[#333333]">
                Invite Team Member
              </h3>
              <button 
                onClick={onClose}
                className="text-[#4A5568] hover:text-[#333333] focus:outline-none"
                aria-label="Close"
              >
                <Icon name="xmark" size="lg" />
              </button>
            </div>
            
            {/* Modal body */}
            <div className="px-6 py-4">
              <form onSubmit={handleSubmit}>
                {/* Error message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                    <div className="flex items-center">
                      <WarningIcon name="triangleExclamation" size="md" className="mr-2" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                
                {/* Email input */}
                <div className="mb-4">
                  <label htmlFor="member-email" className="block text-sm font-medium text-[#333333] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <StaticIcon name="envelope" size="md" className="text-[#4A5568]" />
                    </div>
                    <input
                      id="member-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) validateEmail(e.target.value);
                      }}
                      className={`pl-10 pr-4 py-2 w-full border ${
                        emailError ? 'border-red-500' : 'border-[#D1D5DB]'
                      } rounded-lg focus:ring-[#00BFFF] focus:border-[#00BFFF]`}
                      placeholder="colleague@example.com"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-500">{emailError}</p>
                  )}
                </div>
                
                {/* Role selection */}
                <div className="mb-4">
                  <label htmlFor="member-role" className="block text-sm font-medium text-[#333333] mb-1">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <StaticIcon name="userShield" size="md" className="text-[#4A5568]" />
                    </div>
                    <select
                      id="member-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-[#D1D5DB] rounded-lg focus:ring-[#00BFFF] focus:border-[#00BFFF]"
                      disabled={isLoading}
                    >
                      <option value="ADMIN">Admin - Full access</option>
                      <option value="MEMBER">Member - Standard access</option>
                      <option value="VIEWER">Viewer - Read-only access</option>
                    </select>
                  </div>
                  <p className="mt-1 text-sm text-[#4A5568]">
                    Choose the appropriate permission level for this user.
                  </p>
                </div>
                
                {/* Role descriptions */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="mb-2">
                    <span className="font-semibold">Admin:</span> Can manage team members and all settings
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Member:</span> Can create and manage campaigns, limited settings access
                  </div>
                  <div>
                    <span className="font-semibold">Viewer:</span> Read-only access to campaigns and reports
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-[#D1D5DB] rounded-md text-[#4A5568] hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00BFFF] hover:bg-[#0099CC] text-white rounded-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <Icon name="spinner" spin size="md" className="mr-2" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <span>Send Invitation</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMemberModal; 