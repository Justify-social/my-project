import React, { useState } from 'react';
import Card from '@/components/settings/shared/Card';
import MembersListDebug from '@/src/components/features/settings/team/MembersListDebug';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const mockMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'OWNER',
    createdAt: new Date(2023, 0, 15).toISOString()
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
    createdAt: new Date(2023, 4, 5).toISOString()
  }
];

export default function TeamManagementDebug() {
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Simple handlers that don't require API calls
  const handleRoleChange = (id: string, newRole: string) => {
    console.log(`Changing role for ${id} to ${newRole}`);
    setMembers(prev => 
      prev.map(member => member.id === id ? {...member, role: newRole} : member)
    );
  };
  
  const handleRemoveMember = (id: string) => {
    console.log(`Removing member ${id}`);
    setMembers(prev => prev.filter(member => member.id !== id));
  };
  
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Team Management Debug</h1>
      
      {/* Debug Controls */}
      <div className="bg-yellow-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Debug Controls</h3>
        <div className="flex space-x-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Toggle Modal
          </button>
          <button 
            onClick={() => console.log({members})}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Log Data
          </button>
          <button 
            onClick={() => setMembers(mockMembers)}
            className="bg-purple-500 text-white px-3 py-1 rounded"
          >
            Reset Data
          </button>
        </div>
      </div>
      
      {/* Members Section */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Team Members</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="border border-gray-300 rounded-md text-sm"
                    >
                      <option value="OWNER">Owner</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Debug Modal</h3>
            <p className="mb-4">This is a test modal for debugging purposes.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 