"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon, ButtonIcon, StaticIcon, DeleteIcon } from '@/components/ui/icons';

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

interface MembersListProps {
  members: TeamMember[];
  invitations?: Invitation[];
  onRoleChange: (id: string, newRole: string) => void;
  onRemoveMember: (id: string) => void;
  onCancelInvitation?: (id: string) => void;
  isLoading?: boolean;
  error?: string;
}

/**
 * MembersList component for the Team Management page
 * Displays a table of team members with sorting and pagination
 */
const MembersList: React.FC<MembersListProps> = ({
  members,
  invitations = [],
  onRoleChange,
  onRemoveMember,
  onCancelInvitation,
  isLoading = false,
  error
}) => {
  // Log rendering state for debugging
  console.log("MembersList rendering with:", { 
    memberCount: members.length, 
    invitationCount: invitations.length,
    isLoading, 
    hasError: !!error,
    members 
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // State for sorting
  const [sortField, setSortField] = useState<keyof TeamMember>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle sort toggle
  const handleSort = (field: keyof TeamMember) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort members
  const filteredMembers = members.filter(member => {
    return (
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = sortedMembers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
  
  // The pagination buttons
  const PaginationButton = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center px-3 py-1 rounded ${
        disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-white text-[#4A5568] hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Icon name="spinner" spin size="xl" className="text-[#00BFFF] text-3xl animate-spin"></Icon>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <div className="flex items-center text-red-500 mb-2">
          <WarningIcon name="circleExclamation" size="lg" className="mr-3" />
          <span className="text-lg font-medium">Unable to load team members</span>
        </div>
        <p className="text-[#4A5568]">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-[#00BFFF] text-white rounded-lg hover:bg-opacity-90 transition-colors"
          onClick={() => {}}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (members.length === 0 && invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <StaticIcon name="usersSlash" size="3xl" className="text-gray-400 mb-4" />
        <p className="text-lg font-medium text-[#4A5568]">No team members found</p>
        <p className="text-sm text-[#4A5568] mt-1">
          {searchQuery ? 'Try a different search term or' : 'Get started by'} adding your first team member
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Search and filter bar */}
      <div className="flex justify-between mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <StaticIcon name="search" size="md" className="text-[#4A5568]" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-[#D1D5DB] rounded-lg focus:ring-[#00BFFF] focus:border-[#00BFFF]"
          />
        </div>
        
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="border border-[#D1D5DB] rounded-lg px-2 text-sm focus:ring-[#00BFFF] focus:border-[#00BFFF]"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
        </select>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto border border-[#D1D5DB] rounded-lg">
        <table className="min-w-full divide-y divide-[#D1D5DB]">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {sortField === 'name' && (
                    <Icon 
                      name={sortDirection === 'asc' ? 'arrowUp' : 'arrowDown'} 
                      size="sm" 
                      className="ml-1" 
                    />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center">
                  Email
                  {sortField === 'email' && (
                    <Icon 
                      name={sortDirection === 'asc' ? 'arrowUp' : 'arrowDown'} 
                      size="sm" 
                      className="ml-1" 
                    />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center">
                  Role
                  {sortField === 'role' && (
                    <Icon 
                      name={sortDirection === 'asc' ? 'arrowUp' : 'arrowDown'} 
                      size="sm" 
                      className="ml-1" 
                    />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider"
              >
                Added
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#D1D5DB]">
            {currentMembers.length === 0 && invitations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-[#4A5568]">
                  {searchQuery ? 'No members match your search.' : 'No team members found.'}
                </td>
              </tr>
            ) : (
              <>
                {/* Team Members */}
                {currentMembers.map((member) => (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#333333]">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5568]">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5568]">
                      <select
                        value={member.role}
                        onChange={(e) => onRoleChange(member.id, e.target.value)}
                        className="border border-[#D1D5DB] rounded-md shadow-sm text-sm focus:ring-[#00BFFF] focus:border-[#00BFFF]"
                      >
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5568]">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={member.role === 'OWNER'}
                        title={member.role === 'OWNER' ? 'Cannot remove owner' : 'Remove member'}
                      >
                        <DeleteIcon name="trash" size="sm" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                
                {/* Pending Invitations */}
                {invitations && invitations.map((invitation) => (
                  <motion.tr 
                    key={`invitation-${invitation.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-blue-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5568]">
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">Pending</span>
                        <span>Invitation</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5568]">
                      {invitation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5568]">
                      {invitation.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5568]">
                      {new Date(invitation.invitedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {onCancelInvitation && (
                        <button
                          onClick={() => onCancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Cancel invitation"
                        >
                          <DeleteIcon name="xmark" size="sm" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-[#4A5568]">
            Showing {currentMembers.length} of {filteredMembers.length} members
          </div>
          <div className="flex space-x-2">
            <PaginationButton
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <Icon name="chevronLeft" size="sm" className="mr-1" />
              Previous
            </PaginationButton>
            <PaginationButton
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <Icon name="chevronRight" size="sm" className="ml-1" />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList; 