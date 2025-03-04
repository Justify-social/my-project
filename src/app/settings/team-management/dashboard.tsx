'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

interface TeamMember {
  id: string;
  memberId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function TeamDashboard() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings/team');
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to fetch team data');
        return;
      }
      
      setMembers(data.members || []);
      setInvitations(data.invitations || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      setError('Failed to fetch team data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/settings/team/invitation/${invitationId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to cancel invitation');
        return;
      }
      
      toast.success('Invitation cancelled successfully');
      // Refresh the team data
      fetchTeamData();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation. Please try again later.');
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/settings/team/invitation/${invitationId}/resend`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to resend invitation');
        return;
      }
      
      toast.success('Invitation resent successfully');
      // Refresh the team data
      fetchTeamData();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation. Please try again later.');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/settings/team/member/${memberId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to remove team member');
        return;
      }
      
      toast.success('Team member removed successfully');
      // Refresh the team data
      fetchTeamData();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member. Please try again later.');
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/settings/team/member/${memberId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to update member role');
        return;
      }
      
      toast.success('Member role updated successfully');
      // Refresh the team data
      fetchTeamData();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role. Please try again later.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={fetchTeamData} 
              className="mt-2 text-sm text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Team Members Section */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
        
        {members.length === 0 ? (
          <p className="text-gray-500 italic">No team members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.id, e.target.value)}
                        className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeMember(member.id)}
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
        )}
      </section>
      
      {/* Pending Invitations Section */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Invitations</h3>
        
        {invitations.length === 0 ? (
          <p className="text-gray-500 italic">No pending invitations.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invitation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invitation.role.charAt(0) + invitation.role.slice(1).toLowerCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invitation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        invitation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invitation.status.charAt(0) + invitation.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invitation.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => resendInvitation(invitation.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => cancelInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
} 