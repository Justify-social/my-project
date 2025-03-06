"use client";

import React, { useState, ChangeEvent, useCallback, FormEvent, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircleIcon, ArrowPathIcon, CheckCircleIcon, PlusIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import NavigationTabs from '../components/NavigationTabs';
import { toast } from 'react-hot-toast';
import TeamDashboard from './dashboard';
import { EnumTransformers } from '@/utils/enum-transformers';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isEditingRole?: boolean;
  isCurrentUser?: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

// Enhanced UI Components
const Card = memo(({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6"
  >
    {children}
  </motion.div>
));

const SectionHeader: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}> = memo(({ icon: Icon, title, description }) => (
  <div className="flex items-center mb-6">
    <div className="bg-[var(--background-color)] bg-opacity-50 p-3 rounded-lg">
      <Icon className="w-6 h-6 text-[var(--accent-color)]" />
    </div>
    <div className="ml-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  </div>
));

const TeamManagementPage: React.FC = () => {
  const router = useRouter();

  // Main states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [apiError, setApiError] = useState("");

  // Modal states for removing a member
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [invitationToRemove, setInvitationToRemove] = useState<Invitation | null>(null);

  // Modal states for adding a new member
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<string>("MEMBER");
  const [addMemberError, setAddMemberError] = useState("");

  // Search and Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 10;

  // Add this state near the top of your component
  const [hasAttemptedSetup, setHasAttemptedSetup] = useState<boolean>(false);
  const [addingMember, setAddingMember] = useState(false);

  // New states for invitation
  const [isInviting, setIsInviting] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  // Auto setup database tables when component mounts
  useEffect(() => {
    const autoSetupTables = async () => {
      try {
        console.log('Auto-running setup to ensure team management tables exist...');
        const response = await fetch('/api/settings/team/setup', {
          method: 'POST',
        });
        
        const data = await response.json();
        console.log('Setup API response:', data);
        
        if (data.success) {
          console.log('Team management tables are set up');
          setHasAttemptedSetup(true);
          // Fetch team data after successful setup
          fetchTeamData();
        } else {
          console.error('Failed to set up team management tables:', data.error);
          setHasAttemptedSetup(false);
          setApiError('Failed to set up team management. Please try again later.');
        }
      } catch (error) {
        console.error('Error setting up team management:', error);
        setHasAttemptedSetup(false);
        setApiError('Failed to set up team management. Please try again later.');
      }
    };
    
    autoSetupTables();
  }, []);

  // Load team data on component mount
  useEffect(() => {
    fetchTeamData();
  }, []);

  // Ensure tables exist on component mount
  useEffect(() => {
    console.log('Auto setting up team management tables...');
    setupTeamManagement();
  }, []);

  // Function to fetch team data from API
  const fetchTeamData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/team');
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      const data = await response.json();
      
      // Transform team member roles and invitation statuses for display
      const transformedMembers = data.members.map((member: any) => ({
        ...member,
        role: EnumTransformers.teamRoleFromBackend(member.role)
      }));
      
      const transformedInvitations = data.invitations.map((invitation: any) => ({
        ...invitation,
        role: EnumTransformers.teamRoleFromBackend(invitation.role),
        status: EnumTransformers.invitationStatusFromBackend(invitation.status)
      }));
      
      setTeamMembers(transformedMembers);
      setInvitations(transformedInvitations);
      setApiError("");
    } catch (error) {
      console.error('Error fetching team data:', error);
      setApiError("Failed to load team data. Please try again.");
      // Set empty arrays to prevent rendering errors
      setTeamMembers([]);
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter team members by search query (name or email)
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  // Handler to update a member's role (inline)
  const handleRoleChange = async (id: string, newRole: string) => {
    // API implementation would go here
    // For now, just update the UI
    setTeamMembers(members => 
      members.map(m => m.id === id ? { ...m, role: newRole } : m)
    );
    setIsDirty(true);
  };

  // Toggle the editing mode for a member's role
  const toggleEditingRole = (id: string) => {
    setTeamMembers(members => 
      members.map(m => m.id === id ? { ...m, isEditingRole: !m.isEditingRole } : m)
    );
  };

  // Confirm removal of a member (open modal)
  const confirmRemoveMember = (member: TeamMember) => {
    if (member.isCurrentUser) {
      alert("Error: You cannot remove yourself from the team.");
      return;
    }
    if (member.role === "Admin") {
      const adminCount = teamMembers.filter(m => m.role === "Admin").length;
      if (adminCount <= 1) {
        alert("Error: At least one Admin is required.");
        return;
      }
    }
    setMemberToRemove(member);
    setRemoveModalOpen(true);
  };

  // Remove the member from the team
  const handleRemoveMember = async () => {
    console.log('handleRemoveMember called with:', { 
      memberToRemove: memberToRemove?.id, 
      invitationToRemove: invitationToRemove?.id 
    });
    
    if (!memberToRemove && !invitationToRemove) {
      console.log('No member or invitation to remove');
      return;
    }
    
    setIsLoading(true);
    try {
      if (memberToRemove) {
        // Handle team member removal using the original endpoint
        const url = `/api/settings/team?memberId=${memberToRemove.id}`;
        console.log('Making member removal request to:', url);
        
        const response = await fetch(url, {
          method: 'DELETE',
        });
        
        console.log('Member removal response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to remove team member');
        }
        
        setTeamMembers(members => members.filter(m => m.id !== memberToRemove.id));
        setToastMessage(`${memberToRemove.name} has been removed from the team.`);
      } else if (invitationToRemove) {
        // Handle invitation cancellation using the dedicated endpoint
        console.log('Cancelling invitation with ID:', invitationToRemove.id);
        
        const response = await fetch(`/api/settings/team/invitation/${invitationToRemove.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Cancel API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(`Failed to cancel invitation: ${errorData.error || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('Cancel API response data:', data);
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to cancel invitation');
        }
        
        setInvitations(invites => invites.filter(i => i.id !== invitationToRemove.id));
        setToastMessage(`Invitation to ${invitationToRemove.email} has been cancelled.`);
      }
      
    } catch (error) {
      console.error('Error removing team member/cancelling invitation:', error);
      setApiError(error instanceof Error ? error.message : "Failed to complete operation. Please try again.");
    } finally {
      console.log('Cleanup after member/invitation removal');
      setIsLoading(false);
      setRemoveModalOpen(false);
      setMemberToRemove(null);
      setInvitationToRemove(null);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  // Cancel the removal modal
  const cancelRemove = () => {
    setRemoveModalOpen(false);
    setMemberToRemove(null);
    setInvitationToRemove(null);
  };

  // Handler to add a new team member
  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsInviting(true);
    setAddMemberError('');
    
    try {
      // Transform role to backend format
      const transformedRole = EnumTransformers.teamRoleToBackend(role);
      
      const response = await fetch('/api/settings/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role: transformedRole
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite team member');
      }
      
      // Clear form and show success message
      setEmail('');
      setRole('MEMBER');
      setToastMessage('Invitation sent successfully');
      
      // Add the new invitation to the state
      setInvitations([
        ...invitations, 
        {
          ...result.invitation,
          // Transform the role and status for display if needed
          role: EnumTransformers.teamRoleFromBackend(result.invitation.role),
          status: EnumTransformers.invitationStatusFromBackend(result.invitation.status)
        }
      ]);
      
    } catch (error) {
      setAddMemberError(error instanceof Error ? error.message : 'Failed to invite team member');
    } finally {
      setIsInviting(false);
    }
  };

  // Primary action: Cancel reverts changes back to the initial state.
  const handleCancel = () => {
    fetchTeamData();
    setIsDirty(false);
  };

  // Primary action: Save Changes simulates a network request.
  const handleSaveChanges = () => {
    if (!isDirty) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setToastMessage("Team settings updated successfully!");
      setIsDirty(false);
      setTimeout(() => setToastMessage(""), 3000);
    }, 2000);
  };

  // Add this new function to the component
  const setupTeamManagement = async () => {
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await fetch('/api/settings/team/setup', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set up team management');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setToastMessage('Team management setup completed successfully!');
        // Fetch team data again to see the new tables
        await fetchTeamData();
      } else {
        setApiError(data.error || 'Setup failed for unknown reason');
      }
    } catch (error: any) {
      console.error('Error setting up team management:', error);
      setApiError(error.message || 'Failed to set up team management');
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Display a setup message if there's no team members or invitations
  const showSetupNotice = teamMembers.length === 0 && invitations.length === 0 && !isLoading && !apiError;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-[var(--primary-color)]"
            >
              Team Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-[var(--secondary-color)]"
            >
              Manage your team members and their roles
            </motion.p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-[var(--primary-color)] bg-[var(--background-color)] rounded-lg hover:bg-gray-200 
                transition-colors duration-200 font-medium flex items-center"
            >
              <XCircleIcon className="w-5 h-5 mr-2" />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveChanges}
              disabled={!isDirty || isLoading}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium 
                flex items-center ${
                  !isDirty || isLoading
                    ? 'bg-blue-300 cursor-not-allowed text-white'
                    : 'bg-[var(--accent-color)] hover:bg-opacity-90 text-white'
                }`}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Save
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab="team"
          isSuperAdmin={true}
          onTabChange={(tab) => {
            switch (tab) {
              case 'profile':
                router.push('/settings');
                break;
              case 'branding':
                router.push('/settings/branding');
                break;
              case 'admin':
                router.push('/admin');
                break;
            }
          }}
        />

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <SectionHeader
              icon={UserGroupIcon}
              title="Team Members"
              description="Manage your team members and their access levels"
            />

            {/* Search and Add Member */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10 pr-4 py-2 w-[400px] border border-[var(--divider-color)] rounded-lg 
                    focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90
                  transition-colors duration-200 font-medium flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Team Member
              </motion.button>
            </div>

            {/* Team Members Table */}
            <div className="overflow-hidden rounded-lg border border-[var(--divider-color)]">
              <table className="min-w-full divide-y divide-[var(--divider-color)]">
                <thead className="bg-[var(--background-color)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[var(--divider-color)]">
                  {currentMembers.map(member => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[var(--background-color)]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-[var(--accent-color)] font-medium">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[var(--primary-color)]">
                              {member.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--secondary-color)]">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.isEditingRole ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[var(--divider-color)] 
                              focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm rounded-md"
                          >
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${member.role === 'Admin' ? 'bg-blue-100 text-[var(--accent-color)]' : 'bg-gray-100 text-[var(--primary-color)]'}`}>
                            {member.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => toggleEditingRole(member.id)}
                            className="text-[var(--accent-color)] hover:text-blue-900"
                          >
                            {member.isEditingRole ? 'Save' : 'Edit Role'}
                          </button>
                          {!member.isCurrentUser && (
                            <button
                              onClick={() => confirmRemoveMember(member)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-[var(--secondary-color)]">
                  Showing {indexOfFirstMember + 1} to {Math.min(indexOfLastMember, filteredMembers.length)} of {filteredMembers.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-[var(--background-color)] text-[var(--secondary-color)] cursor-not-allowed'
                        : 'bg-white text-[var(--primary-color)] hover:bg-[var(--background-color)]'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-[var(--background-color)] text-[var(--secondary-color)] cursor-not-allowed'
                        : 'bg-white text-[var(--primary-color)] hover:bg-[var(--background-color)]'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>

          {showSetupNotice && (
            <Card>
              <div className="text-center py-10">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
                <p className="text-gray-500 mb-6">
                  You haven't added any team members yet. Use the "Add Team Member" button to invite colleagues to your team.
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Note: This feature requires database tables to be set up.
                </p>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={setupTeamManagement}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="inline w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Initialize Team Management'
                  )}
                </button>
              </div>
            </Card>
          )}

          {/* Show API errors */}
          {apiError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
              <button 
                className="ml-2 text-red-700" 
                onClick={() => setApiError("")}
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Show pending invitations */}
          {invitations.length > 0 && (
            <Card>
              <SectionHeader 
                icon={UserGroupIcon} 
                title="Pending Invitations" 
                description="These users have been invited but haven't joined yet."
              />
              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invitation) => (
                      <tr key={invitation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invitation.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invitation.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              console.log('Cancel button clicked for invitation:', invitation);
                              setInvitationToRemove(invitation);
                              setRemoveModalOpen(true);
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Add Member Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Invite Team Member</h3>
                <button onClick={() => setAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="colleague@example.com"
                    disabled={addingMember}
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="role"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={addingMember}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
                
                {addMemberError && (
                  <div className="text-red-500 text-sm">{addMemberError}</div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={addingMember}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                    disabled={addingMember}
                  >
                    {addingMember ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      'Invite Member'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Member Modal */}
        {removeModalOpen && (memberToRemove || invitationToRemove) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              {memberToRemove ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">Remove Team Member</h3>
                  <p className="text-[var(--secondary-color)]">
                    Are you sure you want to remove {memberToRemove.name} from the team?
                    This action cannot be undone.
                  </p>
                </>
              ) : invitationToRemove && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Cancel Invitation</h3>
                  <p className="text-[var(--secondary-color)]">
                    Are you sure you want to cancel the invitation sent to {invitationToRemove.email}?
                    This action cannot be undone.
                  </p>
                </>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={cancelRemove}
                  className="px-4 py-2 text-[var(--primary-color)] bg-[var(--background-color)] rounded-lg 
                    hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveMember}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg 
                    hover:bg-red-700 transition-colors duration-200"
                >
                  {memberToRemove ? 'Remove' : 'Cancel Invitation'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg 
                shadow-lg flex items-center"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TeamManagementPage;
