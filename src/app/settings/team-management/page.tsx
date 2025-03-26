"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@auth0/nextjs-auth0/client';
import Card from '@/components/settings/shared/Card';
import SectionHeader from '@/components/settings/shared/SectionHeader';
import ActionButtons from '@/components/settings/shared/ActionButtons';
import MembersList from '@/components/settings/team-management/MembersList';
import AddMemberModal from '@/components/settings/team-management/AddMemberModal';
import DeleteConfirmationModal from '@/components/settings/team-management/DeleteConfirmationModal';
import TeamManagementSkeleton from '@/components/settings/team-management/TeamManagementSkeleton';
import TestModal from '@/components/settings/team-management/TestModal';
import { Icon, ButtonIcon, SuccessIcon, WarningIcon } from '@/components/ui/icons';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedAt: string;
}

export default function TeamManagementPage() {
  // Get current user
  const { user, isLoading: isUserLoading } = useUser();
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Test modal state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  
  // Members state
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [originalMembers, setOriginalMembers] = useState<TeamMember[]>([]);
  
  // Invitations state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Debug toggle state - for toggling between debug and original view
  const [showDebugView, setShowDebugView] = useState(true);
  
  // Add tracking for data loaded
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Fetch team members and invitations on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTeamMembers(),
        fetchInvitations()
      ]);
      setDataLoaded(true);
    };
    
    loadData();
  }, []);
  
  // Show success message temporarily
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Check for changes
  useEffect(() => {
    if (originalMembers.length === 0) return;
    
    // Compare current members with original members
    const hasRoleChanges = members.some(member => {
      const original = originalMembers.find(m => m.id === member.id);
      return original && original.role !== member.role;
    });
    
    setHasChanges(hasRoleChanges);
  }, [members, originalMembers]);
  
  // Fetch team members from the API
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be a real API call
      // For now, simulate network delay and response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockMembers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'OWNER',
          createdAt: new Date(2023, 1, 15).toISOString()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'ADMIN',
          createdAt: new Date(2023, 2, 10).toISOString()
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'MEMBER',
          createdAt: new Date(2023, 3, 5).toISOString()
        }
      ];
      
      console.log('Team Management page rendering state:', { isLoading, members: mockMembers });
      
      setMembers(mockMembers);
      setOriginalMembers(JSON.parse(JSON.stringify(mockMembers)));
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch invitations from the API
  const fetchInvitations = async () => {
    try {
      // In a real app, this would be a real API call
      // For now, simulate network delay and response
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const mockInvitations = [
        {
          id: 'inv1',
          email: 'sarah@example.com',
          role: 'MEMBER',
          invitedAt: new Date(2023, 3, 20).toISOString()
        }
      ];
      
      setInvitations(mockInvitations);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      // We don't set an error state here to avoid blocking the entire page
      // if only invitations fail to load
    }
  };
  
  // Handle role change
  const handleRoleChange = (id: string, newRole: string) => {
    setMembers(prev => prev.map(member => 
      member.id === id ? { ...member, role: newRole } : member
    ));
    
    console.log('MembersList rendering with:', { members });
  };
  
  // Handle adding a new team member
  const handleAddMember = async (email: string, role: string) => {
    setIsAddingMember(true);
    setInviteError(null);
    
    try {
      // Check if the member already exists
      const existingMember = members.find(m => m.email.toLowerCase() === email.toLowerCase());
      if (existingMember) {
        throw new Error('This email is already a member of your team');
      }
      
      // In a real app, this would be an API call to send an invitation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new invitation
      const newInvitation: Invitation = {
        id: `inv${Math.random().toString(36).substring(2, 9)}`,
        email,
        role,
        invitedAt: new Date().toISOString()
      };
      
      // Add to invitations
      setInvitations(prev => [...prev, newInvitation]);
      
      setSuccessMessage(`Invitation sent to ${email}`);
      
      // Close modal
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding team member:', err);
      setInviteError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsAddingMember(false);
    }
  };
  
  // Handle removing a team member
  const handleRemoveMember = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      setMemberToDelete(member);
      setIsDeleteModalOpen(true);
    }
  };
  
  // Confirm removing a team member
  const confirmRemoveMember = async () => {
    if (!memberToDelete) return;
    
    setIsDeletingMember(true);
    setDeleteError(null);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from members list
      setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      setSuccessMessage(`${memberToDelete.name} has been removed from the team`);
      
      // Close modal
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (err) {
      console.error('Error removing team member:', err);
      setDeleteError('Failed to remove team member. Please try again.');
    } finally {
      setIsDeletingMember(false);
    }
  };
  
  // Handle cancelling an invitation
  const handleCancelInvitation = async (id: string) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove from invitations list
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      setSuccessMessage('Invitation cancelled successfully');
    } catch (err) {
      console.error('Error cancelling invitation:', err);
      setError('Failed to cancel invitation. Please try again.');
    }
  };
  
  // Save changes to roles
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update original members to match current state
      setOriginalMembers(JSON.parse(JSON.stringify(members)));
      
      setSuccessMessage('Team member roles updated successfully');
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel changes to roles
  const handleCancel = () => {
    // Reset members to original state
    setMembers(JSON.parse(JSON.stringify(originalMembers)));
    setHasChanges(false);
  };
  
  const handleLogData = () => {
    console.log({
      members,
      invitations,
      hasChanges
    });
  };
  
  const toggleDebugView = () => {
    setShowDebugView(!showDebugView);
  };
  
  // Show loading state
  if (isLoading) {
    // Return debug info alongside loading skeleton
    return (
      <div className="relative">
        <div className="absolute top-0 right-0 z-[9999] bg-purple-200 px-3 py-1 rounded text-sm">
          Loading State
        </div>
        <TeamManagementSkeleton />
      </div>
    );
  }
  
  // Show error state
  if (error && !dataLoaded) {
    // Return debug info alongside error view
    return (
      <div className="relative">
        <div className="absolute top-0 right-0 z-[9999] bg-red-200 px-3 py-1 rounded text-sm">
          Error State
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center"
        >
          <div className="mb-4 text-red-500">
            <Icon name="circleExclamation" size="3xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Team Management
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }
  
  // Before returning the actual component, let's debug info
  console.log("RENDER DEBUG - Team Management Page:", { 
    isLoading, 
    dataLoaded, 
    memberCount: members?.length, 
    error 
  });

  // Toggle between debug and regular view
  return (
    <div className="relative">
      {/* Debug controls */}
      <div className="fixed top-20 right-4 z-[9999] bg-purple-700 text-white p-2 rounded shadow-lg">
        <button onClick={toggleDebugView} className="px-2 py-1">
          {showDebugView ? "Show Original UI" : "Show Debug View"}
        </button>
      </div>
      
      {/* Hybrid View - Show both debug and original */}
      <div className="space-y-8">
        {showDebugView ? (
          /* Debug View */
          <div className="p-8 bg-red-500 border-4 border-black" style={{ minHeight: "200px", zIndex: 9900, position: "relative" }}>
            <h1 className="text-3xl font-bold text-white">TEST RENDER - TEAM MANAGEMENT</h1>
            <pre className="bg-white p-4 mt-4 overflow-auto max-h-[200px] text-xs">
              {JSON.stringify({ 
                isLoading, 
                dataLoaded, 
                members, 
                hasTestModalOpen: isTestModalOpen,
                isAddModalOpen,
                isDeleteModalOpen,
                userLoading: isUserLoading
              }, null, 2)}
            </pre>
            <button 
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => console.log("Debug button clicked")}
            >
              Debug Log
            </button>
          </div>
        ) : (
          /* Original View with Debug Indicators */
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-8 relative"
          >
            {/* Debug indicator for original view */}
            <div className="bg-blue-200 px-3 py-1 rounded text-sm absolute top-0 right-0 z-[9900]">
              Original UI View
            </div>
            
            {/* Success message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 text-green-800 p-4 rounded-lg"
              >
                <div className="flex items-center">
                  <SuccessIcon name="circleCheck" size="md" className="mr-2" />
                  <span>{successMessage}</span>
                </div>
              </motion.div>
            )}
            
            {/* Error message (for errors after initial load) */}
            {error && dataLoaded && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 text-red-800 p-4 rounded-lg"
              >
                <div className="flex items-center">
                  <WarningIcon name="triangleExclamation" size="md" className="mr-2" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            
            {/* Team Members Section */}
            <Card>
              <div className="flex justify-between items-center mb-8">
                <SectionHeader
                  title="Team Members"
                  description="Manage your team members and their roles."
                />
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center bg-[#00BFFF] hover:bg-[#0099CC] text-white px-4 py-2 rounded-md transition-colors"
                >
                  <ButtonIcon name="userPlus" size="md" className="mr-2" />
                  <span>Add Member</span>
                </button>
              </div>
              
              <MembersList
                members={members}
                invitations={invitations}
                onRoleChange={handleRoleChange}
                onRemoveMember={handleRemoveMember}
                onCancelInvitation={handleCancelInvitation}
              />
              
              {hasChanges && (
                <div className="mt-8 flex justify-end">
                  <ActionButtons
                    onCancel={handleCancel}
                    onSave={handleSave}
                    isSaving={isSaving}
                    hasChanges={hasChanges}
                  />
                </div>
              )}
            </Card>
            
            {/* Add Member Modal */}
            {isAddModalOpen && (
              <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddMember}
                isLoading={isAddingMember}
                error={inviteError || undefined}
              />
            )}
            
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && memberToDelete && (
              <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmRemoveMember}
                memberName={memberToDelete.name}
                isLoading={isDeletingMember}
                error={deleteError || undefined}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}