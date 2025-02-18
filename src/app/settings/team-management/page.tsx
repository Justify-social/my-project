"use client";

import React, { useState, ChangeEvent, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="p-8">
      {/* Page Title & Primary Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#333333]">Team Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            type="button"
            className="w-36 h-10 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            type="button"
            disabled={!isDirty || isLoading}
            className={`w-36 h-10 rounded text-white ${!isDirty || isLoading ? 'bg-blue-300' : 'bg-blue-500'}`}
          >
            {isLoading ? "Loading..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-300">
        <nav className="flex space-x-4">
          <button
            onClick={() => router.push('/settings')}
            className="py-2 px-4 text-blue-500 hover:underline"
          >
            Profile Settings
          </button>
          <button
            onClick={() => router.push('/settings/team-management')}
            className="py-2 px-4 font-bold border-b-2 border-blue-500"
            aria-current="page"
          >
            Team Management
          </button>
          <button
            onClick={() => router.push('/settings/branding')}
            className="py-2 px-4 text-blue-500 hover:underline"
          >
            Branding
          </button>
        </nav>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          aria-label="Search team members"
          className="w-[400px] p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Team Members Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="p-2 text-left font-bold border">Name</th>
              <th className="p-2 text-left font-bold border">Email</th>
              <th className="p-2 text-left font-bold border">Role</th>
              <th className="p-2 text-left font-bold border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentMembers.map(member => (
              <tr key={member.id} className="hover:bg-gray-100">
                <td className="p-2 border">{member.name}</td>
                <td className="p-2 border">{member.email}</td>
                <td className="p-2 border">
                  {member.isEditingRole ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as "Admin" | "User")}
                      onBlur={() => toggleEditingRole(member.id)}
                      aria-label="Change role dropdown"
                      className="p-1 border border-gray-300 rounded"
                    >
                      <option value="Admin">Admin</option>
                      <option value="User">User</option>
                    </select>
                  ) : (
                    <span>{member.role}</span>
                  )}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => toggleEditingRole(member.id)}
                    type="button"
                    className="mr-2 bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Change Role
                  </button>
                  <button
                    onClick={() => confirmRemoveMember(member)}
                    type="button"
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {currentMembers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-2 text-center">
                  No team members found. Try adjusting your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

      {/* Add New Member Button */}
      <div className="mb-6">
        <button
          onClick={() => setAddModalOpen(true)}
          type="button"
          className="bg-blue-500 text-white px-5 py-2 rounded"
        >
          Add New Member
        </button>
      </div>

      {/* Add Member Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="text-xl font-bold mb-4">Add New Member</h2>
            <div className="mb-4">
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Email Address</label>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Assign Role</label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as "Admin" | "User")}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
            {addMemberError && <p className="text-red-500 mb-4">{addMemberError}</p>}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setAddModalOpen(false); setAddMemberError(""); }}
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                type="button"
                disabled={!newMemberName || !newMemberEmail}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {removeModalOpen && memberToRemove && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="text-xl font-bold mb-4">Confirm Removal</h2>
            <p className="mb-4">
              Are you sure you want to remove {memberToRemove.name} from the team? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelRemove}
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;
