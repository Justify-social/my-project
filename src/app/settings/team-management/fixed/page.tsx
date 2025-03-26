'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/settings/shared/Card';
import DebugWrapper from '@/components/settings/shared/DebugWrapper';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Simple mock data
const mockMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'OWNER' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'MEMBER' }
];

export default function FixedTeamManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setMembers(mockMembers);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load team members');
        setIsLoading(false);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Team Management (Fixed)</h1>
      
      <DebugWrapper title="Page State" dataInfo={{ isLoading, memberCount: members.length, hasError: !!error }}>
        <div className="bg-yellow-100 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">Debug Controls</h3>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsLoading(prev => !prev)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Toggle Loading
            </button>
            <button 
              onClick={() => console.log({ members, isLoading, error })}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Log State
            </button>
          </div>
        </div>
      </DebugWrapper>
      
      {isLoading ? (
        <Card>
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </Card>
      ) : error ? (
        <Card>
          <div className="p-6 text-red-500 flex items-center justify-center">
            <p>{error}</p>
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-xl font-bold mb-6">Team Members</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
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
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {member.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
} 