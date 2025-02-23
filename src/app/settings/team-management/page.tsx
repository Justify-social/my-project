"use client";

import React, { useState, ChangeEvent, useCallback, FormEvent, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircleIcon, ArrowPathIcon, CheckCircleIcon, PlusIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import NavigationTabs from '../components/NavigationTabs';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User";
  isEditingRole?: boolean;
  isCurrentUser?: boolean;
}

const initialTeamMembers: TeamMember[] = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'Admin', isCurrentUser: false },
  { id: 2, name: 'John Doe', email: 'john.doe@example.com', role: 'User', isCurrentUser: true },
  { id: 3, name: 'Alice Smith', email: 'alice.smith@example.com', role: 'User', isCurrentUser: false },
  // Add more dummy data as needed
];

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
    <div className="bg-blue-50 p-3 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600" />
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Modal states for removing a member
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  // Modal states for adding a new member
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"Admin" | "User">("User");
  const [addMemberError, setAddMemberError] = useState("");

  // Search and Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 10;

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
  const handleRoleChange = (id: number, newRole: "Admin" | "User") => {
    const member = teamMembers.find(m => m.id === id);
    if (!member) return;
    if (member.role === "Admin" && newRole === "User") {
      const adminCount = teamMembers.filter(m => m.role === "Admin").length;
      if (adminCount <= 1) {
        alert("Error: At least one Admin is required.");
        return;
      }
    }
    const updatedMembers = teamMembers.map(m =>
      m.id === id ? { ...m, role: newRole, isEditingRole: false } : m
    );
    setTeamMembers(updatedMembers);
    setIsDirty(true);
  };

  // Toggle the editing mode for a member's role
  const toggleEditingRole = (id: number) => {
    const updatedMembers = teamMembers.map(m =>
      m.id === id ? { ...m, isEditingRole: !m.isEditingRole } : m
    );
    setTeamMembers(updatedMembers);
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
  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    const updatedMembers = teamMembers.filter(m => m.id !== memberToRemove.id);
    if (updatedMembers.filter(m => m.role === "Admin").length < 1) {
      alert("Error: At least one Admin is required.");
      return;
    }
    setTeamMembers(updatedMembers);
    setIsDirty(true);
    setRemoveModalOpen(false);
    setMemberToRemove(null);
  };

  // Cancel the removal modal
  const cancelRemove = () => {
    setRemoveModalOpen(false);
    setMemberToRemove(null);
  };

  // Handler to add a new team member
  const handleAddMember = () => {
    if (!newMemberName || !newMemberEmail) {
      setAddMemberError("Error: Please fill all fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      setAddMemberError("Error: Please enter a valid email address.");
      return;
    }
    if (teamMembers.some(m => m.email.toLowerCase() === newMemberEmail.toLowerCase())) {
      setAddMemberError("Error: This user is already part of the team.");
      return;
    }
    const newMember: TeamMember = {
      id: Date.now(),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      isCurrentUser: false,
    };
    setTeamMembers([...teamMembers, newMember]);
    setIsDirty(true);
    setAddModalOpen(false);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberRole("User");
    setAddMemberError("");
    alert(`${newMember.name} has been added to the team.`);
  };

  // Primary action: Cancel reverts changes back to the initial state.
  const handleCancel = () => {
    setTeamMembers(initialTeamMembers);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900"
            >
              Team Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-gray-500"
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
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
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
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
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
                  Save Changes
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
                  className="pl-10 pr-4 py-2 w-[400px] border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                  transition-colors duration-200 font-medium flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Team Member
              </motion.button>
            </div>

            {/* Team Members Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMembers.map(member => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.isEditingRole ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as "Admin" | "User")}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 
                              focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${member.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {member.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => toggleEditingRole(member.id)}
                            className="text-blue-600 hover:text-blue-900"
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
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstMember + 1} to {Math.min(indexOfLastMember, filteredMembers.length)} of {filteredMembers.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Add Member Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                      focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                      focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as "Admin" | "User")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                      focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                {addMemberError && (
                  <p className="text-sm text-red-600">{addMemberError}</p>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setAddModalOpen(false);
                    setNewMemberName("");
                    setNewMemberEmail("");
                    setNewMemberRole("User");
                    setAddMemberError("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg 
                    hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                    hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Member
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Remove Member Modal */}
        {removeModalOpen && memberToRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Remove Team Member</h3>
              <p className="text-gray-600">
                Are you sure you want to remove {memberToRemove.name} from the team?
                This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={cancelRemove}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg 
                    hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveMember}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg 
                    hover:bg-red-700 transition-colors duration-200"
                >
                  Remove
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
